(() => {
  'use strict';

  const q = (selector, scope = document) => scope.querySelector(selector);
  const qa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const cursor = q('#cursor');
  const nav = q('#nav');
  const navToggle = q('#navToggle');
  const navLinks = q('.nav-links');
  const loader = q('#siteLoader');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- fallback: nunca deixa o loader prender o site ---------- */
  const finishLoadingFallback = () => {
    document.body.classList.remove('is-loading');
    loader?.classList.add('loader-fallback-out');
    window.setTimeout(() => loader?.remove(), 650);
  };
  const loaderSafety = window.setTimeout(finishLoadingFallback, 3800);

  /* ---------- navegação ---------- */
  if (navToggle && navLinks) {
    const setMenuState = (open) => {
      navLinks.classList.toggle('open', open);
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    navToggle.addEventListener('click', () => setMenuState(!navLinks.classList.contains('open')));
    qa('a', navLinks).forEach((link) => link.addEventListener('click', () => setMenuState(false)));
    window.addEventListener('resize', () => window.innerWidth > 880 && setMenuState(false));
  }

  const updateNav = () => nav?.classList.toggle('scrolled', window.scrollY > 80);
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  qa('.proj-card').forEach((card) => card.style.setProperty('--tilt', `${card.dataset.tilt || 0}deg`));

  const hasGsap = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  if (!hasGsap) {
    console.warn('GSAP não carregou. O site continua funcional sem animações avançadas.');
    finishLoadingFallback();
    return;
  }

  const { gsap } = window;
  if (hasScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- abertura do site ---------- */
  const revealSite = () => {
    window.clearTimeout(loaderSafety);
    document.body.classList.remove('is-loading');

    if (!loader || reduceMotion) {
      loader?.remove();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          loader.remove();
          resolve();
        }
      });

      intro
        .fromTo('.loader-star', { scale: 0, rotate: -160, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: .55, ease: 'back.out(2)' })
        .from('.loader-name span', { yPercent: 125, rotate: 10, opacity: 0, duration: .55, stagger: .06 }, '-=.26')
        .from('.loader-kicker, .loader-status', { y: 12, opacity: 0, duration: .35, stagger: .08 }, '-=.3')
        .to('.loader-line span', { scaleX: 1, duration: .62, ease: 'power2.inOut' }, '-=.18')
        .to('.loader-star', { rotate: 180, scale: 1.35, duration: .35, ease: 'power2.inOut' }, '-=.12')
        .to('.loader-inner', { y: -16, opacity: 0, scale: .97, duration: .36, ease: 'power2.in' })
        .to('.site-loader', { clipPath: 'inset(0 0 100% 0)', duration: .72, ease: 'power4.inOut' }, '-=.02');
    });
  };

  /* ---------- cursor estrela: rápido e preciso ---------- */
  if (!isTouch && cursor) {
    document.documentElement.classList.add('has-custom-cursor');

    const cursorCore = q('.cursor-core', cursor);
    const xTo = gsap.quickTo(cursor, 'x', { duration: .09, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: .09, ease: 'power3.out' });
    const rTo = gsap.quickTo(cursorCore, 'rotation', { duration: .16, ease: 'power2.out' });
    let lastX = window.innerWidth / 2;
    let cursorWordEl = null;

    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });

    window.addEventListener('pointermove', (event) => {
      xTo(event.clientX);
      yTo(event.clientY);
      rTo(gsap.utils.clamp(-32, 32, (event.clientX - lastX) * 2.2));
      lastX = event.clientX;

      if (cursorWordEl) {
        gsap.set(cursorWordEl, { x: event.clientX, y: event.clientY });
      }
    }, { passive: true });

    const interactive = 'a, button, .proj-card, .skill-chip, .float-bubble, .tape, .photo-frame, .servico-item';
    qa(interactive).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('big');
        const word = el.getAttribute('data-cursor-word');
        if (!word) return;

        cursorWordEl?.remove();
        cursorWordEl = document.createElement('div');
        cursorWordEl.className = 'cursor-word';
        cursorWordEl.textContent = word;
        document.body.appendChild(cursorWordEl);
        gsap.fromTo(cursorWordEl, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .18, ease: 'back.out(2)' });
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('big');
        if (cursorWordEl) {
          const old = cursorWordEl;
          cursorWordEl = null;
          gsap.to(old, { scale: 0, opacity: 0, duration: .12, onComplete: () => old.remove() });
        }
      });
    });
  }

  /* ---------- hover magnético dos botões ---------- */
  if (!isTouch && !reduceMotion) {
    qa('.btn, .nav-cta, .float-bubble, .skill-chip').forEach((el) => {
      el.addEventListener('mousemove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * .12, y: y * .16, rotate: x * .018, duration: .28, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, rotate: 0, duration: .55, ease: 'elastic.out(1, .45)' }));
    });
  }

  /* ---------- tilt 3D dos cards ---------- */
  if (!isTouch && !reduceMotion) {
    qa('.proj-card').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - .5;
        const py = (event.clientY - rect.top) / rect.height - .5;
        gsap.to(card, {
          rotateY: px * 10,
          rotateX: py * -10,
          y: -10,
          scale: 1.025,
          duration: .32,
          ease: 'power2.out',
          transformPerspective: 900,
          transformOrigin: 'center'
        });
        gsap.to(q('.proj-photo', card), { x: px * 8, y: py * 8, scale: 1.035, duration: .35, ease: 'power2.out' });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, y: 0, scale: 1, duration: .7, ease: 'elastic.out(1, .45)' });
        gsap.to(q('.proj-photo', card), { x: 0, y: 0, scale: 1, duration: .55, ease: 'power3.out' });
      });
    });
  }

  /* ---------- animações contínuas dos detalhes ---------- */
  if (!reduceMotion) {
    gsap.to('.bubble-1', { y: -13, rotate: -5, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.bubble-2', { y: 11, rotate: 5, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: .2 });
    gsap.to('.bubble-3', { y: -9, x: 5, rotate: -4, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: .45 });
    gsap.to('.scribble', { rotate: 3, scale: 1.035, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.washi', { rotate: -36, y: -4, duration: 2.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.loader-blob-1', { x: 35, y: 20, rotate: 18, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.loader-blob-2', { x: -28, y: -25, rotate: -15, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  /* ---------- efeito parallax no hero ---------- */
  const heroVisual = q('.hero-visual');
  if (heroVisual && !isTouch && !reduceMotion) {
    heroVisual.addEventListener('mousemove', (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;
      gsap.to('.polaroid-main', { x: px * 16, y: py * 12, rotate: 4 + px * 2.4, duration: .55, ease: 'power3.out' });
      gsap.to('.scribble', { x: px * -18, y: py * -10, duration: .7, ease: 'power3.out' });
      gsap.to('.washi', { x: px * 12, y: py * 8, duration: .65, ease: 'power3.out' });
    });
    heroVisual.addEventListener('mouseleave', () => {
      gsap.to('.polaroid-main', { x: 0, y: 0, rotate: 4, duration: .8, ease: 'elastic.out(1, .55)' });
    });
  }

  /* ---------- entrada + scroll ---------- */
  const startPageAnimations = () => {
    if (reduceMotion) return;

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.nav', { y: -90, opacity: 0, duration: .65 })
      .from('.tape', { y: -36, opacity: 0, rotate: -16, duration: .62, ease: 'back.out(1.5)' }, '-=.25')
      .from('.hero .eyebrow-hand', { opacity: 0, y: 18, duration: .42 }, '-=.16')
      .from('.hero-title .line', { yPercent: 118, opacity: 0, duration: .72, stagger: .09 }, '-=.18')
      .from('.hero-sub', { opacity: 0, y: 18, duration: .46 }, '-=.34')
      .from('.hero-actions .btn', { opacity: 0, y: 18, scale: .94, duration: .46, stagger: .09 }, '-=.28')
      .from('.polaroid', { opacity: 0, scale: .72, rotate: 18, y: 35, duration: .85, ease: 'back.out(1.5)' }, '-=.88')
      .from('.washi', { opacity: 0, scaleX: .3, x: 24, duration: .45 }, '-=.36')
      .from('.scribble', { opacity: 0, scale: .3, rotate: -20, duration: .58, ease: 'back.out(2.2)' }, '-=.28')
      .from('.float-bubble', { opacity: 0, scale: .2, y: 20, duration: .5, stagger: .09, ease: 'back.out(2)' }, '-=.28')
      .from('.marquee', { opacity: 0, y: 18, duration: .52 }, '-=.24');

    gsap.to('.marquee-track', { xPercent: -50, duration: 15, repeat: -1, ease: 'none' });

    if (!hasScrollTrigger) return;

    qa('section').forEach((section) => {
      const head = q('.section-head', section);
      if (!head) return;
      gsap.from(head.children, {
        scrollTrigger: { trigger: head, start: 'top 84%' },
        y: 34,
        opacity: 0,
        duration: .68,
        stagger: .09,
        ease: 'power3.out'
      });
    });

    gsap.from('.photo-frame', {
      scrollTrigger: { trigger: '.sobre', start: 'top 72%' },
      rotate: -13,
      opacity: 0,
      y: 45,
      scale: .9,
      duration: .86,
      ease: 'back.out(1.35)'
    });

    gsap.from('.sobre-text > *', {
      scrollTrigger: { trigger: '.sobre-text', start: 'top 78%' },
      y: 28,
      opacity: 0,
      duration: .58,
      stagger: .1,
      ease: 'power2.out'
    });

    qa('.skill-chip').forEach((chip, i) => {
      gsap.from(chip, {
        scrollTrigger: { trigger: chip, start: 'top 92%' },
        scale: .55,
        opacity: 0,
        rotate: i % 2 ? 6 : -6,
        duration: .48,
        ease: 'back.out(1.8)'
      });
    });

    qa('.proj-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%' },
        y: 60,
        opacity: 0,
        rotate: index % 2 === 0 ? -5 : 5,
        scale: .92,
        duration: .72,
        ease: 'power3.out'
      });
    });

    qa('.servico-item').forEach((item, index) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 91%' },
        opacity: 0,
        x: index % 2 ? 34 : -34,
        duration: .6,
        ease: 'power2.out'
      });
    });

    gsap.from('.contato-title', {
      scrollTrigger: { trigger: '.contato', start: 'top 72%' },
      y: 40,
      opacity: 0,
      duration: .8,
      ease: 'power3.out'
    });

    gsap.from('.contato-links > *', {
      scrollTrigger: { trigger: '.contato-links', start: 'top 86%' },
      opacity: 0,
      y: 26,
      scale: .97,
      duration: .52,
      stagger: .09,
      ease: 'power2.out'
    });

    gsap.utils.toArray('.mark').forEach((mark) => {
      gsap.fromTo(mark,
        { backgroundSize: '0% 100%' },
        { backgroundSize: '100% 100%', duration: .72, ease: 'power2.out', scrollTrigger: { trigger: mark, start: 'top 88%' } }
      );
    });
  };

  /* ---------- microinterações extras ---------- */
  if (!reduceMotion) {
    qa('.tape, .photo-frame, .servico-item').forEach((el) => {
      el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.018, rotate: el.classList.contains('tape') ? 1 : undefined, duration: .3, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, rotate: '', duration: .55, ease: 'elastic.out(1, .5)', clearProps: 'rotate' }));
    });
  }

  revealSite().then(startPageAnimations);
})();
