(() => {
  'use strict';

  const cursor = document.getElementById('cursor');
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ MENU / NAVEGAÇÃO ============ */
  if (navToggle && navLinks) {
    const setMenuState = (open) => {
      navLinks.classList.toggle('open', open);
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    navToggle.addEventListener('click', () => {
      setMenuState(!navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 880) setMenuState(false);
    });
  }

  /* ============ TILT DOS CARDS ============ */
  document.querySelectorAll('.proj-card').forEach((card) => {
    card.style.setProperty('--tilt', `${card.dataset.tilt || 0}deg`);
  });

  /* ============ FALLBACK DA NAV SEM GSAP ============ */
  const updateNav = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 80);
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* ============ GSAP ============ */
  const hasGsap = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  if (hasGsap && hasScrollTrigger) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => nav && nav.classList.toggle('scrolled', self.scroll() > 80)
    });

    /* ============ CURSOR CUSTOM ============ */
    if (!isTouch && cursor) {
      document.documentElement.classList.add('has-custom-cursor');

      let mx = window.innerWidth / 2;
      let my = window.innerHeight / 2;
      let cx = mx;
      let cy = my;
      let cursorWordEl = null;

      window.addEventListener('mousemove', (event) => {
        mx = event.clientX;
        my = event.clientY;

        if (cursorWordEl) {
          cursorWordEl.style.left = `${mx}px`;
          cursorWordEl.style.top = `${my}px`;
        }
      }, { passive: true });

      gsap.ticker.add(() => {
        cx += (mx - cx) * 0.18;
        cy += (my - cy) * 0.18;
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%) rotate(${(mx - cx) * 2}deg)`;
      });

      document.querySelectorAll('a, button, .proj-card, .skill-chip').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('big');
          const word = el.getAttribute('data-cursor-word');

          if (word) {
            cursorWordEl?.remove();
            cursorWordEl = document.createElement('div');
            cursorWordEl.className = 'cursor-word';
            cursorWordEl.textContent = word;
            cursorWordEl.style.left = `${mx}px`;
            cursorWordEl.style.top = `${my}px`;
            document.body.appendChild(cursorWordEl);
            requestAnimationFrame(() => cursorWordEl?.classList.add('show'));
          }
        });

        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('big');
          cursorWordEl?.remove();
          cursorWordEl = null;
        });
      });
    }

    if (!reduceMotion) {
      /* ============ HERO ============ */
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTl
        .from('.logo', { y: -20, opacity: 0, duration: 0.6 })
        .from('.nav-links a', { y: -14, opacity: 0, duration: 0.5, stagger: 0.06 }, '-=0.4')
        .from('.tape', { y: -30, opacity: 0, rotate: -20, duration: 0.7 }, '-=0.2')
        .from('.hero .eyebrow-hand', { opacity: 0, y: 14, duration: 0.5 }, '-=0.2')
        .from('.hero-title .line', { yPercent: 120, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.2')
        .from('.hero-sub', { opacity: 0, y: 14, duration: 0.5 }, '-=0.4')
        .from('.hero-actions .btn', { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .from('.polaroid', { opacity: 0, scale: 0.85, rotate: 14, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.9')
        .from('.washi', { opacity: 0, x: 20, duration: 0.5 }, '-=0.4')
        .from('.scribble', { opacity: 0, scale: 0.6, duration: 0.6, ease: 'back.out(2)' }, '-=0.3')
        .from('.marquee', { opacity: 0, duration: 0.6 }, '-=0.2');

      gsap.to('.marquee-track', {
        xPercent: -50,
        duration: 18,
        repeat: -1,
        ease: 'none'
      });

      /* ============ REVEALS ============ */
      document.querySelectorAll('section').forEach((section) => {
        const head = section.querySelector('.section-head');
        if (!head) return;

        gsap.from(head.children, {
          scrollTrigger: { trigger: head, start: 'top 82%' },
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out'
        });
      });

      const photoFrame = document.querySelector('.photo-frame');
      if (photoFrame) {
        gsap.from(photoFrame, {
          scrollTrigger: { trigger: '.sobre', start: 'top 70%' },
          rotate: -14,
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: 'back.out(1.3)'
        });
      }

      if (document.querySelector('.sobre-text')) {
        gsap.from('.sobre-text > *', {
          scrollTrigger: { trigger: '.sobre-text', start: 'top 75%' },
          y: 24,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power2.out'
        });
      }

      gsap.utils.toArray('.proj-card').forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 88%' },
          y: 50,
          opacity: 0,
          rotate: index % 2 === 0 ? -6 : 6,
          duration: 0.7,
          ease: 'power3.out'
        });
      });

      gsap.utils.toArray('.servico-item').forEach((item) => {
        gsap.from(item, {
          scrollTrigger: { trigger: item, start: 'top 90%' },
          opacity: 0,
          x: -30,
          duration: 0.6,
          ease: 'power2.out'
        });
      });

      if (document.querySelector('.contato-links')) {
        gsap.from('.contato-links > *', {
          scrollTrigger: { trigger: '.contato-links', start: 'top 85%' },
          opacity: 0,
          y: 24,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out'
        });
      }
    }
  } else {
    /* O site continua funcionando mesmo se o CDN do GSAP não carregar. */
    console.warn('GSAP/ScrollTrigger não carregou. O site continuará sem animações.');
  }
})();
