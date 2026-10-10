(function () {
  var b = document.getElementById('toTop'); if (!b) return;
  window.addEventListener('scroll', function () { b.classList.toggle('show', window.scrollY > 500); });
  b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
