(function () {
  'use strict';
  var PHONE = '919949179933'; // WhatsApp number (orders)
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rupee = function (n) { return '₹' + n.toLocaleString('en-IN'); };
  var IC = function (n) { return '<svg class="ic"><use href="#i-' + n + '"/></svg>'; };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wa = function (msg) { window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank'); };

  var P = [
    { id: 1, n: 'Classic Red Roses', s: 'Bunch of 12', p: 349, o: 429, c: 'Roses', i: 'rose-red', t: ['Best', 'Sale'], d: 'Deep red, long-stemmed roses — the classic way to say I love you.' },
    { id: 2, n: 'Pink Garden Roses', s: 'Bunch of 10', p: 399, c: 'Roses', i: 'roses-pink', t: ['Best'], d: 'Soft, fragrant garden roses in blush pink. Gentle, romantic and long-lasting.' },
    { id: 3, n: 'Rainbow Roses', s: 'Bunch of 10', p: 599, c: 'Roses', i: 'roses-rainbow', t: ['New'], d: 'Vibrant multi-coloured roses that make any celebration pop.' },
    { id: 4, n: 'Garden Bouquet', s: 'Hand-tied, large', p: 1039, o: 1299, c: 'Bouquets', i: 'bouquet-garden', t: ['Best', 'Sale'], d: 'A lush hand-tied bouquet of roses, eucalyptus and seasonal blooms.' },
    { id: 5, n: 'Peach & Peony Posy', s: 'Hand-tied, medium', p: 899, c: 'Bouquets', i: 'bouquet-peach', t: ['New'], d: 'Pastel peach and blush blooms tied with a soft ribbon — pure elegance.' },
    { id: 6, n: 'Jewel Tone Bouquet', s: 'Hand-tied, large', p: 1499, c: 'Bouquets', i: 'bouquet-dark', t: ['Best'], d: 'Rich, moody colours and textured foliage for a statement gift.' },
    { id: 7, n: 'Golden Sunflowers', s: 'Bunch of 8', p: 299, c: 'Seasonal', i: 'sunflowers', t: ['Best'], d: 'Cheerful sunflowers that light up any room.' },
    { id: 8, n: 'Striped Tulips', s: 'Bunch of 10', p: 549, c: 'Seasonal', i: 'tulips-field', t: ['New'], d: 'Crisp white-and-red striped tulips — fresh, bright and elegant.' },
    { id: 9, n: 'Pink Tulip Vase', s: 'With glass jar', p: 699, o: 799, c: 'Gifts', i: 'tulips-jar', t: ['Sale'], d: 'Pink tulips arranged in a glass jar with a natural ribbon — ready to gift.' },
    { id: 10, n: 'Red Begonia Basket', s: 'Mixed bloom', p: 449, c: 'Seasonal', i: 'begonia-red', t: ['New'], d: 'A burst of vivid red blooms for balconies, gifting and décor.' },
    { id: 11, n: 'Love Heart Bouquet', s: 'Assorted blooms', p: 1199, c: 'Gifts', i: 'heart-bouquet', t: ['New', 'Best'], d: 'Assorted roses and spring blooms shaped into a heart — made to be loved.' },
    { id: 12, n: 'Poppy Meadow Bunch', s: 'Bunch of 15', p: 249, o: 299, c: 'Seasonal', i: 'hero-poppies', t: ['Sale'], d: 'Sunny golden poppies, freshly cut and full of meadow charm.' }
  ];
  var get = function (id) { return P.filter(function (p) { return p.id == id; })[0]; };
  var cart = {}, wish = {}, mode = 'cart', cat = 'all', tab = 'all', q = '';
  try { wish = JSON.parse(localStorage.getItem('adfs_wish') || '{}'); } catch (e) {}

  /* ---------- marquee ---------- */
  var words = ['Roses', 'Marigolds', 'Jasmine', 'Lotus', 'Garlands', 'Bouquets', 'Tulips', 'Sunflowers', 'Wedding Décor', 'Puja Flowers'];
  var mq = $('#marq'); if (mq) mq.innerHTML = words.concat(words).map(function (w) { return '<span>' + w + '</span>'; }).join('');

  /* ---------- hero: rotating word ---------- */
  var rot = $('#rot'), rw = ['wedding', 'puja', 'birthday', 'anniversary', 'festive'], ri = 0;
  if (rot && !reduce) setInterval(function () {
    rot.classList.add('out');
    setTimeout(function () { ri = (ri + 1) % rw.length; rot.textContent = rw[ri]; rot.classList.remove('out'); }, 450);
  }, 2600);

  /* ---------- hero: parallax ---------- */
  var hv = $('#hv');
  if (hv && !reduce && matchMedia('(hover:hover)').matches) {
    hv.addEventListener('mousemove', function (e) {
      var r = hv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      $$('[data-d]', hv).forEach(function (el) { var d = +el.dataset.d; el.style.transform = 'translate(' + (-x * d) + 'px,' + (-y * d) + 'px)'; });
    });
    hv.addEventListener('mouseleave', function () { $$('[data-d]', hv).forEach(function (el) { el.style.transform = ''; }); });
  }

  /* ---------- falling petals ---------- */
  (function () {
    var cv = $('#petals'); if (!cv || reduce) return;
    var cx = cv.getContext('2d'), W, H, list = [], run = true, N = innerWidth < 700 ? 9 : 18;
    var cols = ['rgba(240,170,185,', 'rgba(250,215,220,', 'rgba(230,192,102,', 'rgba(255,240,215,'];
    function size() { var r = cv.parentNode.getBoundingClientRect(); W = cv.width = r.width; H = cv.height = r.height; }
    function mk(top) { return { x: Math.random() * W, y: top ? -20 : Math.random() * H, s: 6 + Math.random() * 9, v: .35 + Math.random() * .7, sw: Math.random() * 6, sp: .006 + Math.random() * .012, r: Math.random() * 6, rv: (Math.random() - .5) * .03, c: cols[(Math.random() * cols.length) | 0], a: .35 + Math.random() * .45 }; }
    function init() { size(); list = []; for (var i = 0; i < N; i++) list.push(mk(false)); }
    function draw() {
      if (!run) return; cx.clearRect(0, 0, W, H);
      list.forEach(function (p) {
        p.y += p.v; p.sw += p.sp; p.r += p.rv; p.x += Math.sin(p.sw) * .6;
        if (p.y > H + 20) Object.assign(p, mk(true));
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c + p.a + ')';
        cx.beginPath(); cx.ellipse(0, 0, p.s * .5, p.s, 0, 0, 6.283); cx.fill(); cx.restore();
      });
      requestAnimationFrame(draw);
    }
    init(); draw();
    addEventListener('resize', init);
    document.addEventListener('visibilitychange', function () { run = !document.hidden; if (run) draw(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !run) { run = true; draw(); } else if (!v) run = false; }).observe(cv.parentNode);
  })();

  /* ---------- collections (bento) ---------- */
  $$('.cl').forEach(function (a) { a.addEventListener('click', function () { if (a.dataset.f) filter(a.dataset.f); }); });
  $$('[data-count]').forEach(function (el) { var n = P.filter(function (x) { return x.c === el.dataset.count; }).length; el.textContent = n + (n === 1 ? ' flower' : ' flowers'); });

  /* ---------- products ---------- */
  var grid = $('#grid');
  grid.innerHTML = P.map(function (x) {
    var badge = x.o ? '<span class="b sale">-' + Math.round((1 - x.p / x.o) * 100) + '%</span>' : (x.t.indexOf('New') > -1 ? '<span class="b">New</span>' : '');
    return '<article class="pc rv-in" data-id="' + x.id + '"><div class="im" data-qv="' + x.id + '"><img loading="lazy" src="assets/img/' + x.i + '.jpg" alt="' + x.n + '"/>' + badge +
      '<div class="acts"><button data-w="' + x.id + '" aria-label="Add to wishlist">' + IC('heart') + '</button></div>' +
      '<div class="addbar"><button data-a="' + x.id + '">Add to order</button></div></div>' +
      '<div class="st">★★★★★</div><h3 data-qv="' + x.id + '">' + x.n + '</h3><div class="pr">' + rupee(x.p) + (x.o ? '<s>' + rupee(x.o) + '</s>' : '') + '</div></article>';
  }).join('');

  function apply() {
    var shown = 0;
    $$('.pc').forEach(function (el) {
      var x = get(el.dataset.id);
      var ok = (cat === 'all' || x.c === cat) && (tab === 'all' || x.t.indexOf(tab) > -1) && (!q || (x.n + ' ' + x.c).toLowerCase().indexOf(q) > -1);
      el.classList.toggle('hide', !ok); if (ok) { shown++; el.classList.add('in'); }
    });
    $('#none').style.display = shown ? 'none' : 'block';
  }
  function filter(c) {
    cat = c || 'all'; tab = 'all'; q = '';
    var si = $('#sInput'); if (si) si.value = '';
    $$('.tab').forEach(function (t) { t.classList.toggle('on', t.dataset.f === 'all'); });
    apply();
  }
  window.ADFS = { filter: filter, openCart: function () { openDrawer("cart"); } };
  $('#tabs').addEventListener('click', function (e) {
    if (!e.target.dataset.f) return; tab = e.target.dataset.f;
    $$('.tab').forEach(function (t) { t.classList.toggle('on', t === e.target); }); apply();
  });
  $('#sBtn').onclick = function () { $('#search').classList.toggle('on'); $('#sInput').focus(); };
  $('#sInput').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); cat = 'all'; apply(); if (q) location.hash = '#shop'; });

  /* ---------- drawer ---------- */
  function list() { return mode === 'cart' ? cart : wish; }
  function render() {
    var n = 0, t = 0;
    Object.keys(cart).forEach(function (id) { n += cart[id]; t += cart[id] * get(id).p; });
    $('#cnt').textContent = n; var mc = $('#mbCnt'); if (mc) { mc.textContent = n; mc.classList.toggle('show', n > 0); } $('#wcnt').textContent = Object.keys(wish).length;
    $$('[data-w]').forEach(function (b) { b.classList.toggle('liked', !!wish[b.dataset.w]); });
    var L = list(), keys = Object.keys(L), total = 0;
    $('#dTitle').textContent = mode === 'cart' ? 'My Order' : 'My Wishlist';
    $('#dItems').innerHTML = keys.length ? keys.map(function (id) {
      var x = get(id); total += mode === 'cart' ? L[id] * x.p : 0;
      var ctl = mode === 'cart'
        ? '<div class="qty"><button data-m="' + id + '" aria-label="Less">–</button><span>' + L[id] + '</span><button data-p="' + id + '" aria-label="More">+</button></div>'
        : '<div class="qty"><button data-add="' + id + '" title="Add to order">+</button><button data-rm="' + id + '" title="Remove">' + IC('close') + '</button></div>';
      return '<div class="d-it"><img src="assets/img/' + x.i + '.jpg" alt=""/><div><b>' + x.n + '</b><small>' + x.s + ' · ' + rupee(x.p) + '</small></div>' + ctl + '</div>';
    }).join('') : '<p class="empty">' + (mode === 'cart' ? 'Your order is empty.<br/>Add some flowers to get started.' : 'No favourites yet.<br/>Tap the heart on a flower you like.') + '</p>';
    $('#tot').textContent = rupee(mode === 'cart' ? total : 0);
    $('.d-ft').style.display = mode === 'cart' ? '' : 'none';
    try { localStorage.setItem('adfs_wish', JSON.stringify(wish)); } catch (e) {}
  }
  function openDrawer(m) { mode = m; render(); $('#drawer').classList.add('open'); $('#shade').classList.add('on'); }
  function closeDrawer() { $('#drawer').classList.remove('open'); $('#shade').classList.remove('on'); }
  function add(id, n) { cart[id] = (cart[id] || 0) + (n || 1); render(); }
  $('#cBtn').onclick = function () { openDrawer('cart'); };
  $('#wBtn').onclick = function () { openDrawer('wish'); };
  $('#dClose').onclick = $('#shade').onclick = closeDrawer;
  grid.addEventListener('click', function (e) {
    var a = e.target.closest('[data-a]'), w = e.target.closest('[data-w]'), v = e.target.closest('[data-qv]');
    if (a) { add(a.dataset.a); a.textContent = '✓ Added'; setTimeout(function () { a.textContent = 'Add to order'; }, 900); return; }
    if (w) { if (wish[w.dataset.w]) delete wish[w.dataset.w]; else wish[w.dataset.w] = 1; render(); return; }
    if (v) openQV(v.dataset.qv);
  });
  $('#dItems').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var d = b.dataset;
    if (d.p) cart[d.p]++;
    if (d.m && --cart[d.m] <= 0) delete cart[d.m];
    if (d.add) { add(d.add); return; }
    if (d.rm) delete wish[d.rm];
    render();
  });
  $('#send').onclick = function () {
    var t = 0, lines = Object.keys(cart).map(function (id) {
      var x = get(id); t += cart[id] * x.p;
      return '• ' + x.n + ' (' + x.s + ') × ' + cart[id] + ' = ' + rupee(cart[id] * x.p);
    });
    if (!lines.length) return;
    wa('Hello AD Flower Stall! I would like to order:\n' + lines.join('\n') + '\n\nEstimated total: ' + rupee(t) + '\nPlease confirm availability & delivery.');
  };
  var pick = $('#pickBtn'); if (pick) pick.onclick = function () { add(1); openDrawer('cart'); };
  var dealWa = $('#dealWa'); if (dealWa) dealWa.onclick = function () { wa('Hello AD Flower Stall! I would like to order today\'s deal:\n• Garden Bouquet (Hand-tied, large) × 1 = ' + rupee(1039) + '\nPlease confirm availability & delivery.'); };
  var dealBtn = $('#dealBtn'); if (dealBtn) dealBtn.onclick = function () { add(4); openDrawer('cart'); };

  /* ---------- quick view ---------- */
  var qvId = 0, qvN = 1, qv = $('#qv');
  function openQV(id) {
    var x = get(id); qvId = x.id; qvN = 1;
    $('#qvImg').src = 'assets/img/' + x.i + '.jpg'; $('#qvImg').alt = x.n;
    $('#qvName').textContent = x.n; $('#qvCat').textContent = x.c + ' · ' + x.s;
    $('#qvPrice').innerHTML = rupee(x.p) + (x.o ? '<s>' + rupee(x.o) + '</s>' : '');
    $('#qvDesc').textContent = x.d; $('#qvTag').textContent = x.t[0]; $('#qvN').textContent = 1;
    qv.hidden = false; document.body.classList.add('lock');
  }
  function closeQV() { qv.hidden = true; document.body.classList.remove('lock'); }
  $('#qvX').onclick = closeQV;
  qv.addEventListener('click', function (e) { if (e.target === qv) closeQV(); });
  $('#qvMinus').onclick = function () { qvN = Math.max(1, qvN - 1); $('#qvN').textContent = qvN; };
  $('#qvPlus').onclick = function () { qvN = Math.min(50, qvN + 1); $('#qvN').textContent = qvN; };
  $('#qvAdd').onclick = function () { add(qvId, qvN); closeQV(); openDrawer('cart'); };
  $('#qvWa').onclick = function () { var x = get(qvId); wa('Hello AD Flower Stall! I would like to order:\n• ' + x.n + ' (' + x.s + ') × ' + qvN + ' = ' + rupee(x.p * qvN) + '\nPlease confirm availability & delivery.'); };

  /* ---------- deal countdown (resets daily) ---------- */
  function tick() {
    var n = new Date(), e = new Date(n); e.setHours(23, 59, 59, 999);
    var d = Math.floor((e - n) / 1000), p = function (v) { return ('0' + v).slice(-2); };
    var h = $('#h'); if (!h) return;
    h.textContent = p(Math.floor(d / 3600)); $('#m').textContent = p(Math.floor(d % 3600 / 60)); $('#s').textContent = p(d % 60);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- occasions ---------- */
  var OC = [
    { t: 'Weddings', i: 'bouquet-peach', p: 'From bridal bouquets to garlands and stage décor — we design to your colours, theme and budget.', l: ['Bridal & bridesmaid bouquets', 'Varmala & garlands', 'Mandap and stage flowers', 'Bulk orders at fair prices'] },
    { t: 'Pujas & Festivals', i: 'sunflowers', p: 'Fresh flowers and garlands for daily puja, temples and every festival — delivered early in the morning.', l: ['Loose flowers & garlands', 'Festival bundles', 'Temple and home décor', 'Regular weekly orders'] },
    { t: 'Birthdays', i: 'heart-bouquet', p: 'Surprise someone special with a bouquet that matches their personality — ready the same day.', l: ['Hand-tied bouquets', 'Flowers with a gift message', 'Same-day delivery in Guntur', 'Free gift wrap'] },
    { t: 'Anniversaries', i: 'rose-red', p: 'Classic red roses and romantic arrangements to celebrate your years together.', l: ['Red and pink rose bunches', 'Heart-shaped arrangements', 'Surprise delivery', 'Custom colours on request'] }
  ];
  var ocPanel = $('#ocPanel');
  function setOC(i) {
    var o = OC[i];
    ocPanel.classList.add('sw');
    setTimeout(function () {
      $('#ocImg').src = 'assets/img/' + o.i + '.jpg'; $('#ocImg').alt = o.t; $('#ocH').textContent = o.t; $('#ocP').textContent = o.p;
      $('#ocL').innerHTML = o.l.map(function (x) { return '<li>' + x + '</li>'; }).join('');
      $('#ocA').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent('Hello AD Flower Stall! I need flowers for ' + o.t.toLowerCase() + '. Please share options and a quote.');
      ocPanel.classList.remove('sw');
    }, 280);
    $$('#ocTabs button').forEach(function (b, k) { b.classList.toggle('on', k === i); });
  }
  $('#ocTabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setOC(+b.dataset.i); });
  (function () { var o = OC[0]; $('#ocP').textContent = o.p; $('#ocL').innerHTML = o.l.map(function (x) { return '<li>' + x + '</li>'; }).join(''); $('#ocA').href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent('Hello AD Flower Stall! I need flowers for weddings. Please share options and a quote.'); })();

  /* ---------- gallery lightbox ---------- */
  var lb = $('#lb');
  $('#mosaic').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; $('#lbImg').src = b.dataset.s; lb.hidden = false; document.body.classList.add('lock'); });
  function closeLB() { lb.hidden = true; document.body.classList.remove('lock'); }
  $('#lbX').onclick = closeLB; lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLB(); closeQV(); closeDrawer(); } });

    /* ---------- good to know (accordion + filter) ---------- */
  var fqList = $('#fqList');
  if (fqList) {
    fqList.addEventListener('click', function (e) {
      var q = e.target.closest('.fq-q'); if (!q) return; var item = q.parentNode, open = item.classList.contains('open');
      $$('.fq', fqList).forEach(function (x) { x.classList.remove('open'); $('.fq-q', x).setAttribute('aria-expanded', 'false'); });
      if (!open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    });
    $('#fqChips').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var c = b.dataset.c;
      $$('#fqChips button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.fq', fqList).forEach(function (x) { x.classList.toggle('hide', c !== 'all' && x.dataset.c !== c); });
    });
  }

  /* ---------- plan your occasion ---------- */
  var planForm = $('#planForm');
  if (planForm) {
    var plan = 'Wedding', pd = $('#plDate');
    var t = new Date(); pd.min = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
    $('#plChips').addEventListener('click', function (e) {
      var b = e.target.closest('.pl-chip'); if (!b) return; plan = b.dataset.v;
      $$('.pl-chip').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
    planForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nm = $('#plName').value.trim(), pl = $('#plPlace').value.trim(), nt = $('#plNote').value.trim();
      wa('Hello AD Flower Stall! I need a quote for a ' + plan.toLowerCase() + '.\n' + (nm ? 'Name: ' + nm + '\n' : '') + 'Date needed: ' + (pd.value || 'flexible') + '\nBudget: ' + $('#plBud').value + (pl ? '\nVenue / area: ' + pl : '') + (nt ? '\nIdeas: ' + nt : '') + '\nPlease share options and pricing.');
    });
  }

  /* ---------- forms -> WhatsApp ---------- */
  $('#orderForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    wa('Hello AD Flower Stall!\nName: ' + f.name.value + '\nPhone: ' + f.phone.value + '\nOccasion: ' + f.occ.value + '\nNeeded on: ' + (f.date.value || 'flexible') + '\nDetails: ' + (f.msg.value || '-'));
  });

  /* ---------- nav ---------- */
  $('#burger').onclick = function () { $('#menu').classList.toggle('open'); };
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { $('#menu').classList.remove('open'); }); });
  addEventListener('scroll', function () { $('#header').classList.toggle('shadow', scrollY > 10); }, { passive: true });
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- reveal on scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' }) : null;
  $$('.rv-in').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 90 + 'ms'; if (io) io.observe(el); else el.classList.add('in'); });

  render(); apply();
})();
