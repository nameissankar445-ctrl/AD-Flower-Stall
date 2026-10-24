(function () {
  var $ = function (s) { return document.querySelector(s); };
  var ck = $('#ck'), cm = $('#cm'), KEY = 'adfs_cookie';
  function saved() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} document.dispatchEvent(new Event('adfs:consent')); ck.hidden = true; cm.hidden = true; document.body.classList.remove('lock'); }
  if (!saved()) setTimeout(function () { ck.hidden = false; }, 1500);
  $('#cka').onclick = $('#cmal').onclick = function () { store({ essential: 1, analytics: 1, marketing: 1 }); };
  $('#ckd').onclick = function () { store({ essential: 1, analytics: 0, marketing: 0 }); };
  $('#cmsv').onclick = function () { store({ essential: 1, analytics: +$('#cm-an').checked, marketing: +$('#cm-mk').checked }); };
  function openCm() { var s = saved() || {}; $('#cm-an').checked = s.analytics === 1; $('#cm-mk').checked = s.marketing === 1; cm.hidden = false; document.body.classList.add('lock'); }
  $('#cks').onclick = openCm; ['#ckr', '#ckr2'].forEach(function (id) { var b = $(id); if (b) b.onclick = openCm; });
  $('#cmx').onclick = function () { cm.hidden = true; document.body.classList.remove('lock'); };
  cm.addEventListener('click', function (e) { if (e.target === cm) { cm.hidden = true; document.body.classList.remove('lock'); } });
  var up = $('#up'); up.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
  var sp = document.createElement('div'); sp.id = 'sp'; document.body.appendChild(sp);
  function hdr() { var mx = document.documentElement.scrollHeight - innerHeight; sp.style.width = (mx > 0 ? scrollY / mx * 100 : 0) + '%'; $('#hd').classList.toggle('stuck', scrollY > 40); up.classList.toggle('on', scrollY > 600); }
  addEventListener('scroll', hdr, { passive: true }); hdr();
  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  function menu(o) { $('#nv').classList.toggle('on', o); $('#sh2').classList.toggle('on', o); }
  $('#bt').onclick = function () { menu(!$('#nv').classList.contains('on')); }; $('#sh2').onclick = function () { menu(false); };
  var cb = $('#cb'); if (cb) cb.onclick = function () { location.href = 'index.html#shop'; };
  var nl = $('#nlf'); if (nl) nl.addEventListener('submit', function (e) { e.preventDefault(); window.open('https://wa.me/919949179933?text=' + encodeURIComponent('Hi! Please add me to your offers list. My number: ' + $('#nlp').value), '_blank'); });
})();
