/* AD Flower Stall — language switcher (Telugu, Hindi, Urdu, Tamil, Kannada, Malayalam).
   English text stays in the HTML (good for search engines). When a visitor picks a language, this script swaps the visible text
   using the dictionary in js/i18n-data.js (loaded only when needed). The choice is remembered in localStorage 'adfs_lang'.
   WhatsApp messages stay in English so the stall can read them; the chosen language is added as a line. */
(function () {
  'use strict';
  var KEY = 'adfs_lang';
  var LANGS = [['en', 'English', 'EN', 'English'], ['te', 'తెలుగు', 'తె', 'Telugu'], ['hi', 'हिन्दी', 'हि', 'Hindi'], ['ur', 'اردو', 'اردو', 'Urdu'], ['ta', 'தமிழ்', 'த', 'Tamil'], ['kn', 'ಕನ್ನಡ', 'ಕ', 'Kannada'], ['ml', 'മലയാളം', 'മ', 'Malayalam']];
  var FONTS = {
    te: 'family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Serif+Telugu:wght@600;700',
    hi: 'family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@600;700',
    ur: 'family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@600;700',
    ta: 'family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Serif+Tamil:wght@600;700',
    kn: 'family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Serif+Kannada:wght@600;700',
    ml: 'family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Noto+Serif+Malayalam:wght@600;700'
  };
  var me = document.currentScript, base = me && me.src ? me.src.replace(/[^\/]*$/, '') : 'js/';
  var cur = 'en', data = null, dataCb = [], store = new WeakMap(), heads = [], mo = null;
  var norm = function (s) { return String(s).replace(/\s+/g, ' ').trim(); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var col = function () { return data ? data.langs.indexOf(cur) : -1; };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function tr(text) {
    var i = col(); if (i < 0) return null;
    var k = norm(text), v = data.d[k];
    if (v) return v[i];
    var m = /^(\d+) flowers?$/.exec(k); if (m && data.p) return data.p.count[i].replace('{n}', m[1]);
    m = /^No flowers match “(.*)”\. Try another name or choose All flowers\.$/.exec(k); if (m && data.p) return data.p.none[i].replace('{q}', m[1]);
    return null;
  }

  /* ---------- text nodes ---------- */
  function doText(n) {
    var v = n.nodeValue, rec = store.get(n);
    if (rec && v === rec.t) {
      var t = cur === 'en' ? rec.o : (tr(rec.o) || rec.o);
      if (cur === 'en') store.delete(n); else rec.t = t;
      if (t !== v) n.nodeValue = t;
      return;
    }
    if (rec) store.delete(n);
    if (cur === 'en' || !/\S/.test(v)) return;
    var t2 = tr(v);
    if (t2) { var nv = v.match(/^\s*/)[0] + t2 + v.match(/\s*$/)[0]; store.set(n, { o: v, t: nv }); n.nodeValue = nv; }
  }
  var ATTRS = ['placeholder', 'aria-label', 'title'];
  function doAttr(el, a) {
    if (!el.hasAttribute || !el.hasAttribute(a)) return;
    var rec = el.__i18n && el.__i18n[a], v = el.getAttribute(a);
    if (rec && v === rec.t) {
      var t = cur === 'en' ? rec.o : (tr(rec.o) || rec.o);
      if (cur === 'en') delete el.__i18n[a]; else rec.t = t;
      if (t !== v) el.setAttribute(a, t);
      return;
    }
    if (rec) delete el.__i18n[a];
    if (cur === 'en') return;
    var t2 = tr(v);
    if (t2) { (el.__i18n = el.__i18n || {})[a] = { o: v, t: t2 }; el.setAttribute(a, t2); }
  }
  function skipEl(el) { return !el || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|SVG)$/i.test(el.nodeName) || (el.closest && el.closest('[data-i18n-head],[translate=no],.lgsw')); }
  function walk(root) {
    if (root.nodeType === 3) { if (!skipEl(root.parentNode)) doText(root); return; }
    if (root.nodeType !== 1 || skipEl(root)) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return skipEl(n.parentNode) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }), n;
    while ((n = w.nextNode())) doText(n);
    var els = root.querySelectorAll ? [root].concat([].slice.call(root.querySelectorAll('[placeholder],[aria-label],[title]'))) : [];
    els.forEach(function (e) { if (!skipEl(e)) ATTRS.forEach(function (a) { doAttr(e, a); }); });
  }

  /* ---------- headings (their words are split into animated spans) ---------- */
  function initHeads() {
    if (heads.length) return;
    [].slice.call(document.querySelectorAll('#h1,.sh h2')).forEach(function (el) {
      el.setAttribute('data-i18n-head', '1');
      heads.push({ el: el, html: el.innerHTML, key: norm(el.textContent), hero: el.id === 'h1' });
    });
  }
  function doHeads() {
    heads.forEach(function (h) {
      if (cur === 'en') { if (h.el.__x) { h.el.innerHTML = h.html; h.el.__x = 0; } return; }
      var out = null;
      if (h.hero) { var a = tr('Fresh flowers,'), b = tr('every single morning.'); if (a && b) out = esc(a) + ' <em>' + esc(b) + '</em>'; }
      else { var t = tr(h.key); if (t) out = esc(t); }
      if (out !== null) { h.el.innerHTML = out; h.el.__x = 1; }
      else if (h.el.__x) { h.el.innerHTML = h.html; h.el.__x = 0; }
    });
  }

  /* ---------- apply / observe ---------- */
  function applyAll() {
    initHeads(); doHeads(); walk(document.body);
    if (mo) mo.takeRecords();
  }
  function observe(on) {
    if (!on) { if (mo) { mo.disconnect(); mo = null; } return; }
    if (mo) return;
    mo = new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'characterData') { if (!skipEl(m.target.parentNode)) doText(m.target); }
        else if (m.type === 'attributes') { if (!skipEl(m.target)) doAttr(m.target, m.attributeName); }
        else m.addedNodes.forEach(walk);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  /* ---------- loading data / fonts ---------- */
  function loadData(cb) {
    if (data) return cb();
    dataCb.push(cb);
    if (dataCb.length > 1) return;
    var s = document.createElement('script'); s.src = base + 'i18n-data.js';
    s.onload = function () { data = window.ADFS_I18N; var q = dataCb.slice(); dataCb = []; q.forEach(function (f) { f(); }); };
    s.onerror = function () { dataCb = []; };
    document.head.appendChild(s);
  }
  function loadFont(l) {
    if (!FONTS[l] || document.getElementById('lf-' + l)) return;
    var k = document.createElement('link'); k.id = 'lf-' + l; k.rel = 'stylesheet'; k.href = 'https://fonts.googleapis.com/css2?' + FONTS[l] + '&display=swap'; document.head.appendChild(k);
  }

  /* ---------- switcher UI ---------- */
  var btnCode = null, menu = null;
  function buildUI() {
    var host = $('.hr2'); if (!host || $('.lgsw')) return;
    var w = document.createElement('div'); w.className = 'lgsw';
    w.innerHTML = '<button type="button" class="lgb" aria-haspopup="true" aria-expanded="false" aria-label="Language" title="Language"><svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c-2.8 3-2.8 15 0 18M12 3c2.8 3 2.8 15 0 18"/></svg><span class="lgc">EN</span></button>' +
      '<div class="lgm" role="menu"><p class="lgh">Choose language <span lang="te">· భాష</span></p><ul>' + LANGS.map(function (l) { return '<li role="none"><button type="button" role="menuitemradio" data-l="' + l[0] + '" lang="' + l[0] + '"><b>' + l[1] + '</b><small>' + (l[0] === 'en' ? 'Default' : l[3]) + '</small><svg class="ck2" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></button></li>'; }).join('') + '</ul></div>';
    host.insertBefore(w, host.firstChild);
    btnCode = $('.lgc', w); menu = $('.lgm', w); var b = $('.lgb', w);
    b.onclick = function (e) { e.stopPropagation(); var o = !w.classList.contains('open'); w.classList.toggle('open', o); b.setAttribute('aria-expanded', o); };
    menu.onclick = function (e) { var x = e.target.closest('button[data-l]'); if (x) { setLang(x.dataset.l, true); w.classList.remove('open'); b.setAttribute('aria-expanded', false); } };
    document.addEventListener('click', function () { w.classList.remove('open'); b.setAttribute('aria-expanded', false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') w.classList.remove('open'); });
    mark();
  }
  function mark() {
    if (!menu) return;
    [].forEach.call(menu.querySelectorAll('button'), function (x) { x.classList.toggle('on', x.dataset.l === cur); x.setAttribute('aria-checked', x.dataset.l === cur); });
    var l = LANGS.filter(function (x) { return x[0] === cur; })[0]; if (btnCode) btnCode.textContent = l[2];
  }

  /* ---------- switch ---------- */
  function setLang(l, save) {
    if (!LANGS.some(function (x) { return x[0] === l; })) l = 'en';
    var prev = cur; cur = l;
    var de = document.documentElement, info = LANGS.filter(function (x) { return x[0] === l; })[0];
    if (save) { try { localStorage.setItem(KEY, l); } catch (e) {} }
    de.lang = l; de.dir = l === 'ur' ? 'rtl' : 'ltr'; de.classList.toggle('xl', l !== 'en'); de.setAttribute('data-l', l);
    window.ADFS_LANG = { code: l, name: info[3] };
    mark();
    if (l === 'en') { if (prev !== 'en') { applyAll(); } observe(false); document.dispatchEvent(new Event('adfs:lang')); return; }
    loadFont(l);
    loadData(function () { if (cur !== l) return; applyAll(); observe(true); document.dispatchEvent(new Event('adfs:lang')); });
  }

  function start() {
    window.ADFS_LANG = { code: 'en', name: 'English' };
    buildUI();
    var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved && saved !== 'en') setLang(saved, false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.ADFS_I18N_API = { set: function (l) { setLang(l, true); }, get: function () { return cur; } };
})();
