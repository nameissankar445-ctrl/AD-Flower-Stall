(function () {
  var PHONE = '919949179933'; // WhatsApp number (orders)
  var P = [
    { id: 1, n: 'Classic Red Roses', s: 'Bunch of 12', p: 349, o: 429, c: 'Roses', i: 'rose-red', t: ['Best', 'Sale'] },
    { id: 2, n: 'Pink Garden Roses', s: 'Bunch of 10', p: 399, c: 'Roses', i: 'roses-pink', t: ['Best'] },
    { id: 3, n: 'Rainbow Roses', s: 'Bunch of 10', p: 599, c: 'Roses', i: 'roses-rainbow', t: ['New'] },
    { id: 4, n: 'Garden Bouquet', s: 'Hand-tied, large', p: 1039, o: 1299, c: 'Bouquets', i: 'bouquet-garden', t: ['Best', 'Sale'] },
    { id: 5, n: 'Peach & Peony Posy', s: 'Hand-tied, medium', p: 899, c: 'Bouquets', i: 'bouquet-peach', t: ['New'] },
    { id: 6, n: 'Jewel Tone Bouquet', s: 'Hand-tied, large', p: 1499, c: 'Bouquets', i: 'bouquet-dark', t: ['Best'] },
    { id: 7, n: 'Golden Sunflowers', s: 'Bunch of 8', p: 299, c: 'Seasonal', i: 'sunflowers', t: ['Best'] },
    { id: 8, n: 'Striped Tulips', s: 'Bunch of 10', p: 549, c: 'Seasonal', i: 'tulips-field', t: ['New'] },
    { id: 9, n: 'Pink Tulip Vase', s: 'With glass jar', p: 699, o: 799, c: 'Gifts', i: 'tulips-jar', t: ['Sale'] },
    { id: 10, n: 'Red Begonia Basket', s: 'Mixed bloom', p: 449, c: 'Seasonal', i: 'begonia-red', t: ['New'] },
    { id: 11, n: 'Love Heart Bouquet', s: 'Assorted blooms', p: 1199, c: 'Gifts', i: 'heart-bouquet', t: ['New', 'Best'] },
    { id: 12, n: 'Poppy Meadow Bunch', s: 'Bunch of 15', p: 249, o: 299, c: 'Seasonal', i: 'hero-poppies', t: ['Sale'] }
  ];
  var IC = function (n, c) { return '<svg class="ic' + (c ? ' ' + c : '') + '"><use href="#i-' + n + '"/></svg>'; };
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var rupee = function (n) { return '₹' + n.toLocaleString('en-IN'); };
  var get = function (id) { return P.filter(function (p) { return p.id == id; })[0]; };
  var cart = {}, wish = {}, mode = 'cart', cat = 'all', tab = 'all', q = '';
  try { wish = JSON.parse(localStorage.getItem('adfs_wish') || '{}'); } catch (e) {}

  // products
  $('#grid').innerHTML = P.map(function (x) {
    var badge = x.o ? '<span class="b sale">-' + Math.round((1 - x.p / x.o) * 100) + '%</span>' : (x.t.indexOf('New') > -1 ? '<span class="b">New</span>' : '');
    return '<article class="pc rv-in" data-id="' + x.id + '"><div class="im"><img loading="lazy" src="assets/img/' + x.i + '.jpg" alt="' + x.n + '"/>' + badge +
      '<div class="acts"><button data-w="' + x.id + '" aria-label="Wishlist">' + IC('heart') + '</button></div>' +
      '<div class="addbar"><button data-a="' + x.id + '">Add to order</button></div></div>' +
      '<div class="st">★★★★★</div><h3>' + x.n + '</h3><div class="pr">' + rupee(x.p) + (x.o ? '<s>' + rupee(x.o) + '</s>' : '') + '</div></article>';
  }).join('');

  function apply() {
    var shown = 0;
    $$('.pc').forEach(function (el) {
      var x = get(el.dataset.id);
      var ok = (cat === 'all' || x.c === cat) && (tab === 'all' || x.t.indexOf(tab) > -1) && (!q || (x.n + ' ' + x.c).toLowerCase().indexOf(q) > -1);
      el.classList.toggle('hide', !ok); if (ok) shown++;
    });
    $('#none').style.display = shown ? 'none' : 'block';
  }
  $('#tabs').addEventListener('click', function (e) {
    if (!e.target.dataset.f) return; tab = e.target.dataset.f;
    $$('.tab').forEach(function (t) { t.classList.toggle('on', t === e.target); }); apply();
  });
  $$('.bn').forEach(function (b) { b.addEventListener('click', function () { cat = b.dataset.f; tab = 'all'; $$('.tab').forEach(function (t) { t.classList.toggle('on', t.dataset.f === 'all'); }); apply(); }); });
  $('#sBtn').onclick = function () { $('#search').classList.toggle('on'); $('#sInput').focus(); };
  $('#sInput').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); cat = 'all'; apply(); if (q) location.hash = '#shop'; });

  // drawer (order / wishlist)
  function list() { return mode === 'cart' ? cart : wish; }
  function render() {
    var ids = Object.keys(cart), n = 0, t = 0;
    ids.forEach(function (id) { n += cart[id]; t += cart[id] * get(id).p; });
    $('#cnt').textContent = n;
    $('#wcnt').textContent = Object.keys(wish).length;
    $$('[data-w]').forEach(function (b) { var on = !!wish[b.dataset.w]; b.classList.toggle('liked', on); b.innerHTML = IC('heart');  });
    var L = list(), keys = Object.keys(L), total = 0;
    $('#dTitle').textContent = mode === 'cart' ? 'My Order' : 'My Wishlist';
    $('#dItems').innerHTML = keys.length ? keys.map(function (id) {
      var x = get(id); total += mode === 'cart' ? L[id] * x.p : 0;
      var ctl = mode === 'cart'
        ? '<div class="qty"><button data-m="' + id + '">–</button><span>' + L[id] + '</span><button data-p="' + id + '">+</button></div>'
        : '<div class="qty"><button data-add="' + id + '" title="Add to order">+</button><button data-rm="' + id + '" title="Remove">' + IC('close') + '</button></div>';
      return '<div class="d-it"><img src="assets/img/' + x.i + '.jpg" alt=""/><div><b>' + x.n + '</b><small>' + x.s + ' · ' + rupee(x.p) + '</small></div>' + ctl + '</div>';
    }).join('') : '<p class="empty">' + (mode === 'cart' ? 'Your order is empty.<br/>Add some flowers to get started.' : 'No favourites yet.<br/>Tap the heart on a flower you like.') + '</p>';
    $('#tot').textContent = rupee(mode === 'cart' ? total : 0);
    $('.d-ft').style.display = mode === 'cart' ? '' : 'none';
    try { localStorage.setItem('adfs_wish', JSON.stringify(wish)); } catch (e) {}
  }
  function open(m) { mode = m; render(); $('#drawer').classList.add('open'); $('#shade').classList.add('on'); }
  function close() { $('#drawer').classList.remove('open'); $('#shade').classList.remove('on'); }
  function add(id) { cart[id] = (cart[id] || 0) + 1; render(); }
  $('#cBtn').onclick = function () { open('cart'); };
  $('#wBtn').onclick = function () { open('wish'); };
  $('#dClose').onclick = $('#shade').onclick = close;
  $('#grid').addEventListener('click', function (e) {
    var a = e.target.closest('[data-a]'), w = e.target.closest('[data-w]');
    if (a) { add(a.dataset.a); a.textContent = '✓ Added'; setTimeout(function () { a.textContent = 'Add to order'; }, 900); }
    if (w) { if (wish[w.dataset.w]) delete wish[w.dataset.w]; else wish[w.dataset.w] = 1; render(); }
  });
  $('#dItems').addEventListener('click', function (e) {
    var d = e.target.dataset;
    if (d.p) cart[d.p]++;
    if (d.m && --cart[d.m] <= 0) delete cart[d.m];
    if (d.add) { add(d.add); return; }
    if (d.rm) delete wish[d.rm];
    render();
  });
  $('#dealBtn').onclick = function () { cart[4] = (cart[4] || 0) + 1; open('cart'); };
  $('#send').onclick = function () {
    var t = 0, lines = Object.keys(cart).map(function (id) {
      var x = get(id); t += cart[id] * x.p;
      return '• ' + x.n + ' (' + x.s + ') × ' + cart[id] + ' = ' + rupee(cart[id] * x.p);
    });
    if (!lines.length) return;
    var msg = 'Hello AD Flower Stall! I would like to order:\n' + lines.join('\n') + '\n\nEstimated total: ' + rupee(t) + '\nPlease confirm availability & delivery.';
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  };

  // forms -> WhatsApp
  $('#orderForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    var msg = 'Hello AD Flower Stall!\nName: ' + f.name.value + '\nPhone: ' + f.phone.value + '\nOccasion: ' + f.occ.value +
      '\nNeeded on: ' + (f.date.value || 'flexible') + '\nDetails: ' + (f.msg.value || '-');
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  });
  $('#nlForm').addEventListener('submit', function (e) {
    e.preventDefault();
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent('Hi! Please add me to your offers list. My number: ' + $('#nlPhone').value), '_blank');
  });

  // hero slider
  var sl = $$('.sl'), dots = $$('#dots i'), cur = 0, timer;
  function go(n) { cur = (n + sl.length) % sl.length; sl.forEach(function (s, i) { s.classList.toggle('on', i === cur); }); dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); }); }
  function auto() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 6500); }
  $('#next').onclick = function () { go(cur + 1); auto(); };
  $('#prev').onclick = function () { go(cur - 1); auto(); };
  dots.forEach(function (d, i) { d.onclick = function () { go(i); auto(); }; });
  auto();

  // testimonials
  var tm = $$('.tm-i'), ti = 0;
  setInterval(function () { tm[ti].classList.remove('on'); ti = (ti + 1) % tm.length; tm[ti].classList.add('on'); }, 5500);

  // deal countdown — resets daily at midnight
  function tick() {
    var n = new Date(), e = new Date(n); e.setHours(23, 59, 59, 999);
    var d = Math.floor((e - n) / 1000), p = function (v) { return ('0' + v).slice(-2); };
    $('#h').textContent = p(Math.floor(d / 3600)); $('#m').textContent = p(Math.floor(d % 3600 / 60)); $('#s').textContent = p(d % 60);
  }
  tick(); setInterval(tick, 1000);

  // nav
  $('#burger').onclick = function () { $('#menu').classList.toggle('open'); };
  $$('#menu a').forEach(function (a) { a.onclick = function () { $('#menu').classList.remove('open'); }; });
  window.addEventListener('scroll', function () { $('#header').classList.toggle('shadow', scrollY > 10); });
  $('#yr').textContent = new Date().getFullYear();

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .1 });
  $$('.rv-in').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el); });
  render(); apply();
})();
