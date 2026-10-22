/* When an admin is signed in (Supabase session in this browser), the "Admin Login" links on the public pages become an admin bar:
   [Admin → dashboard] | avatar + email | [Logout]. Signing out just clears the local session. */
(function () {
  var key = null, email = '';
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (/^sb-.*-auth-token$/.test(k) && localStorage.getItem(k)) { key = k; break; }
    }
    if (key) { var s = JSON.parse(localStorage.getItem(key)); email = (s && s.user && s.user.email) || ''; }
  } catch (e) {}
  if (!key) return;

  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ic = function (p) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
  var shield = ic('<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>');
  var out = ic('<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>');

  var bar = document.createElement('div');
  bar.className = 'adbar';
  bar.innerHTML = '<a class="adp" href="admin/">' + shield + 'Admin</a><span class="adu"><b>' + esc((email || 'A').charAt(0).toUpperCase()) + '</b>' + esc(email) + '</span><button type="button" class="ado">' + out + 'Logout</button>';
  bar.querySelector('.ado').onclick = function () {
    try { localStorage.removeItem(key); } catch (e) {}
    location.reload();
  };

  var a = document.querySelector('a.adm');
  if (a) a.replaceWith(bar);
  var m = document.querySelector('a.nv-adm');
  if (m) {
    m.textContent = 'Admin Dashboard'; m.setAttribute('href', 'admin/');
    var lo = document.createElement('a'); lo.className = 'nv-adm'; lo.href = '#'; lo.textContent = 'Logout';
    lo.onclick = function (e) { e.preventDefault(); try { localStorage.removeItem(key); } catch (x) {} location.reload(); };
    m.after(lo);
  }
  // any other plain admin links (footer)
  Array.prototype.forEach.call(document.querySelectorAll('a[href$="admin/login.html"]'), function (l) {
    l.setAttribute('href', 'admin/');
    var t = Array.prototype.filter.call(l.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); })[0];
    if (t) t.textContent = 'Admin Dashboard';
  });
})();
