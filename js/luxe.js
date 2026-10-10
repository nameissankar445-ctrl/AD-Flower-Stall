(function () {
  var PHONE = '919949179933'; // TODO: replace with the real WhatsApp number
  var P = [
    { id: 1, n: 'Classic Red Roses', s: 'Bunch of 12', p: 349, c: 'Roses', i: 'rose-red', t: 'Bestseller' },
    { id: 2, n: 'Pink Garden Roses', s: 'Bunch of 10', p: 399, c: 'Roses', i: 'roses-pink', t: 'Fragrant' },
    { id: 3, n: 'Rainbow Roses', s: 'Bunch of 10', p: 599, c: 'Roses', i: 'roses-rainbow', t: 'Unique' },
    { id: 4, n: 'Garden Bouquet', s: 'Hand-tied, large', p: 1299, c: 'Bouquets', i: 'bouquet-garden', t: 'Designer' },
    { id: 5, n: 'Peach & Peony Posy', s: 'Hand-tied, medium', p: 899, c: 'Bouquets', i: 'bouquet-peach', t: 'New' },
    { id: 6, n: 'Jewel Tone Bouquet', s: 'Hand-tied, large', p: 1499, c: 'Bouquets', i: 'bouquet-dark', t: 'Premium' },
    { id: 7, n: 'Golden Sunflowers', s: 'Bunch of 8', p: 299, c: 'Seasonal', i: 'sunflowers', t: 'Seasonal' },
    { id: 8, n: 'Striped Tulips', s: 'Bunch of 10', p: 549, c: 'Seasonal', i: 'tulips-field', t: 'Seasonal' },
    { id: 9, n: 'Pink Tulip Vase', s: 'With glass jar', p: 699, c: 'Seasonal', i: 'tulips-jar', t: 'Gift' },
    { id: 10, n: 'Red Begonia Basket', s: 'Mixed bloom', p: 449, c: 'Seasonal', i: 'begonia-red', t: 'Fresh' },
    { id: 11, n: 'Love Heart Bouquet', s: 'Assorted blooms', p: 1199, c: 'Bouquets', i: 'heart-bouquet', t: 'Gift' },
    { id: 12, n: 'Poppy Meadow Bunch', s: 'Bunch of 15', p: 249, c: 'Seasonal', i: 'hero-poppies', t: 'Seasonal' }
  ];
  var $ = function (s) { return document.querySelector(s); };
  var cart = {};
  var rupee = function (n) { return '₹' + n.toLocaleString('en-IN'); };

  // marquee
  var words = ['Roses', 'Marigolds', 'Jasmine', 'Lotus', 'Garlands', 'Bouquets', 'Tulips', 'Sunflowers', 'Wedding Décor', 'Puja Flowers'];
  var m = $('#marq'); m.innerHTML = words.concat(words).map(function (w) { return '<span>' + w + '</span>'; }).join('');

  // products
  var grid = $('#grid');
  grid.innerHTML = P.map(function (x) {
    return '<article class="card rv-in" data-c="' + x.c + '"><div class="im"><img loading="lazy" src="assets/img/' + x.i + '.jpg" alt="' + x.n + '"/><span class="tag">' + x.t + '</span></div>' +
      '<div class="bd"><h3>' + x.n + '</h3><span class="sub">' + x.s + '</span><div class="row"><div class="price">' + rupee(x.p) + '</div>' +
      '<button class="add" data-id="' + x.id + '" aria-label="Add ' + x.n + '">+</button></div></div></article>';
  }).join('');

  function filter(f) {
    document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c.dataset.f === f); });
    document.querySelectorAll('.card').forEach(function (c) { c.classList.toggle('hide', f !== 'all' && c.dataset.c !== f); });
  }
  $('#filters').addEventListener('click', function (e) { if (e.target.dataset.f) filter(e.target.dataset.f); });
  document.querySelectorAll('.col').forEach(function (c) { c.addEventListener('click', function () { filter(c.dataset.f); }); });

  // cart
  function render() {
    var ids = Object.keys(cart), n = 0, t = 0;
    $('#dItems').innerHTML = ids.length ? ids.map(function (id) {
      var x = P.filter(function (p) { return p.id == id; })[0], q = cart[id]; n += q; t += q * x.p;
      return '<div class="d-it"><img src="assets/img/' + x.i + '.jpg" alt=""/><div><b>' + x.n + '</b><small>' + x.s + ' · ' + rupee(x.p) + '</small></div>' +
        '<div class="qty"><button data-m="' + id + '">–</button><span>' + q + '</span><button data-p="' + id + '">+</button></div></div>';
    }).join('') : '<p class="empty">Your order is empty.<br/>Add some flowers 🌸</p>';
    $('#cnt').textContent = n; $('#tot').textContent = rupee(t);
    $('#cartBtn').classList.toggle('show', n > 0);
    if (!n) toggle(false);
  }
  function toggle(o) { $('#drawer').classList.toggle('open', o); $('#shade').classList.toggle('on', o); }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.add'); if (!b) return;
    cart[b.dataset.id] = (cart[b.dataset.id] || 0) + 1; render();
    b.textContent = '✓'; setTimeout(function () { b.textContent = '+'; }, 700);
  });
  $('#dItems').addEventListener('click', function (e) {
    var p = e.target.dataset.p, m = e.target.dataset.m;
    if (p) cart[p]++; if (m && --cart[m] <= 0) delete cart[m]; render();
  });
  $('#cartBtn').onclick = function () { toggle(true); };
  $('#dClose').onclick = $('#shade').onclick = function () { toggle(false); };
  $('#send').onclick = function () {
    var t = 0, lines = Object.keys(cart).map(function (id) {
      var x = P.filter(function (p) { return p.id == id; })[0]; t += cart[id] * x.p;
      return '• ' + x.n + ' (' + x.s + ') × ' + cart[id] + ' = ' + rupee(cart[id] * x.p);
    });
    var msg = 'Hello AD Flower Stall! I would like to order:\n' + lines.join('\n') + '\n\nEstimated total: ' + rupee(t) + '\nPlease confirm availability & delivery.';
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  };

  // enquiry form -> WhatsApp
  $('#orderForm').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    var msg = 'Hello AD Flower Stall!\nName: ' + f.name.value + '\nPhone: ' + f.phone.value + '\nOccasion: ' + f.occ.value +
      '\nNeeded on: ' + (f.date.value || 'flexible') + '\nDetails: ' + (f.msg.value || '-');
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  });

  // nav
  $('#burger').onclick = function () { $('#menu').classList.toggle('open'); };
  document.querySelectorAll('#menu a').forEach(function (a) { a.onclick = function () { $('#menu').classList.remove('open'); }; });
  window.addEventListener('scroll', function () { $('#header').classList.toggle('shadow', scrollY > 10); });
  $('#yr').textContent = new Date().getFullYear();

  // reveal on scroll
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.rv-in').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el); });
  render();
})();
