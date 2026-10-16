(function () {
  'use strict';
  var PHONE = '919949179933'; // WhatsApp number (orders)
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var rupee = function (n) { return '₹' + n.toLocaleString('en-IN'); };
  var B = window.ADFS || null; // backend bridge (js/backend.js) — optional
  if (B) B.settings().then(function (S) { var w = S && S.business && String(S.business.whatsapp || '').replace(/\D/g, ''); if (w) PHONE = w; });
  var wa = function (m, o) {
    if (B) { var ref = B.lead(Object.assign({ message: m }, o || {})); m += '\nRef: ' + ref; }
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(m), '_blank');
  };

  // TODO: confirm real rates, units and descriptions with the stall
  var P = [
    { id: 1, n: 'Orange Marigold (Banthi)', u: 'Per kg, loose', p: 120, c: 'Marigold', i: 'marigold-orange', d: 'Bright orange marigold sold loose by weight — for puja, garlands and decoration.' },
    { id: 2, n: 'Marigold Garland', u: 'Per metre', p: 60, c: 'Marigold', i: 'marigold-garlands', d: 'Fresh marigold garland sold by the metre — for doors, vehicles, puja and functions.' },
    { id: 3, n: 'Sent Yellow Chamanthi', u: 'Per kg', p: 160, c: 'Chamanthi', i: 'chamanthi-yellow', d: 'Sent yellow chamanthi (chrysanthemum) blooms, popular for puja, garlands and décor.' },
    { id: 4, n: 'Milky White Chamanthi (Calcutta)', u: 'Per kg', p: 200, c: 'Chamanthi', i: 'chamanthi-white', d: 'Clean milky white chamanthi (Calcutta) for garlands and decoration.' },
    { id: 5, n: 'Violet Chamanthi', u: 'Per kg', p: 220, c: 'Chamanthi', i: 'chamanthi-violet', d: 'Violet chamanthi blooms that add colour to garlands and arrangements.' },
    { id: 6, n: 'Red Rose', u: 'Bunch of 10', p: 120, c: 'Rose', i: 'rose-red', d: 'Fresh red roses for garlands, gifting and decoration.' },
    { id: 7, n: 'Pink Rose', u: 'Bunch of 10', p: 150, c: 'Rose', i: 'rose-pink', d: 'Soft pink roses, fresh and fragrant.' },
    { id: 8, n: 'Rose Petals', u: 'Per 100 g', p: 40, c: 'Rose', i: 'rose-petals', d: 'Loose fresh rose petals for puja, decoration and rituals.' },
    { id: 9, n: 'Jasmine Buds (Malle)', u: 'Per 100 g', p: 60, c: 'Jasmine', i: 'jasmine-flower', d: 'Fresh jasmine (malle) buds that turn fragrant by evening — for puja and hair.' },
    { id: 10, n: 'Jasmine Strings', u: 'Per hand', p: 40, c: 'Jasmine', i: 'jasmine-strand', d: 'Jasmine strings tied fresh every morning.' },
    { id: 11, n: 'Lotus (Padmam)', u: 'Per piece', p: 25, c: 'Puja', i: 'lotus-pink', d: 'Fresh lotus (padmam) for puja and temple offerings.' },
    { id: 12, n: 'Red Hibiscus', u: 'Bunch of 25', p: 30, c: 'Puja', i: 'hibiscus-red', d: 'Fresh red hibiscus flowers for daily puja.' },
    { id: 13, n: 'Kanakambaram', u: 'Per string', p: 35, c: 'Puja', i: 'kanakambaram', d: 'Orange kanakambaram strings — a favourite for puja and festive hair décor.' }
  ];
  var get = function (id) { return P.filter(function (p) { return p.id == id; })[0]; };
  var img = function (x) { return x.img || ('assets/img/south/' + x.i + '.jpg'); };
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('adfs_cart') || '{}') || {}; Object.keys(cart).forEach(function (k) { if (!get(k)) delete cart[k]; }); } catch (e) { cart = {}; }

  /* flowers */
  var cat = 'all', q = '', sortBy = 'def', pg = $('#pg');
  function card(x, i) {
    var sold = x.stock === 'out_of_stock';
    return '<article class="pc" style="--n:' + (i % 8) + '"><div class="im"><img loading="lazy" src="' + img(x) + '" alt="' + x.n + '"/><span class="bdg">' + x.c + '</span><span class="pb">' + rupee(x.p) + '</span></div>' +
      '<div class="bd"><h3>' + x.n + '</h3><p class="u2">' + x.u + '</p><p class="ds">' + x.d + '</p>' +
      '<div class="ac"><div class="qs"><button type="button" data-q="-1" aria-label="Less">–</button><b>1</b><button type="button" data-q="1" aria-label="More">+</button></div>' +
      (sold ? '<button type="button" class="ab" disabled>Sold out today</button>' : '<button type="button" class="ab" data-add="' + x.id + '">Add to order</button>') + '</div></div></article>';
  }
  function draw() {
    var L = P.filter(function (x) { return (cat === 'all' || x.c === cat) && (!q || (x.n + ' ' + x.c + ' ' + x.d).toLowerCase().indexOf(q) > -1); });
    if (sortBy === 'pl') L.sort(function (m, n) { return m.p - n.p; }); else if (sortBy === 'ph') L.sort(function (m, n) { return n.p - m.p; });
    pg.innerHTML = L.length ? L.map(card).join('') : '<p class="pem">No flowers match “' + q.replace(/[<>&]/g, '') + '”. Try another name or choose All flowers.</p>';
    var pc = $('#pcnt'); if (pc) pc.textContent = L.length + (L.length === 1 ? ' flower' : ' flowers');
  }
  function setCat(c) { cat = c; $$('#pt button').forEach(function (x) { x.classList.toggle('on', x.dataset.c === c); }); draw(); }
  $('#pt').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setCat(b.dataset.c); });
  $('#ps').addEventListener('input', function () { q = this.value.trim().toLowerCase(); draw(); });
  $('#so').addEventListener('change', function () { sortBy = this.value; draw(); });

  /* custom dropdown (replaces the native select look) */
  function cs(sel) {
    var w = document.createElement('div'), b = document.createElement('button'), l = document.createElement('ul');
    w.className = 'cs'; b.type = 'button'; b.className = 'csb'; b.setAttribute('aria-haspopup', 'listbox'); b.setAttribute('aria-expanded', 'false'); l.className = 'csl'; l.setAttribute('role', 'listbox');
    b.innerHTML = '<span></span><svg class="ic"><use href="#i-chev"/></svg>';
    Array.prototype.forEach.call(sel.options, function (o) { var li = document.createElement('li'); li.setAttribute('role', 'option'); li.dataset.v = o.value; li.textContent = o.text; l.appendChild(li); });
    function sync() { b.firstChild.textContent = sel.options[sel.selectedIndex].text; Array.prototype.forEach.call(l.children, function (li) { li.classList.toggle('on', li.dataset.v === sel.value); }); }
    function open(o) { w.classList.toggle('open', o); b.setAttribute('aria-expanded', o); }
    b.onclick = function (e) { e.stopPropagation(); open(!w.classList.contains('open')); };
    l.onclick = function (e) { var li = e.target.closest('li'); if (!li) return; sel.value = li.dataset.v; sel.dispatchEvent(new Event('change')); sync(); open(false); };
    document.addEventListener('click', function () { open(false); }); document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
    sel.classList.add('vh'); sel.after(w); w.appendChild(b); w.appendChild(l); sync();
  }
  cs($('#so'));

  /* quote form: occasion chips, drawer: pickup/delivery segmented control */
  function pick(box, hidden) { box.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; Array.prototype.forEach.call(box.children, function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); hidden.value = b.dataset.v; hidden.dispatchEvent(new Event('change')); }); }
  pick($('.chs'), $('#qo')); pick($('#osg'), $('#os'));

  /* open / closed badge (IST) */
  (function () {
    var o = $('#opn'); if (!o) return;
    var d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })), h = d.getHours() + d.getMinutes() / 60, on = h >= 5 && h < 21;
    o.classList.toggle('on', on); o.querySelector('span').textContent = on ? 'Open now · closes 9 PM' : 'Closed now · opens 5 AM';
  })();
    draw();
  if (B && B.ready) B.products().then(function (L) {
    if (!L) return;
    P.length = 0; L.forEach(function (x) { P.push(x); });
    Object.keys(cart).forEach(function (k) { if (!get(k)) delete cart[k]; });
    draw(); render();
  });

  /* order drawer */
  function render() {
    var n = 0, t = 0, ids = Object.keys(cart);
    $('#di').innerHTML = ids.length ? ids.map(function (id) {
      var x = get(id), k = cart[id]; n += k; t += k * x.p;
      return '<div class="dt"><img src="' + img(x) + '" alt=""/><div><b>' + x.n + '</b><small>' + x.u + ' · ' + rupee(x.p) + '</small></div><div class="qy"><button data-m="' + id + '" aria-label="Less">–</button><span>' + k + '</span><button data-p="' + id + '" aria-label="More">+</button></div></div>';
    }).join('') : '<p class="em">Your order is empty.<br/>Add some flowers to begin.</p>';
    $('#cn').textContent = n; $('#tt').textContent = rupee(t);
    try { localStorage.setItem('adfs_cart', JSON.stringify(cart)); } catch (e) {}
  }
  function drawer(o) { $('#dr').classList.toggle('on', o); $('#sh2').classList.toggle('on', o); if (!o) $('#nv').classList.remove('on'); }
  $('#cb').onclick = function () { drawer(true); };
  $('#dx').onclick = $('#sh2').onclick = function () { drawer(false); };
  document.addEventListener('click', function (e) {
    var qb = e.target.closest('[data-q]');
    if (qb) { var bb = qb.parentNode.querySelector('b'); bb.textContent = Math.max(1, Math.min(50, (+bb.textContent || 1) + (+qb.dataset.q))); return; }
    var a = e.target.closest('[data-add]');
    if (a) { var id = a.dataset.add, qe = a.parentNode.querySelector('b'), k = +qe.textContent || 1; cart[id] = (cart[id] || 0) + k; render(); if (B) B.track('add_to_cart', { product_id: +id, value: k * get(id).p, category: get(id).c }); qe.textContent = 1; a.textContent = 'Added ✓'; a.classList.add('ok2'); setTimeout(function () { a.textContent = 'Add to order'; a.classList.remove('ok2'); }, 1100); }
  });
  $('#di').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.p) cart[b.dataset.p]++;
    if (b.dataset.m && --cart[b.dataset.m] <= 0) delete cart[b.dataset.m];
    render();
  });
  $('#os').onchange = function () { $('#oaw').hidden = this.value !== 'delivery'; };
  $('#sd').onclick = function () {
    var t = 0, items = [], lines = Object.keys(cart).map(function (id) { var x = get(id); t += cart[id] * x.p; items.push({ product_id: +id, name: x.n, unit: x.u, price: x.p, qty: cart[id] }); return '• ' + x.n + ' (' + x.u + ') × ' + cart[id] + ' = ' + rupee(cart[id] * x.p); });
    if (!lines.length) return;
    var del = $('#os').value === 'delivery', nm = $('#on').value.trim(), ad = $('#oa').value.trim(), ph = ($('#op') ? $('#op').value.trim() : '');
    if (del && !ad) { $('#oa').focus(); $('#oa').style.borderColor = '#B3402A'; return; }
    var msg = function (num) {
      return 'Hello AD Flower Stall! I would like to order:\n' + lines.join('\n') + '\n\nEstimated total: ' + rupee(t) + (num ? '\nOrder no: ' + num : '') + (nm ? '\nName: ' + nm : '') + '\nReceive by: ' + (del ? 'Home delivery\nAddress: ' + ad : 'Pickup at stall') + '\nPlease confirm availability & final price.';
    };
    if (!B) return wa(msg(''));
    // Open WhatsApp synchronously (popup blockers), save the order in the background with the same number.
    var num = 'ADF-' + (function () { var d = new Date(); return String(d.getFullYear()).slice(2) + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); })() + '-' + Math.random().toString(36).toUpperCase().slice(2, 6);
    wa(msg(num), { source: 'cart', intent: 'order', name: nm, phone: ph });
    B.order({ order_number: num, customer_name: nm, phone: ph, delivery_type: del ? 'delivery' : 'pickup', address: del ? ad : null, total: t, items: items });
    cart = {}; render();
  };

  /* quote form */
  $('#qf').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = { name: $('#qn').value.trim(), phone: ($('#qp') ? $('#qp').value.trim() : ''), occasion: $('#qo').value, event_date: $('#qd').value || null, message: $('#qm').value.trim() || null };
    if (B) B.quote(q);
    wa('Hello AD Flower Stall!\nName: ' + q.name + '\nFor: ' + q.occasion + '\nDate needed: ' + (q.event_date || 'flexible') + '\nDetails: ' + (q.message || '-') + '\nPlease share a quote.', { source: 'quote', intent: 'quote', name: q.name, phone: q.phone });
  });

  /* nav + misc */
  function menu(o) { $('#nv').classList.toggle('on', o); $('#sh2').classList.toggle('on', o); }
  $('#bt').onclick = function () { menu(!$('#nv').classList.contains('on')); };
  $$('#nv a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  var up = $('#up'); up.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  var spy = [['top', '#top'], ['shop', '#shop'], ['occasions', '#occasions'], ['visit', '#visit']];
  function hdr() {
    $('#hd').classList.toggle('stuck', scrollY > 40); up.classList.toggle('on', scrollY > 600);
    var y = scrollY + 160, cur = '#top';
    spy.forEach(function (s) { var el = document.querySelector(s[1]); if (el && el.getBoundingClientRect().top + scrollY <= y) cur = s[1]; });
    $$('#nv a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === cur); });
  }
  addEventListener('scroll', hdr, { passive: true }); hdr();
  $('#yr').textContent = new Date().getFullYear();
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { drawer(false); menu(false); } });

  /* hero slider: photos cross-fade, numbered tabs with progress */
  var slides = $$('.sl'), tabs = $$('#dots i'), si = 0, st;
  function go(n) {
    si = (n + slides.length) % slides.length; slides.forEach(function (s, i) { s.classList.toggle('on', i === si); });
    tabs.forEach(function (t, i) { t.classList.remove('on'); if (i === si) { void t.offsetWidth; t.classList.add('on'); } });
  }
  function auto() { clearInterval(st); st = setInterval(function () { go(si + 1); }, 6500); }
  tabs.forEach(function (t, i) { t.onclick = function () { go(i); auto(); }; }); auto();

  /* split text into words that rise in */
  function splitWords(el) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return; if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(' ')); return; }
            var m = document.createElement('span'), i = document.createElement('span'); m.className = 'm'; i.className = 'i'; i.style.setProperty('--i', n++); i.textContent = t; m.appendChild(i); f.appendChild(m);
          });
          node.replaceChild(f, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
  }
  splitWords($('#h1')); $$('.sh h2').forEach(splitWords);

  /* 3D tilt on flower cards (mouse only) */
  if (window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    pg.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.pc'); if (!c) return; var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = 'perspective(800px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 7) + 'deg) translateY(-6px)';
    });
    pg.addEventListener('pointerout', function (e) { var c = e.target.closest('.pc'); if (c) c.style.transform = ''; });
  }

  /* cookie consent (banner + settings) */
  var KEY = 'adfs_cookie', ck = $('#ck'), cm = $('#cm');
  function saved() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} document.dispatchEvent(new Event('adfs:consent')); ck.hidden = true; cm.hidden = true; document.body.classList.remove('lock'); }
  function showCk() { if (!saved()) setTimeout(function () { ck.hidden = false; }, 1400); }
  $('#cka').onclick = $('#cmal').onclick = function () { store({ essential: 1, analytics: 1, marketing: 1 }); };
  $('#ckd').onclick = function () { store({ essential: 1, analytics: 0, marketing: 0 }); };
  $('#cmsv').onclick = function () { store({ essential: 1, analytics: +$('#cm-an').checked, marketing: +$('#cm-mk').checked }); };
  function openCm() { var s = saved() || {}; $('#cm-an').checked = !!s.analytics; $('#cm-mk').checked = !!s.marketing; cm.hidden = false; document.body.classList.add('lock'); }
  $('#cks').onclick = openCm; var ckr = $('#ckr'); if (ckr) ckr.onclick = openCm;
  $('#cmx').onclick = function () { cm.hidden = true; document.body.classList.remove('lock'); };
  cm.addEventListener('click', function (e) { if (e.target === cm) { cm.hidden = true; document.body.classList.remove('lock'); } });

  /* animations: scroll progress, parallax, reveal variants, counters */
  var sp = document.createElement('div'); sp.id = 'sp'; document.body.appendChild(sp);
  var slEls = $$('.sl'), reduceM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function anim() {
    var max = document.documentElement.scrollHeight - innerHeight; sp.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    if (!reduceM && scrollY < innerHeight * 1.2) slEls.forEach(function (s) { s.style.setProperty('--py', (scrollY * 0.28) + 'px'); });
  }
  addEventListener('scroll', anim, { passive: true }); anim();
  $$('.sh,.qf,.fqs details,.nl').forEach(function (el) { el.classList.add('rv'); });
  $$('.sp,.vi').forEach(function (el) { el.classList.add('l'); }); $$('.st,.vm').forEach(function (el) { el.classList.add('r'); });
  $$('.ot,.wc').forEach(function (el) { el.classList.add('z'); });
  function startCount() {
    $$('.hstat b').forEach(function (b) {
      if (!/^\d+$/.test(b.textContent)) return; var end = +b.textContent, t0 = Date.now();
      (function tick() { var k = Math.min(1, (Date.now() - t0) / 1400); b.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })();
    });
  }

  /* reveal + loader */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { threshold: .1 }) : null;
  $$('.rv').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 90 + 'ms'; if (io) io.observe(el); else el.classList.add('in'); });
  var ld = $('#ld'), t0 = Date.now(), MIN = 1700, loaded = document.readyState === 'complete', fin = false;
  addEventListener('load', function () { loaded = true; }); setTimeout(function () { loaded = true; }, 5000);
  var lpc = $('#lpc');
  (function wait() {
    if (lpc) lpc.textContent = (loaded && Date.now() - t0 >= MIN ? 100 : Math.min(99, Math.floor((Date.now() - t0) / MIN * 100))) + '%';
    if (loaded && Date.now() - t0 >= MIN) {
      if (fin) return; fin = true; ld.classList.add('done'); document.body.classList.remove('loading');
      setTimeout(function () { $('#h1').classList.add('go'); }, 250);
      setTimeout(function () { ld.remove(); showCk(); }, 900);
    } else setTimeout(wait, 100);
  })();
  render();
})();
