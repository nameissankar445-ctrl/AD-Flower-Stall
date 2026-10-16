(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var cfg = window.ADFS_SUPABASE || {};
  var configured = cfg.url && cfg.anonKey && cfg.url.indexOf('PASTE_') !== 0 && cfg.anonKey.indexOf('PASTE_') !== 0;
  var page = document.body.dataset.page; // 'login' | 'dash'
  var msg = $('#msg');
  function say(t, bad) { if (!msg) return; msg.textContent = t; msg.className = 'msg ' + (bad ? 'bad' : 'ok'); msg.hidden = !t; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var rupee = function (n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); };

  if (!configured) {
    say('Supabase is not connected yet. Add the project URL and anon key in js/supabase-config.js.', true);
    var f = $('#lf'); if (f) f.querySelectorAll('input,button').forEach(function (e) { e.disabled = true; });
    if (page === 'dash') location.replace('/admin/login.html');
    return;
  }
  if (!window.supabase) { say('Could not load the sign-in library. Check your internet connection.', true); return; }
  var sb = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true } });

  // Only users listed in the admin_users table may enter.
  async function isAdmin(user) {
    var r = await sb.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
    return !r.error && !!r.data;
  }

  if (page === 'login') {
    var show = function () { document.body.classList.remove('chk'); }; setTimeout(show, 2500);
    sb.auth.getSession().then(async function (r) {
      var s = r.data && r.data.session;
      if (s && await isAdmin(s.user)) { location.replace('/admin/'); return; }
      show();
    }).catch(show);
    $('#lf').addEventListener('submit', async function (e) {
      e.preventDefault(); say('');
      var btn = $('#go'), email = $('#em').value.trim(), pw = $('#pw').value;
      btn.disabled = true; btn.textContent = 'Signing in…';
      var r = await sb.auth.signInWithPassword({ email: email, password: pw });
      if (r.error) { say('Wrong email or password.', true); btn.disabled = false; btn.textContent = 'Sign in'; return; }
      if (!(await isAdmin(r.data.user))) {
        await sb.auth.signOut(); say('This account does not have admin access.', true); btn.disabled = false; btn.textContent = 'Sign in'; return;
      }
      location.replace('/admin/');
    });
    $('#sp').addEventListener('click', function () { var p = $('#pw'); var show = p.type === 'password'; p.type = show ? 'text' : 'password'; this.textContent = show ? 'Hide' : 'Show'; });
  }

  if (page === 'dash') {
    var d = { orders: [], products: [], cats: [], quotes: [], enq: [], leads: [], events: [], sample: false };
    var now0 = Date.now(), H = function (h) { return new Date(now0 - h * 36e5).toISOString(); };
    var SAMPLE = {
      cats: [{ id: 1, name: 'Marigold' }, { id: 2, name: 'Chamanthi' }, { id: 3, name: 'Rose' }, { id: 4, name: 'Jasmine' }, { id: 5, name: 'Puja' }],
      orders: [
        { id: 's1', order_number: 'ADF-261016-0004', customer_name: 'Lakshmi Devi', phone: '98480 12345', delivery_type: 'delivery', address: 'Brodipet 4/2, Guntur', total: 540, status: 'new', created_at: H(1) },
        { id: 's2', order_number: 'ADF-261016-0003', customer_name: 'Ravi Kumar', phone: '99123 45678', delivery_type: 'pickup', total: 180, status: 'confirmed', created_at: H(2) },
        { id: 's3', order_number: 'ADF-261015-0012', customer_name: 'Sri Temple Trust', phone: '90300 11223', delivery_type: 'delivery', address: 'Arundelpet, Guntur', total: 2400, status: 'preparing', created_at: H(20) },
        { id: 's4', order_number: 'ADF-261015-0009', customer_name: 'Anitha R', phone: '98660 55443', delivery_type: 'delivery', total: 320, status: 'ready', created_at: H(26) },
        { id: 's5', order_number: 'ADF-261014-0021', customer_name: 'Venkatesh', phone: '97010 98765', delivery_type: 'pickup', total: 120, status: 'delivered', created_at: H(50) },
        { id: 's6', order_number: 'ADF-261014-0017', customer_name: 'Padma', phone: '94400 22110', delivery_type: 'delivery', total: 860, status: 'cancelled', created_at: H(52) }
      ],
      products: [
        { id: 1, name: 'Orange Marigold (Banthi)', category_id: 1, unit: 'Per kg, loose', price: 120, stock_status: 'in_stock', active: true, image_key: 'marigold-orange', categories: { name: 'Marigold' } },
        { id: 2, name: 'Marigold Garland', category_id: 1, unit: 'Per metre', price: 60, stock_status: 'low', active: true, image_key: 'marigold-garlands', categories: { name: 'Marigold' } },
        { id: 3, name: 'Sent Yellow Chamanthi', category_id: 2, unit: 'Per kg', price: 160, stock_status: 'in_stock', active: true, image_key: 'chamanthi-yellow', categories: { name: 'Chamanthi' } },
        { id: 6, name: 'Red Rose', category_id: 3, unit: 'Bunch of 10', price: 120, stock_status: 'low', active: true, image_key: 'rose-red', categories: { name: 'Rose' } },
        { id: 10, name: 'Jasmine Strings', category_id: 4, unit: 'Per hand', price: 40, stock_status: 'in_stock', active: true, image_key: 'jasmine-strand', categories: { name: 'Jasmine' } },
        { id: 11, name: 'Lotus (Padmam)', category_id: 5, unit: 'Per piece', price: 25, stock_status: 'out_of_stock', active: false, image_key: 'lotus-pink', categories: { name: 'Puja' } }
      ],
      quotes: [{ id: 'q1', name: 'Suresh Babu', phone: '99890 11122', occasion: 'Wedding', message: 'Need 4 varmala garlands and bridal jasmine for 12 Dec.', status: 'new', created_at: H(3) }],
      enq: [{ id: 'e1', name: 'Mahalakshmi Temple', phone: '98490 77889', subject: 'Regular supply', message: 'Daily loose marigold and lotus, about 5 kg.', status: 'replied', created_at: H(30) }],
      leads: [
        { id: 'l1', ref_code: 'WA-00012', source: 'cart', intent: 'order', name: 'Lakshmi Devi', phone: '98480 12345', status: 'converted', created_at: H(1) },
        { id: 'l2', ref_code: 'WA-00011', source: 'hero', intent: 'order', name: null, phone: null, status: 'new', created_at: H(2) },
        { id: 'l3', ref_code: 'WA-00010', source: 'quote', intent: 'quote', name: 'Suresh Babu', phone: '99890 11122', status: 'replied', created_at: H(3) },
        { id: 'l4', ref_code: 'WA-00009', source: 'float', intent: 'order', name: null, phone: null, status: 'new', created_at: H(9) },
        { id: 'l5', ref_code: 'WA-00008', source: 'visit', intent: 'other', name: null, phone: null, status: 'no_response', created_at: H(28) }
      ]
    };

    var tryLoad = async function (table, order, sel) {
      var q = sb.from(table).select(sel || '*'); if (order) q = q.order(order, { ascending: false });
      var r = await q.limit(500); return r.error ? null : r.data;
    };
    var fmtDate = function (s) { var t = new Date(s); return isNaN(t) ? '' : t.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); };
    var label = function (s) { return String(s || '').replace(/_/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }); };
    var pill = function (s) { return '<span class="pill s-' + esc(s) + '">' + esc(label(s)) + '</span>'; };
    var digits = function (p) { return String(p || '').replace(/\D/g, '').slice(-10); };
    var waLink = function (p, text) { return 'https://wa.me/91' + digits(p) + (text ? '?text=' + encodeURIComponent(text) : ''); };
    var imgOf = function (p) { return p.image_url || (p.image_key ? '/assets/img/south/' + p.image_key + '.jpg' : '/assets/img/emblem.png'); };
    var ORD = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    var LEAD = ['new', 'replied', 'converted', 'no_response', 'spam'];
    var STOCK = [['in_stock', 'In stock'], ['low', 'Low stock'], ['out_of_stock', 'Out of stock']];
    var opts = function (list, cur) { return list.map(function (o) { var v = o.push ? o[0] : o, t = o.push ? o[1] : label(o); return '<option value="' + v + '"' + (v === cur ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join(''); };

    function toast(t, bad) { var e = $('#toast'); e.textContent = t; e.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(toast.t); toast.t = setTimeout(function () { e.className = 'toast'; }, 2800); }
    async function save(table, id, patch) {
      if (d.sample) { toast('Sample data — create the database tables to save changes.', true); return false; }
      var r = await sb.from(table).update(patch).eq('id', id);
      if (r.error) { toast('Could not save: ' + r.error.message, true); return false; }
      toast('Saved ✓'); return true;
    }

    /* ---------- dashboard ---------- */
    function drawDash() {
      var now = new Date(), today = now.toDateString(), wk = now.getTime() - 7 * 864e5;
      var live = d.orders.filter(function (o) { return o.status !== 'cancelled'; });
      var tOrd = d.orders.filter(function (o) { return d.sample ? o.id === 's1' || o.id === 's2' : new Date(o.created_at).toDateString() === today; }).length;
      $('#sOrd').textContent = tOrd;
      var leadsToday = d.leads.filter(function (l) { return d.sample ? ['l1', 'l2', 'l3', 'l4'].indexOf(l.id) > -1 : new Date(l.created_at).toDateString() === today; }).length;
      var newLeads = d.leads.filter(function (l) { return l.status === 'new'; }).length;
      $('#sWa').textContent = leadsToday; $('#tWa').textContent = newLeads + ' waiting for a reply';
      var rev = live.filter(function (o) { return d.sample || new Date(o.created_at).getTime() >= wk; }).reduce(function (a, o) { return a + Number(o.total || 0); }, 0);
      $('#sRev').textContent = rupee(rev);
      var low = d.products.filter(function (p) { return p.active !== false && p.stock_status !== 'in_stock'; });
      $('#sLow').textContent = low.length;
      $('#mOrd').textContent = d.sample ? 2710 : d.events.length;
      $('#mEnq').textContent = d.leads.filter(function (l) { return d.sample || new Date(l.created_at).getTime() >= wk; }).length;
      $('#mProd').textContent = d.products.filter(function (p) { return p.active !== false; }).length;
      $('#tOrdAll').textContent = d.orders.length + ' total';
      $('#upd').textContent = 'Last updated: ' + now.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
      $('#nOrd').textContent = d.orders.filter(function (o) { return o.status === 'new'; }).length || '';
      $('#nLead').textContent = newLeads || '';
      $('#nQ').textContent = (d.quotes.filter(function (q) { return q.status === 'new'; }).length + d.enq.filter(function (q) { return q.status === 'new'; }).length) || '';
      $('#tRecent').innerHTML = d.orders.slice(0, 5).map(function (o) { return '<tr class="clk" data-order="' + esc(o.id) + '"><td><b>' + esc(o.order_number) + '</b><small>' + esc(fmtDate(o.created_at)) + '</small></td><td>' + esc(o.customer_name || '—') + '</td><td>' + rupee(o.total) + '</td><td>' + pill(o.status) + '</td></tr>'; }).join('') || '<tr><td colspan="4" class="empty">No orders yet.</td></tr>';
      var hr = now.getHours();
      $('#dHi').textContent = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
      $('#dDate').textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      var days = [], vals = [];
      for (var k = 6; k >= 0; k--) { var t = new Date(now.getTime() - k * 864e5); days.push(t.toLocaleDateString('en-IN', { weekday: 'short' })); vals.push(d.sample ? [320, 540, 0, 860, 1200, 640, 540][6 - k] : live.filter(function (o) { return new Date(o.created_at).toDateString() === t.toDateString(); }).reduce(function (a, o) { return a + Number(o.total || 0); }, 0)); }
      var mx = Math.max.apply(null, vals.concat([1])), tot = vals.reduce(function (a, b) { return a + b; }, 0);
      $('#rvTot').textContent = rupee(tot) + ' total';
      $('#bars').innerHTML = vals.map(function (v, n) { return '<div class="bar' + (v === mx && v > 0 ? ' hi' : '') + '"><em>' + (v ? rupee(v) : '') + '</em><i style="height:' + Math.max(3, v / mx * 100) + '%"></i><span>' + days[n] + '</span></div>'; }).join('');
      var ST = { new: '#E0314B', confirmed: '#F2B01E', preparing: '#F97316', ready: '#3B82F6', delivered: '#22A06B', cancelled: '#9CA3AF' };
      var tn = Math.max(d.orders.length, 1);
      $('#stt').innerHTML = ORD.map(function (s) { var c = d.orders.filter(function (o) { return o.status === s; }).length; return '<div class="sr"><span>' + label(s) + '</span><div class="tr"><i style="width:' + (c / tn * 100) + '%;background:' + ST[s] + '"></i></div><b>' + c + '</b></div>'; }).join('');
      var src = {}; d.leads.forEach(function (l) { src[l.source] = (src[l.source] || 0) + 1; });
      var sk = Object.keys(src).sort(function (a, b) { return src[b] - src[a]; }), sm = Math.max.apply(null, sk.map(function (k) { return src[k]; }).concat([1]));
      $('#lSrc').innerHTML = sk.map(function (k) { return '<div class="sr"><span>' + label(k) + '</span><div class="tr"><i style="width:' + src[k] / sm * 100 + '%;background:#22A06B"></i></div><b>' + src[k] + '</b></div>'; }).join('') || '<p class="empty">No WhatsApp clicks yet.</p>';
      $('#lLow').innerHTML = low.map(function (p) { return '<li>' + esc(p.name) + '<span>' + (p.stock_status === 'out_of_stock' ? 'Out' : 'Low') + '</span></li>'; }).join('') || '<li style="justify-content:center;color:#6E5A4E">All stocked up 🌼</li>';
    }

    /* ---------- orders ---------- */
    var ordFilter = 'all';
    function drawOrders() {
      var gq = ($('#gq').value || '').toLowerCase();
      var rows = d.orders.filter(function (o) { return (ordFilter === 'all' || o.status === ordFilter) && (!gq || (o.order_number + ' ' + (o.customer_name || '') + ' ' + (o.phone || '')).toLowerCase().indexOf(gq) > -1); });
      $('#tOrd').innerHTML = rows.map(function (o) { return '<tr class="clk" data-order="' + esc(o.id) + '"><td><b>' + esc(o.order_number) + '</b></td><td>' + esc(o.customer_name || '—') + '</td><td>' + esc(o.phone || '—') + '</td><td>' + esc(label(o.delivery_type)) + '</td><td>' + rupee(o.total) + '</td><td>' + pill(o.status) + '</td><td>' + esc(fmtDate(o.created_at)) + '</td></tr>'; }).join('') || '<tr><td colspan="7" class="empty">No orders here yet. Orders appear when a customer sends their cart on WhatsApp.</td></tr>';
    }
    async function openOrder(id) {
      var o = d.orders.filter(function (x) { return String(x.id) === String(id); })[0]; if (!o) return;
      var items = [];
      if (d.sample) items = [{ product_name: 'Marigold Garland', unit: 'Per metre', qty: 4, unit_price: 60, line_total: 240 }, { product_name: 'Jasmine Strings', unit: 'Per hand', qty: 5, unit_price: 40, line_total: 200 }];
      else { var r = await sb.from('order_items').select('*').eq('order_id', o.id); items = r.data || []; }
      var wa = waLink(o.phone, 'Hello ' + (o.customer_name || '') + ', this is AD Flower Stall about your order ' + o.order_number + '.');
      modal('<h3>Order ' + esc(o.order_number) + '</h3><p class="mm">' + esc(fmtDate(o.created_at)) + ' · ' + esc(label(o.delivery_type)) + '</p>' +
        '<div class="mg"><div><small>Customer</small><b>' + esc(o.customer_name || '—') + '</b></div><div><small>Phone</small><b>' + esc(o.phone || '—') + '</b></div><div class="w2"><small>Address</small><b>' + esc(o.address || (o.delivery_type === 'pickup' ? 'Pickup at stall' : '—')) + '</b></div></div>' +
        '<div class="tw"><table><thead><tr><th>Flower</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>' + (items.map(function (i) { return '<tr><td><b>' + esc(i.product_name) + '</b><small>' + esc(i.unit || '') + '</small></td><td>' + esc(i.qty) + '</td><td>' + rupee(i.unit_price) + '</td><td>' + rupee(i.line_total) + '</td></tr>'; }).join('') || '<tr><td colspan="4" class="empty">No item details saved.</td></tr>') + '</tbody></table></div>' +
        '<p class="tot">Total <b>' + rupee(o.total) + '</b></p>' +
        '<label class="fl">Status<select id="mSt">' + opts(ORD, o.status) + '</select></label>' +
        '<label class="fl">Your notes<textarea id="mNote" rows="2" placeholder="Rate agreed, delivery boy, payment received…">' + esc(o.admin_notes || '') + '</textarea></label>' +
        '<div class="mb">' + (o.phone ? '<a class="b1 wa" href="' + esc(wa) + '" target="_blank" rel="noopener">Reply on WhatsApp</a>' : '') + '<button class="b2" data-x type="button">Close</button><button class="b1" id="mSave" type="button">Save</button></div>');
      $('#mSave').onclick = async function () {
        var ok = await save('orders', o.id, { status: $('#mSt').value, admin_notes: $('#mNote').value });
        if (ok) { o.status = $('#mSt').value; o.admin_notes = $('#mNote').value; closeModal(); drawAll(); }
      };
    }

    /* ---------- WhatsApp leads ---------- */
    var leadFilter = 'all';
    function drawLeads() {
      var rows = d.leads.filter(function (l) { return leadFilter === 'all' || l.status === leadFilter; });
      var cnt = {}; d.leads.forEach(function (l) { cnt[l.status] = (cnt[l.status] || 0) + 1; });
      $('#lStat').innerHTML = [['all', 'All', d.leads.length]].concat(LEAD.map(function (s) { return [s, label(s), cnt[s] || 0]; })).map(function (x) { return '<button class="' + (leadFilter === x[0] ? 'on' : '') + '" data-s="' + x[0] + '">' + x[1] + ' <em>' + x[2] + '</em></button>'; }).join('');
      $('#tLead').innerHTML = rows.map(function (l) {
        var who = (l.name || l.phone) ? esc(l.name || '') + (l.phone ? '<small>' + esc(l.phone) + '</small>' : '') : '<span class="mut">Anonymous visitor</span>';
        var late = l.status === 'new' && (Date.now() - new Date(l.created_at).getTime()) > overdueMs();
        return '<tr' + (late ? ' class="late" title="Waiting longer than the reply target"' : '') + '><td><b>' + esc(l.ref_code) + '</b>' + (late ? '<small style="color:#E0314B">Overdue</small>' : '') + '</td><td>' + esc(label(l.source)) + '</td><td>' + pill(l.intent) + '</td><td>' + who + '</td><td>' + esc(fmtDate(l.created_at)) + '</td><td><select class="sel" data-lead="' + esc(l.id) + '">' + opts(LEAD, l.status) + '</select></td><td>' + (l.phone ? '<a class="lnk" href="' + esc(waLink(l.phone)) + '" target="_blank" rel="noopener">Chat →</a>' : '') + '</td></tr>';
      }).join('') || '<tr><td colspan="7" class="empty">No WhatsApp clicks yet. Every tap on a WhatsApp button on the website shows up here.</td></tr>';
    }

    /* ---------- products ---------- */
    var prodCat = 'all';
    function drawProducts() {
      var q = (($('#qProd').value || '') + ' ' + ($('#gq').value || '')).trim().toLowerCase();
      var cats = d.cats.length ? d.cats : SAMPLE.cats;
      $('#cProd').innerHTML = '<button data-pc="all" class="' + (prodCat === 'all' ? 'on' : '') + '">All <em>' + d.products.length + '</em></button>' + cats.map(function (c) { var n = d.products.filter(function (p) { return String(p.category_id) === String(c.id); }).length; return '<button data-pc="' + c.id + '" class="' + (String(prodCat) === String(c.id) ? 'on' : '') + '">' + esc(c.name) + ' <em>' + n + '</em></button>'; }).join('');
      $('#tProd').innerHTML = d.products.filter(function (p) { return (prodCat === 'all' || String(p.category_id) === String(prodCat)) && (!q || (p.name + ' ' + ((p.categories && p.categories.name) || '')).toLowerCase().indexOf(q) > -1); }).map(function (p) {
        return '<tr><td><div class="pn"><img src="' + esc(imgOf(p)) + '" alt=""/><div><b>' + esc(p.name) + '</b><small>' + esc((p.categories && p.categories.name) || '—') + ' · ' + esc(p.unit) + '</small></div></div></td>' +
          '<td><span class="rs">₹</span><input class="pi" type="number" min="0" step="1" value="' + esc(p.price) + '" data-price="' + esc(p.id) + '" aria-label="Price"/></td>' +
          '<td><select class="sel" data-stock="' + esc(p.id) + '">' + opts(STOCK, p.stock_status) + '</select></td>' +
          '<td><label class="sw"><input type="checkbox" data-act="' + esc(p.id) + '"' + (p.active !== false ? ' checked' : '') + '/><i></i></label></td>' +
          '<td><button class="lnk" data-edit="' + esc(p.id) + '">Edit</button></td></tr>';
      }).join('') || '<tr><td colspan="5" class="empty">No flowers found.</td></tr>';
    }
    function prodById(id) { return d.products.filter(function (p) { return String(p.id) === String(id); })[0]; }
    function openProduct(id) {
      var p = id ? prodById(id) : { name: '', unit: '', price: '', stock_status: 'in_stock', active: true };
      var cats = d.cats.length ? d.cats : SAMPLE.cats;
      modal('<h3>' + (id ? 'Edit flower' : 'Add a flower') + '</h3>' +
        '<div class="pf"><div class="ph"><img id="fImg" src="' + esc(id ? imgOf(p) : '/assets/img/emblem.png') + '" alt=""/><label class="b2 up">Change photo<input id="fFile" type="file" accept="image/*" hidden/></label><small>JPG or PNG. It is resized to keep the site fast.</small></div>' +
        '<div class="pg2"><label class="fl w2">Name<input id="fName" value="' + esc(p.name) + '" placeholder="e.g. Orange Marigold (Banthi)"/></label>' +
        '<label class="fl">Category<select id="fCat">' + cats.map(function (c) { return '<option value="' + c.id + '"' + (String(c.id) === String(p.category_id) ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></label>' +
        '<label class="fl">Unit<input id="fUnit" value="' + esc(p.unit) + '" placeholder="Per kg, Bunch of 10…"/></label>' +
        '<label class="fl">Price today (₹)<input id="fPrice" type="number" min="0" value="' + esc(p.price) + '"/></label>' +
        '<label class="fl">Offer price (₹)<input id="fSale" placeholder="optional" type="number" min="0" value="' + esc(p.sale_price || '') + '"/></label>' +
        '<label class="fl">Stock<select id="fStock">' + opts(STOCK, p.stock_status) + '</select></label>' +
        '<label class="ck"><input id="fAct" type="checkbox"' + (p.active !== false ? ' checked' : '') + '/> Show on website</label>' +
        '<label class="fl w2">Description<textarea id="fDesc" rows="2">' + esc(p.description || '') + '</textarea></label></div></div>' +
        '<div class="mb">' + (id ? '<button class="b2" id="fDel" type="button" style="margin-right:auto;color:#E0314B">Delete</button>' : '') + '<button class="b2" data-x type="button">Cancel</button><button class="b1" id="fSave" type="button">' + (id ? 'Save changes' : 'Add flower') + '</button></div>');
      if (id) $('#fDel').onclick = async function () {
        if (this.dataset.armed !== '1') { this.dataset.armed = '1'; this.textContent = 'Click again to delete'; return; }
        var r = await sb.from('products').delete().eq('id', id);
        if (r.error) { toast('Could not delete (it may be used in past orders) — hide it with "Show on website" instead.', true); this.dataset.armed = ''; this.textContent = 'Delete'; return; }
        toast('Deleted'); closeModal(); await load();
      };
      var file = null;
      $('#fFile').onchange = function () { file = this.files[0]; if (file) $('#fImg').src = URL.createObjectURL(file); };
      $('#fSave').onclick = async function () {
        var name = $('#fName').value.trim(), price = Number($('#fPrice').value);
        if (!name || !$('#fUnit').value.trim() || $('#fPrice').value === '' || !(price >= 0)) { toast('Please fill name, unit and price.', true); return; }
        if (d.sample) { toast('Sample data — create the database tables to save changes.', true); return; }
        var btn = this; btn.disabled = true; btn.textContent = 'Saving…';
        var row = { name: name, category_id: Number($('#fCat').value), unit: $('#fUnit').value.trim(), price: price, sale_price: $('#fSale').value === '' ? null : Number($('#fSale').value), description: $('#fDesc').value.trim() || null, stock_status: $('#fStock').value, active: $('#fAct').checked };
        try {
          if (file) {
            var blob = await shrink(file), path = 'p' + Date.now() + '.jpg';
            var up = await sb.storage.from('products').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
            if (up.error) throw up.error;
            row.image_url = sb.storage.from('products').getPublicUrl(path).data.publicUrl;
          }
          var r;
          if (id) r = await sb.from('products').update(row).eq('id', id);
          else { row.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6); row.sort_order = d.products.length + 1; r = await sb.from('products').insert(row); }
          if (r.error) throw r.error;
          toast('Saved ✓ — the website shows it now.'); closeModal(); await load();
        } catch (err) { toast('Could not save: ' + (err.message || err), true); btn.disabled = false; btn.textContent = id ? 'Save changes' : 'Add flower'; }
      };
    }
    // resize big phone photos to <=900px JPEG so the public site stays fast
    function shrink(file) {
      return new Promise(function (res, rej) {
        var im = new Image(); im.onload = function () {
          var s = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); c.toBlob(function (b) { b ? res(b) : rej(new Error('image error')); }, 'image/jpeg', 0.82);
        }; im.onerror = function () { rej(new Error('Could not read that image')); }; im.src = URL.createObjectURL(file);
      });
    }

    /* ---------- quotes & enquiries ---------- */
    function drawQuotes() {
      var all = d.quotes.map(function (q) { return { k: 'quote_requests', o: ['new', 'quoted', 'won', 'lost', 'closed'], x: q, t: q.occasion || 'Quote request' }; }).concat(d.enq.map(function (q) { return { k: 'enquiries', o: ['new', 'replied', 'closed'], x: q, t: q.subject || 'Enquiry' }; }));
      all.sort(function (a, b) { return new Date(b.x.created_at) - new Date(a.x.created_at); });
      $('#lEnq').innerHTML = all.map(function (r) { var e = r.x; return '<div class="er"><div><b>' + esc(e.name) + '</b> · <small>' + esc(r.t) + ' · ' + esc(fmtDate(e.created_at)) + '</small></div><div><select class="sel" data-q="' + r.k + '" data-id="' + esc(e.id) + '">' + opts(r.o, e.status) + '</select></div><p>' + esc(e.message || '') + '</p><div>' + (e.phone ? '<a href="' + esc(waLink(e.phone, 'Hello ' + e.name + ', this is AD Flower Stall regarding your request.')) + '" target="_blank" rel="noopener">Reply on WhatsApp →</a>' : '') + '</div></div>'; }).join('') || '<p class="empty">No quote requests yet.</p>';
    }

    /* ---------- settings (site_settings table) ---------- */
    var SET = { business: {}, whatsapp: {}, delivery: {} };
    function drawSettings() {
      var b = SET.business || {}, w = SET.whatsapp || {}, dl = SET.delivery || {};
      $('#sName').value = b.name || ''; $('#sWa').value = b.whatsapp || ''; $('#sPhone').value = b.phone || ''; $('#sHours').value = b.hours || ''; $('#sAddr').value = b.address || '';
      $('#sDel').value = dl.note || ''; $('#sCharge').value = dl.charge == null ? '' : dl.charge; $('#sMin').value = dl.minimum_order == null ? '' : dl.minimum_order;
      $('#sGreet').value = w.greeting || ''; $('#sOver').value = w.overdue_minutes || 30; $('#sCapture').checked = !!w.capture_name_before_chat;
    }
    $('#setForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var wa = $('#sWa').value.replace(/\D/g, '');
      if (wa.length < 10) { toast('WhatsApp number must include country code, e.g. 919949179933', true); return; }
      var rows = [
        { key: 'business', value: { name: $('#sName').value.trim(), whatsapp: wa, phone: $('#sPhone').value.trim(), hours: $('#sHours').value.trim(), address: $('#sAddr').value.trim() } },
        { key: 'whatsapp', value: { mode: (SET.whatsapp && SET.whatsapp.mode) || 'link', greeting: $('#sGreet').value.trim(), overdue_minutes: Number($('#sOver').value) || 30, capture_name_before_chat: $('#sCapture').checked } },
        { key: 'delivery', value: { enabled: true, note: $('#sDel').value.trim(), charge: Number($('#sCharge').value) || 0, minimum_order: Number($('#sMin').value) || 0, areas: (SET.delivery && SET.delivery.areas) || ['Guntur city'] } }
      ];
      var btn = $('#sSave'); btn.disabled = true;
      var r = await sb.from('site_settings').upsert(rows.map(function (x) { return { key: x.key, value: x.value, updated_at: new Date().toISOString() }; }), { onConflict: 'key' });
      btn.disabled = false;
      if (r.error) { toast('Could not save: ' + r.error.message, true); return; }
      rows.forEach(function (x) { SET[x.key] = x.value; });
      toast('Settings saved ✓ — the website uses them on next load.'); drawLeads();
    });
    var overdueMs = function () { return ((SET.whatsapp && SET.whatsapp.overdue_minutes) || 30) * 60000; };

    function drawAll() { drawDash(); drawOrders(); drawLeads(); drawProducts(); drawQuotes(); drawSettings(); }

    /* ---------- modal ---------- */
    function modal(html) { $('#mdBody').innerHTML = html; $('#md').classList.add('on'); }
    function closeModal() { $('#md').classList.remove('on'); }
    $('#md').addEventListener('click', function (e) { if (e.target === this || e.target.closest('[data-x]')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    /* ---------- navigation / events ---------- */
    var TITLES = { dash: ['Dashboard', 'Overview'], orders: ['Orders', 'Orders'], leads: ['WhatsApp leads', 'WhatsApp'], products: ['Flowers & prices', 'Catalogue'], enq: ['Quotes & enquiries', 'Quotes'], settings: ['Shop settings', 'Settings'] };
    function show(v) {
      $$('.view').forEach(function (e) { e.classList.toggle('on', e.id === 'v-' + v); });
      $$('#nav button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
      $('#title').textContent = TITLES[v][0]; $('#crumb').textContent = TITLES[v][1];
      $('#side').classList.remove('on'); $('#shade').classList.remove('on'); window.scrollTo(0, 0);
    }
    $('#nav').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(b.dataset.v); });
    document.addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]'); if (g) { show(g.dataset.go); return; }
      var o = e.target.closest('[data-order]'); if (o) { openOrder(o.dataset.order); return; }
      var ed = e.target.closest('[data-edit]'); if (ed) { openProduct(ed.dataset.edit); return; }
      if (e.target.closest('#addProd')) openProduct(null);
    });
    $('#fOrd').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; ordFilter = b.dataset.s; $$('#fOrd button').forEach(function (x) { x.classList.toggle('on', x === b); }); drawOrders(); });
    $('#lStat').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; leadFilter = b.dataset.s; drawLeads(); });
    document.addEventListener('change', async function (e) {
      var t = e.target, p;
      if (t.dataset.lead) {
        var l = d.leads.filter(function (x) { return String(x.id) === t.dataset.lead; })[0]; var patch = { status: t.value };
        if (t.value === 'replied' && l && !l.first_reply_at) patch.first_reply_at = new Date().toISOString();
        if (await save('whatsapp_leads', t.dataset.lead, patch)) { l.status = t.value; drawLeads(); drawDash(); } else drawLeads();
      } else if (t.dataset.price) {
        p = prodById(t.dataset.price); var v = Number(t.value);
        if (!(v >= 0) || t.value === '') { t.value = p.price; return; }
        if (await save('products', p.id, { price: v })) p.price = v; else t.value = p.price;
      } else if (t.dataset.stock) {
        p = prodById(t.dataset.stock); if (await save('products', p.id, { stock_status: t.value })) { p.stock_status = t.value; drawDash(); } else t.value = p.stock_status;
      } else if (t.dataset.act) {
        p = prodById(t.dataset.act); if (await save('products', p.id, { active: t.checked })) { p.active = t.checked; drawDash(); } else t.checked = p.active !== false;
      } else if (t.dataset.q) {
        var arr = t.dataset.q === 'enquiries' ? d.enq : d.quotes, row = arr.filter(function (x) { return String(x.id) === t.dataset.id; })[0];
        if (await save(t.dataset.q, t.dataset.id, { status: t.value })) { row.status = t.value; drawDash(); } else drawQuotes();
      }
    });
    $('#qProd').addEventListener('input', drawProducts);
    $('#cProd').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; prodCat = b.dataset.pc; drawProducts(); });
    $('#gq').addEventListener('input', function () {
      var v = $('#gq').value; if (v && !$('#v-orders').classList.contains('on') && !$('#v-products').classList.contains('on')) show('orders');
      drawOrders(); drawProducts();
    });
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#gq').focus(); } });
    $('#burger').addEventListener('click', function () { $('#side').classList.add('on'); $('#shade').classList.add('on'); });
    $('#shade').addEventListener('click', function () { $('#side').classList.remove('on'); $('#shade').classList.remove('on'); });
    $('#out').addEventListener('click', async function () { await sb.auth.signOut(); location.replace('/admin/login.html'); });

    async function load() {
      var since = new Date(Date.now() - 7 * 864e5).toISOString();
      var ev = sb.from('analytics_events').select('event,created_at').eq('event', 'page_view').gte('created_at', since).limit(5000);
      var res = await Promise.all([tryLoad('orders', 'created_at'), tryLoad('products', 'sort_order', '*,categories(name)'), tryLoad('quote_requests', 'created_at'), tryLoad('enquiries', 'created_at'), tryLoad('whatsapp_leads', 'created_at'), tryLoad('categories', 'sort_order'), ev.then(function (r) { return r.error ? null : r.data; })]);
      if (res[0] === null && res[1] === null && res[4] === null) {
        d.sample = true; d.orders = SAMPLE.orders; d.products = SAMPLE.products; d.cats = SAMPLE.cats; d.quotes = SAMPLE.quotes; d.enq = SAMPLE.enq; d.leads = SAMPLE.leads; d.events = []; $('#demo').hidden = false;
      } else {
        d.sample = false; $('#demo').hidden = true;
        d.orders = res[0] || []; d.products = res[1] || []; d.quotes = res[2] || []; d.enq = res[3] || []; d.leads = res[4] || []; d.cats = res[5] || []; d.events = res[6] || [];
      }
      var st = await sb.from('site_settings').select('key,value');
      if (!st.error && st.data) st.data.forEach(function (r) { SET[r.key] = r.value || {}; });
      drawAll();
    }
    $('#rf').addEventListener('click', function () { var b = this; b.classList.add('spin'); load().then(function () { setTimeout(function () { b.classList.remove('spin'); }, 400); }); });
    sb.auth.getSession().then(async function (r) {
      var s = r.data && r.data.session;
      if (!s || !(await isAdmin(s.user))) { await sb.auth.signOut(); location.replace('/admin/login.html'); return; }
      $('#who').textContent = s.user.email; $('#who2').textContent = s.user.email; $('#av').textContent = $('#av2').textContent = (s.user.email || 'A').charAt(0).toUpperCase();
      document.body.classList.add('ready');
      load();
      setInterval(function () { if (!document.hidden && !$('#md').classList.contains('on')) load(); }, 60000); // pick up new WhatsApp orders
    });
  }
})();
