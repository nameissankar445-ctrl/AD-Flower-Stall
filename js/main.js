// ============================================================
//  AD Flower Stall — Main JavaScript
// ============================================================

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ===== ANNOUNCEMENT BAR =====
$('annClose')?.addEventListener('click', () => $('annBar').classList.add('gone'));
setTimeout(() => $('annBar')?.classList.add('gone'), 10000);

// ===== NAVBAR SCROLL =====
const navbar = $('navbar');
const navLogoImg = document.querySelector('.nav-logo img');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 50);
  navLogoImg?.setAttribute('src', y > 50 ? 'images/logo.svg' : 'images/logo-white.svg');
  if (y > 400) $('scrollTop')?.classList.add('on');
  else $('scrollTop')?.classList.remove('on');
});

// ===== MOBILE MENU =====
$('hamBtn')?.addEventListener('click', () => $('mobileMenu').classList.add('open'));
$('mobClose')?.addEventListener('click', () => $('mobileMenu').classList.remove('open'));
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => $('mobileMenu').classList.remove('open')));

// ===== HERO SCROLL =====
$('heroScroll')?.addEventListener('click', () => {
  (document.querySelector('.trust-strip') || document.querySelector('.categories'))
    ?.scrollIntoView({ behavior: 'smooth' });
});

// ===== SCROLL TO TOP =====
$('scrollTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== TOAST =====
function toast(msg, color) {
  const wrap = $('toastWrap');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  if (color) t.style.borderLeftColor = color;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('in')));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 450); }, 3200);
}

// ===== CART =====
let cartCount = 0;
function addToCart(name) {
  cartCount++;
  const badge = $('cartBadge');
  badge.textContent = cartCount;
  badge.style.transform = 'scale(1.6)';
  setTimeout(() => badge.style.transform = 'scale(1)', 300);
  toast(`✓ ${name} added to cart`, '#d4a83e');
}
$$('.pc-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.closest('.pc')?.querySelector('.pc-name')?.textContent || 'Flower';
    addToCart(name);
    const orig = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.background = 'linear-gradient(135deg,#4a9965,#1e4a2e)';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
  });
});

// ===== WISHLIST =====
$$('.wl').forEach(btn => {
  btn.addEventListener('click', () => {
    const on = btn.classList.toggle('wl-on');
    btn.textContent = on ? '♥' : '♡';
    btn.style.color = on ? '#c9931e' : '';
    toast(on ? '♥ Saved to wishlist' : 'Removed from wishlist');
  });
});

// ===== CATEGORIES =====
$$('.cat-card').forEach(card => {
  card.addEventListener('click', () => {
    $$('.cat-card').forEach(c => c.style.borderColor = '');
    card.style.borderColor = 'var(--sage)';
    toast(`🌿 Browsing: ${card.querySelector('.cat-nm').textContent}`);
  });
});

// ===== FAQ ACCORDION =====
$$('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    $$('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ===== ORDER FORM =====
$('orderForm')?.addEventListener('submit', e => {
  e.preventDefault();
  toast("✓ Order request sent! We'll contact you soon.", '#2d7048');
  e.target.reset();
});

// ===== NEWSLETTER =====
$('nlForm')?.addEventListener('submit', e => {
  e.preventDefault();
  toast('✓ Subscribed! Welcome to AD Flower Stall.', '#d4a83e');
  e.target.reset();
});

// ===== SCROLL REVEAL =====
const revObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
$$('.reveal').forEach(el => revObs.observe(el));

// ===== COOKIE CONSENT =====
(function initCookie() {
  if (!localStorage.getItem('adfs_cookie_consent')) {
    setTimeout(() => $('cookieBar')?.classList.add('show'), 1800);
  }
  $('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('adfs_cookie_consent', 'accepted');
    $('cookieBar').classList.remove('show');
    toast('🍪 Cookies accepted. Thank you!', '#4a9965');
  });
  $('cookieDecline')?.addEventListener('click', () => {
    localStorage.setItem('adfs_cookie_consent', 'declined');
    $('cookieBar').classList.remove('show');
  });
})();

// ===== SMOOTH NAV LINKS =====
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
