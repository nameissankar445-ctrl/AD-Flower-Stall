(function () {
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  // Shop dropdown: reuse the category-banner / tab click handlers in shop.js
  $$('.dd-menu a, .ft-col a[data-cat]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.ADFS) window.ADFS.filter(a.dataset.cat === 'all' ? '' : a.dataset.cat);
      $('#menu').classList.remove('open');
    });
  });

  // active-link highlight while scrolling
  var spy = ['home', 'categories', 'shop', 'deal', 'blog', 'contact'];
  function onScroll() {
    var cur = 'home', y = window.scrollY + 160;
    spy.forEach(function (id) { var el = document.getElementById(id); if (el && el.offsetTop <= y) cur = id; });
    $$('#menu>li>a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', onScroll); onScroll();

  // cookie consent
  var KEY = 'adfs_cookie', ck = $('#cookie');
  function saved() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} ck.hidden = true; $('#ckModal').hidden = true; }
  if (!saved()) setTimeout(function () { ck.hidden = false; }, 1200);
  $('#ckAccept').onclick = $('#ckAll').onclick = function () { store({ essential: 1, analytics: 1, marketing: 1 }); };
  $('#ckDecline').onclick = function () { store({ essential: 1, analytics: 0, marketing: 0 }); };
  $('#ckSave').onclick = function () { store({ essential: 1, analytics: +$('#ckAn').checked, marketing: +$('#ckMk').checked }); };
  function openCk(e) { if (e) e.preventDefault(); var s = saved() || {}; $('#ckAn').checked = !!s.analytics; $('#ckMk').checked = !!s.marketing; $('#ckModal').hidden = false; }
  $('#ckSettings').onclick = openCk; $('#cookieSet').onclick = openCk;
  $('#ckModal').addEventListener('click', function (e) { if (e.target.id === 'ckModal') e.target.hidden = true; });

  // mobile menu (slide-in panel) + bottom bar
  var menu = $('#menu'), shade = $('#shade');
  function setMenu(o) { $('#header').classList.toggle('menu-open', o); menu.classList.toggle('open', o); shade.classList.toggle('on', o); document.body.classList.toggle('lock', o); }
  var bg = $('#burger'); if (bg) bg.onclick = function () { setMenu(!menu.classList.contains('open')); };
  var mc = $('#mClose'); if (mc) mc.onclick = function () { setMenu(false); };
  var mm = $('#mbMore'); if (mm) mm.onclick = function () { setMenu(true); };
  var mcart = $('#mbCart'); if (mcart) mcart.onclick = function () { if (window.ADFS) window.ADFS.openCart(); };
  shade.addEventListener('click', function () { setMenu(false); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  function barSpy() {
    var cur = 'home', y = window.scrollY + 160;
    ['home', 'shop'].forEach(function (id) { var el = document.getElementById(id); if (el && el.offsetTop <= y) cur = id; });
    if (y > (document.getElementById('deal') || {}).offsetTop) cur = '';
    $$('.mbar a[data-s]').forEach(function (a) { a.classList.toggle('on', a.dataset.s === cur); });
  }
  window.addEventListener('scroll', barSpy, { passive: true }); barSpy();
})();
