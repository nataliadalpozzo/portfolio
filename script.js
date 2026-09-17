// =============================================
// SETUP
// =============================================
document.getElementById('year').textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

// =============================================
// CUSTOM CURSOR
// =============================================
if (!isTouch) {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('[data-hover]').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });
}

// =============================================
// MOBILE NAV
// =============================================
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => {
  mainNav.classList.toggle('is-open');
});
mainNav.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => mainNav.classList.remove('is-open'));
});

// =============================================
// GLITCH TEXT TRIGGER
// =============================================
function triggerGlitch(el) {
  if (prefersReducedMotion) return;
  el.setAttribute('data-glitching', 'true');
  setTimeout(() => el.removeAttribute('data-glitching'), 600);
}

document.querySelectorAll('[data-glitch]').forEach((el) => {
  el.addEventListener('mouseenter', () => triggerGlitch(el));
});

// glitch the hero title once on load
window.addEventListener('load', () => {
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) setTimeout(() => triggerGlitch(heroTitle), 400);
});

// glitch the contact title when it scrolls into view
if (window.gsap && window.ScrollTrigger) {
  const contatoTitle = document.querySelector('.contato-title');
  if (contatoTitle) {
    ScrollTrigger.create({
      trigger: contatoTitle,
      start: 'top 80%',
      once: true,
      onEnter: () => triggerGlitch(contatoTitle),
    });
  }
}

// =============================================
// SCROLL REVEALS (staggered, one orchestrated pass per section)
// =============================================
if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {

  // Sobre
  gsap.from('.sobre-text > *', {
    scrollTrigger: { trigger: '.sobre', start: 'top 75%' },
    y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
  });
  gsap.from('.skills-list li', {
    scrollTrigger: { trigger: '.sobre', start: 'top 75%' },
    x: 20, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out',
  });

  // Serviços — stagger grid
  gsap.from('.servico-item', {
    scrollTrigger: { trigger: '.servicos-grid', start: 'top 80%' },
    y: 40, opacity: 0, duration: 0.6, stagger: { each: 0.06, grid: 'auto', from: 'start' }, ease: 'power2.out',
  });

  // Projetos — cards
  gsap.from('.projeto-card', {
    scrollTrigger: { trigger: '.projetos-grid', start: 'top 80%' },
    y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
  });

  // Contato links
  gsap.from('.contato-link', {
    scrollTrigger: { trigger: '.contato-links', start: 'top 85%' },
    x: -40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
  });

  // Section labels
  gsap.utils.toArray('.section-label').forEach((label) => {
    gsap.from(label, {
      scrollTrigger: { trigger: label, start: 'top 90%' },
      x: -20, opacity: 0, duration: 0.5, ease: 'power2.out',
    });
  });

  // =============================================
  // PARALLAX — hero grid + marquee speed on scroll
  // =============================================
  gsap.to('.hero-bg-grid', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    y: 120,
    ease: 'none',
  });

  gsap.to('.hero-kicker', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    y: -60,
    opacity: 0.3,
    ease: 'none',
  });

  gsap.to('.hero-title', {
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    y: 40,
    ease: 'none',
  });

  // =============================================
  // PROJECT MOCKUP TILT ON MOUSE (subtle 3D)
  // =============================================
  if (!isTouch) {
    document.querySelectorAll('.projeto-mockup').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateX: py * -10,
          rotateY: px * 10,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 700,
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });
      });
    });
  }
}

// =============================================
// HEADER SHRINK / STICKER BOB (subtle continuous motion)
// =============================================
if (window.gsap && !prefersReducedMotion) {
  gsap.to('.freela-sticker', {
    rotate: 4,
    duration: 1.4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}
