/* Google Analytics 4 — loads ONLY after the visitor accepts Analytics cookies (choice stored in localStorage 'adfs_cookie').
   1. Create a GA4 property at analytics.google.com → Admin → Data streams → Web → copy the Measurement ID (G-XXXXXXXXXX).
   2. Paste it below. Leave it as is to keep analytics switched off. */
(function () {
  'use strict';
  var GA_ID = 'G-XXXXXXXXXX';
  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID) || GA_ID === 'G-XXXXXXXXXX') return;

  var started = false;
  function allowed() { try { var c = JSON.parse(localStorage.getItem('adfs_cookie')); return !!(c && c.analytics); } catch (e) { return false; } }
  function start() {
    if (started || !allowed()) return; started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: true });
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
  }
  start();
  document.addEventListener('adfs:consent', function () { if (allowed()) start(); else if (started) window['ga-disable-' + GA_ID] = true; });
})();
