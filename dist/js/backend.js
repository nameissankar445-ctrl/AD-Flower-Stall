/* AD Flower Stall — Supabase backend bridge (loaded before main.js).
   Everything here is best-effort: if the backend is unreachable the site still works through WhatsApp. */
(function () {
  'use strict';
  var cfg = window.ADFS_SUPABASE || {};
  var ready = !!(cfg.url && cfg.anonKey && cfg.url.indexOf('http') === 0);
  var sbP = null;
  function sb() {
    if (!ready) return Promise.reject(new Error('backend not configured'));
    if (sbP) return sbP;
    sbP = new Promise(function (res, rej) {
      if (window.supabase) return res(window.supabase.createClient(cfg.url, cfg.anonKey));
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
      s.onload = function () { res(window.supabase.createClient(cfg.url, cfg.anonKey)); };
      s.onerror = rej; document.head.appendChild(s);
    });
    return sbP;
  }

  /* session + attribution */
  var sid; try { sid = sessionStorage.getItem('adfs_sid'); if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('adfs_sid', sid); } } catch (e) { sid = 'na'; }
  var qs = new URLSearchParams(location.search);
  var utm = { utm_source: qs.get('utm_source'), utm_medium: qs.get('utm_medium'), utm_campaign: qs.get('utm_campaign') };
  try { if (utm.utm_source) sessionStorage.setItem('adfs_utm', JSON.stringify(utm)); else utm = JSON.parse(sessionStorage.getItem('adfs_utm') || 'null') || utm; } catch (e) {}
  var device = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  var who = {}; try { who = JSON.parse(localStorage.getItem('adfs_who') || '{}') || {}; } catch (e) {}
  function remember(name, phone) { who = { name: name || who.name || null, phone: phone || who.phone || null }; try { localStorage.setItem('adfs_who', JSON.stringify(who)); } catch (e) {} }
  var code = function (p) { return p + '-' + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).toUpperCase().slice(2, 5); };
  var ymd = function () { var d = new Date(); return String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); };

  function track(event, data) {
    data = data || {};
    if (window.gtag) { var g = { whatsapp_click: 'generate_lead', order_placed: 'purchase' }[event] || event; try { window.gtag('event', g, { value: data.value, currency: 'INR', product_id: data.product_id, category: data.category, method: data.meta && data.meta.source }); } catch (e) {} }
    if (!ready) return;
    sb().then(function (c) {
      return c.from('analytics_events').insert({
        session_id: sid, event: event, page_path: location.pathname + location.hash, product_id: data.product_id || null,
        category: data.category || null, value: data.value == null ? null : data.value, meta: data.meta || null,
        referrer: document.referrer || null, utm_source: utm.utm_source, utm_medium: utm.utm_medium, utm_campaign: utm.utm_campaign, device: device
      });
    }).catch(function () {});
  }

  /* Record a WhatsApp click as a lead. Returns the ref code immediately (insert happens in background). */
  function lead(o) {
    o = o || {};
    var ref = code('WA');
    if (o.name || o.phone) remember(o.name, o.phone);
    track('whatsapp_click', { product_id: o.product_id, meta: { source: o.source, intent: o.intent, ref: ref } });
    if (ready) sb().then(function (c) {
      return c.from('whatsapp_leads').insert({
        ref_code: ref, name: who.name, phone: who.phone, source: o.source || 'other', intent: o.intent || 'order',
        product_id: o.product_id || null, order_id: o.order_id || null, page_path: location.pathname + location.hash,
        message_sent: o.message || null, utm_source: utm.utm_source, utm_medium: utm.utm_medium, utm_campaign: utm.utm_campaign, device: device, session_id: sid
      });
    }).catch(function () {});
    return ref;
  }

  /* Save a cart order. Returns {order_number, id} via promise; never throws. */
  function order(o) {
    var num = o.order_number || ('ADF-' + ymd() + '-' + Math.random().toString(36).toUpperCase().slice(2, 6));
    remember(o.customer_name, o.phone);
    track('order_placed', { value: o.total, meta: { order_number: num, items: o.items.length } });
    if (!ready) return Promise.resolve({ order_number: num, id: null });
    var oid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); });
    return sb().then(function (c) {
      return c.from('orders').insert({
        id: oid, order_number: num, customer_name: o.customer_name || null, phone: o.phone || null, delivery_type: o.delivery_type || 'pickup',
        address: o.address || null, needed_on: o.needed_on || null, note: o.note || null, subtotal: o.total, total: o.total
      }).then(function (r) {
        if (r.error) throw r.error;
        var items = o.items.map(function (it) { return { order_id: oid, product_id: it.product_id, product_name: it.name, unit: it.unit, unit_price: it.price, qty: it.qty, line_total: it.qty * it.price }; });
        return c.from('order_items').insert(items).then(function () { return { order_number: num, id: oid }; });
      });
    }).catch(function () { return { order_number: num, id: null }; });
  }

  function quote(q) {
    remember(q.name, q.phone);
    track('form_submit', { meta: { form: 'quote', occasion: q.occasion } });
    if (!ready) return Promise.resolve(null);
    return sb().then(function (c) {
      return c.from('quote_requests').insert({ name: q.name, phone: q.phone || who.phone || null, event_date: q.event_date || null, occasion: q.occasion || null, message: q.message || null });
    }).then(function (r) { return r.error ? null : { ok: true }; }).catch(function () { return null; });
  }

  /* Live product list (falls back to the hard-coded list when offline). */
  function products() {
    if (!ready) return Promise.resolve(null);
    return sb().then(function (c) {
      return c.from('products').select('id,name,unit,price,sale_price,description,image_key,image_url,stock_status,categories(name)').eq('active', true).order('sort_order');
    }).then(function (r) {
      if (r.error || !r.data || !r.data.length) return null;
      return r.data.map(function (p) {
        return { id: p.id, n: p.name, u: p.unit, p: +(p.sale_price || p.price), c: p.categories ? p.categories.name : '', i: p.image_key, img: p.image_url || null, d: p.description || '', stock: p.stock_status };
      });
    }).catch(function () { return null; });
  }

  /* Site settings from the admin (WhatsApp number, phone, hours, address). Applied to the page once loaded. */
  var settingsP = null;
  function settings() {
    if (!ready) return Promise.resolve(null);
    if (settingsP) return settingsP;
    settingsP = sb().then(function (c) { return c.from('site_settings').select('key,value'); }).then(function (r) {
      if (r.error || !r.data) return null;
      var o = {}; r.data.forEach(function (x) { o[x.key] = x.value || {}; }); return o;
    }).catch(function () { return null; });
    return settingsP;
  }
  function applySettings(S) {
    if (!S || !S.business) return;
    var b = S.business, wa = String(b.whatsapp || '').replace(/\D/g, '');
    if (wa) document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) { a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + wa); });
    document.querySelectorAll('[data-set]').forEach(function (el) {
      var k = el.dataset.set, v = k === 'phone' ? b.phone : k === 'hours' ? b.hours : k === 'address' ? b.address : k === 'name' ? b.name : null;
      if (v) el.textContent = v;
    });
    if (b.phone) document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.href = 'tel:' + String(b.phone).replace(/[^\d+]/g, ''); });
  }
  settings().then(applySettings);

  /* Any plain wa.me link on the page gets tracked too (hero, occasions, header, floating button). */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="wa.me"]'); if (!a || a.dataset.tracked) return;
    var sec = a.closest('section,header,footer'); var src = a.classList.contains('wa') ? 'float' : (sec && sec.id) ? sec.id : (sec ? sec.tagName.toLowerCase() : 'page');
    var intent = /quote|wedding|puja|function|festival|supply/i.test(a.href) ? 'quote' : 'order';
    lead({ source: src, intent: intent, message: decodeURIComponent((a.href.split('text=')[1] || '').replace(/\+/g, ' ')) });
  }, true);

  track('page_view');
  window.ADFS = { ready: ready, track: track, lead: lead, order: order, quote: quote, products: products, settings: settings, who: function () { return who; }, remember: remember };
})();
