(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const body = document.body;
  const nav = $('#nav');
  const loader = $('#siteLoader');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const cursor = $('#cursor');
  const cursorStar = $('.cursor-star');
  const cursorLabel = $('#cursorLabel');
  const progressBar = $('.scroll-progress span');
  const heroVisual = $('#heroVisual');

  const isTouch = matchMedia('(hover:none), (pointer:coarse)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------
     Segurança: o site nunca fica preso no loader
  ----------------------------------------------------- */
  let loaderFinished = false;

  const forceOpen = () => {
    if (loaderFinished) return;
    loaderFinished = true;
    body.classList.remove('is-loading');

    if (loader) {
      loader.classList.add('loader-fallback-out');
      setTimeout(() => loader.remove(), 500);
    }
  };

  const safetyTimer = setTimeout(forceOpen, 3600);

  /* -----------------------------------------------------
     Navegação
  ----------------------------------------------------- */
  const setMenu = (open) => {
    if (!navToggle || !navLinks) return;

    navToggle.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  navToggle?.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('open'));
  });

  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  window.addEventListener('resize', () => {
    if (innerWidth > 820) setMenu(false);
  });

  /* -----------------------------------------------------
     Barra de progresso + navbar
  ----------------------------------------------------- */
  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );

    const p = Math.min(1, Math.max(0, scrollTop / maxScroll));

    nav?.classList.toggle('scrolled', scrollTop > 35);

    if (progressBar) {
      progressBar.style.transform = `scaleX(${p})`;
    }
  };

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });

  /* -----------------------------------------------------
     GSAP
  ----------------------------------------------------- */
  const hasGsap = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  if (!hasGsap) {
    console.warn('GSAP não carregou. O site continua funcionando sem as animações avançadas.');
    forceOpen();
    return;
  }

  const { gsap } = window;

  if (hasScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  /* -----------------------------------------------------
     Loader curto e elegante
  ----------------------------------------------------- */
  const playLoader = () => {
    clearTimeout(safetyTimer);

    if (!loader || reduceMotion) {
      body.classList.remove('is-loading');
      loader?.remove();
      loaderFinished = true;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          body.classList.remove('is-loading');
          loader.remove();
          loaderFinished = true;
          resolve();
        }
      });

      tl
        .fromTo(
          '.loader-star',
          { opacity: 0, scale: 0, rotate: -120 },
          { opacity: 1, scale: 1, rotate: 0, duration: .38, ease: 'back.out(2.2)' }
        )
        .from(
          '.loader-word span',
          {
            yPercent: 125,
            opacity: 0,
            rotate: 7,
            duration: .52,
            stagger: .045
          },
          '-=.15'
        )
        .from(
          '.loader-mini, .loader-status',
          {
            opacity: 0,
            y: 10,
            duration: .3,
            stagger: .05
          },
          '-=.34'
        )
        .to(
          '.loader-progress span',
          {
            scaleX: 1,
            duration: .62,
            ease: 'power2.inOut'
          },
          '-=.18'
        )
        .to(
          '.loader-center',
          {
            opacity: 0,
            y: -10,
            scale: .985,
            duration: .28,
            ease: 'power2.in'
          },
          '+=.04'
        )
        .to(
          '.site-loader',
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: .62,
            ease: 'power4.inOut'
          },
          '-=.02'
        );
    });
  };

  /* -----------------------------------------------------
     Cursor estrela: mais rápido e sem sensação de atraso
  ----------------------------------------------------- */
  if (!isTouch && cursor && cursorStar) {
    document.documentElement.classList.add('has-custom-cursor');

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: innerWidth / 2,
      y: innerHeight / 2
    });

    const moveX = gsap.quickTo(cursor, 'x', {
      duration: .045,
      ease: 'power2.out'
    });

    const moveY = gsap.quickTo(cursor, 'y', {
      duration: .045,
      ease: 'power2.out'
    });

    const rotateTo = gsap.quickTo(cursorStar, 'rotation', {
      duration: .11,
      ease: 'power2.out'
    });

    let lastX = innerWidth / 2;
    let labelVisible = false;

    window.addEventListener('pointermove', event => {
      moveX(event.clientX);
      moveY(event.clientY);

      const velocity = event.clientX - lastX;
      rotateTo(gsap.utils.clamp(-28, 28, velocity * 2));
      lastX = event.clientX;

      if (labelVisible && cursorLabel) {
        gsap.set(cursorLabel, {
          x: event.clientX,
          y: event.clientY
        });
      }
    }, { passive: true });

    const interactiveSelector = [
      'a',
      'button',
      '.proj-card',
      '.skill-chip',
      '.float-bubble',
      '.photo-frame',
      '.servico-item'
    ].join(',');

    $$(interactiveSelector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hover');

        gsap.to(cursorStar, {
          scale: 1.7,
          rotate: '+=25',
          duration: .18,
          ease: 'back.out(1.8)'
        });

        const word = el.dataset.cursorWord;

        if (word && cursorLabel) {
          labelVisible = true;
          cursorLabel.textContent = word;

          gsap.fromTo(
            cursorLabel,
            {
              opacity: 0,
              scale: .68,
              rotate: -8
            },
            {
              opacity: 1,
              scale: 1,
              rotate: -5,
              duration: .16,
              ease: 'back.out(2)'
            }
          );
        }
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hover');

        gsap.to(cursorStar, {
          scale: 1,
          rotation: 0,
          duration: .25,
          ease: 'power2.out'
        });

        if (labelVisible && cursorLabel) {
          labelVisible = false;

          gsap.to(cursorLabel, {
            opacity: 0,
            scale: .72,
            duration: .12,
            ease: 'power2.in'
          });
        }
      });
    });
  }

  /* -----------------------------------------------------
     Magnetismo: sutil
  ----------------------------------------------------- */
  if (!isTouch && !reduceMotion) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', event => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * .09,
          y: y * .12,
          rotate: x * .012,
          duration: .24,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      el.addEventListener('pointerleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          rotate: 0,
          duration: .58,
          ease: 'elastic.out(1, .48)',
          overwrite: 'auto'
        });
      });
    });
  }

  /* -----------------------------------------------------
     Hero: parallax suave
  ----------------------------------------------------- */
  if (heroVisual && !isTouch && !reduceMotion) {
    const parallaxItems = $$('[data-parallax]', heroVisual);

    heroVisual.addEventListener('pointermove', event => {
      const rect = heroVisual.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;

      parallaxItems.forEach(item => {
        const strength = Number(item.dataset.parallax || 1);

        gsap.to(item, {
          x: px * 18 * strength,
          y: py * 14 * strength,
          duration: .55,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });

      gsap.to('.visual-shadow', {
        x: px * 15,
        y: py * 10,
        duration: .75,
        ease: 'power3.out'
      });
    });

    heroVisual.addEventListener('pointerleave', () => {
      parallaxItems.forEach(item => {
        gsap.to(item, {
          x: 0,
          y: 0,
          duration: .75,
          ease: 'elastic.out(1, .62)'
        });
      });

      gsap.to('.visual-shadow', {
        x: 0,
        y: 0,
        duration: .8,
        ease: 'power3.out'
      });
    });
  }

  /* -----------------------------------------------------
     Cards: tilt leve, sem virar "site 3D"
  ----------------------------------------------------- */
  if (!isTouch && !reduceMotion) {
    $$('.proj-card').forEach(card => {
      const baseRotate = Number(card.dataset.tilt || 0);
      const photo = $('.proj-photo', card);

      gsap.set(card, { rotateZ: baseRotate });

      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;

        gsap.to(card, {
          rotateX: y * -4.5,
          rotateY: x * 5.5,
          rotateZ: baseRotate * .42,
          y: -7,
          scale: 1.012,
          transformPerspective: 900,
          duration: .3,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        if (photo) {
          gsap.to(photo, {
            x: x * 7,
            y: y * 6,
            scale: 1.025,
            duration: .35,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });

      card.addEventListener('pointerleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          rotateZ: baseRotate,
          y: 0,
          scale: 1,
          duration: .62,
          ease: 'elastic.out(1, .55)',
          overwrite: 'auto'
        });

        if (photo) {
          gsap.to(photo, {
            x: 0,
            y: 0,
            scale: 1,
            duration: .48,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    });
  }

  /* -----------------------------------------------------
     Pequenos movimentos contínuos
  ----------------------------------------------------- */
  const startAmbientAnimations = () => {
    if (reduceMotion) return;

    gsap.to('.bubble-1', {
      y: -9,
      rotate: -4,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.bubble-2', {
      y: 9,
      rotate: 4,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: .15
    });

    gsap.to('.bubble-3', {
      x: 4,
      y: -7,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: .28
    });

    gsap.to('.scribble', {
      rotate: 11,
      scale: 1.025,
      duration: 2.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.hero-orb-a', {
      x: -24,
      y: 18,
      duration: 5.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.hero-orb-b', {
      x: 20,
      y: -15,
      duration: 5.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.contact-orb', {
      rotate: 10,
      x: -18,
      y: 12,
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.loader-shape-a', {
      x: 32,
      y: 20,
      rotate: 14,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to('.loader-shape-b', {
      x: -30,
      y: -20,
      rotate: -12,
      duration: 2.7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  };

  /* -----------------------------------------------------
     Entrada da página
  ----------------------------------------------------- */
  const startPageAnimations = () => {
    if (reduceMotion) return;

    const intro = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    intro
      .from('.nav', {
        y: -46,
        opacity: 0,
        duration: .5
      })
      .from('.tape', {
        y: -24,
        opacity: 0,
        rotate: -7,
        duration: .46,
        ease: 'back.out(1.5)'
      }, '-=.24')
      .from('.hero .eyebrow-hand', {
        y: 13,
        opacity: 0,
        duration: .33
      }, '-=.14')
      .from('.title-line > span', {
        yPercent: 115,
        rotate: 2,
        duration: .66,
        stagger: .075
      }, '-=.12')
      .from('.hero-sub', {
        y: 16,
        opacity: 0,
        duration: .42
      }, '-=.26')
      .from('.hero-actions .btn', {
        y: 14,
        opacity: 0,
        scale: .97,
        duration: .4,
        stagger: .07
      }, '-=.22')
      .from('.polaroid', {
        y: 32,
        opacity: 0,
        scale: .9,
        rotate: 11,
        duration: .72,
        ease: 'back.out(1.5)'
      }, '-=.72')
      .from('.washi', {
        opacity: 0,
        scaleX: .5,
        duration: .32
      }, '-=.28')
      .from('.float-bubble', {
        opacity: 0,
        scale: .6,
        y: 10,
        duration: .38,
        stagger: .065,
        ease: 'back.out(1.7)'
      }, '-=.22')
      .from('.scribble,.tiny-note', {
        opacity: 0,
        duration: .35,
        stagger: .06
      }, '-=.28')
      .from('.marquee', {
        opacity: 0,
        y: 18,
        duration: .42
      }, '-=.2');

    gsap.to('.marquee-track', {
      xPercent: -50,
      duration: 18,
      repeat: -1,
      ease: 'none'
    });

    if (!hasScrollTrigger) return;

    /* Cabeçalhos */
    $$('.section-head').forEach(head => {
      gsap.from(head.children, {
        scrollTrigger: {
          trigger: head,
          start: 'top 84%'
        },
        y: 30,
        opacity: 0,
        duration: .62,
        stagger: .08,
        ease: 'power3.out'
      });
    });

    /* Sobre */
    gsap.from('.photo-frame', {
      scrollTrigger: {
        trigger: '.sobre',
        start: 'top 74%'
      },
      y: 40,
      opacity: 0,
      rotate: -8,
      scale: .94,
      duration: .74,
      ease: 'back.out(1.25)'
    });

    gsap.from('.photo-note', {
      scrollTrigger: {
        trigger: '.sobre',
        start: 'top 70%'
      },
      opacity: 0,
      x: -12,
      duration: .4,
      delay: .2
    });

    gsap.from('.sobre-text > p', {
      scrollTrigger: {
        trigger: '.sobre-text',
        start: 'top 80%'
      },
      y: 24,
      opacity: 0,
      duration: .55,
      stagger: .1,
      ease: 'power2.out'
    });

    gsap.from('.skill-chip', {
      scrollTrigger: {
        trigger: '.skills-row',
        start: 'top 90%'
      },
      y: 14,
      opacity: 0,
      scale: .9,
      duration: .4,
      stagger: .055,
      ease: 'back.out(1.45)'
    });

    /* Portfólio */
    $$('.proj-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%'
        },
        y: 48,
        opacity: 0,
        scale: .96,
        rotate: index % 2 ? 3 : -3,
        duration: .64,
        ease: 'power3.out'
      });
    });

    /* Serviços */
    $$('.servico-item').forEach((item, index) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 92%'
        },
        opacity: 0,
        x: index % 2 ? 22 : -22,
        duration: .48,
        ease: 'power2.out'
      });
    });

    /* Contato */
    gsap.from('.contato .eyebrow-hand', {
      scrollTrigger: {
        trigger: '.contato',
        start: 'top 76%'
      },
      y: 16,
      opacity: 0,
      duration: .45
    });

    gsap.from('.contato-title', {
      scrollTrigger: {
        trigger: '.contato',
        start: 'top 72%'
      },
      y: 35,
      opacity: 0,
      duration: .72,
      ease: 'power3.out'
    });

    gsap.from('.contato-link', {
      scrollTrigger: {
        trigger: '.contato-links',
        start: 'top 88%'
      },
      y: 19,
      opacity: 0,
      duration: .46,
      stagger: .07,
      ease: 'power2.out'
    });

    /* Marca-texto desenhando */
    $$('.mark').forEach(mark => {
      gsap.fromTo(
        mark,
        { backgroundSize: '0% 34%' },
        {
          backgroundSize: '100% 34%',
          duration: .66,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mark,
            start: 'top 89%'
          }
        }
      );
    });

    /* leve deslocamento do polaroid no scroll */
    gsap.to('.polaroid-main', {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: .6
      }
    });
  };

  /* -----------------------------------------------------
     Pequeno lift em elementos de papel
  ----------------------------------------------------- */
  if (!isTouch && !reduceMotion) {
    $$('.hover-lift').forEach(el => {
      el.addEventListener('pointerenter', () => {
        gsap.to(el, {
          y: -6,
          rotate: -1,
          scale: 1.012,
          duration: .28,
          ease: 'power2.out'
        });
      });

      el.addEventListener('pointerleave', () => {
        gsap.to(el, {
          y: 0,
          rotate: -2,
          scale: 1,
          duration: .55,
          ease: 'elastic.out(1, .5)'
        });
      });
    });
  }

  startAmbientAnimations();

  playLoader().then(() => {
    startPageAnimations();
    updateScrollUI();

    if (hasScrollTrigger) {
      requestAnimationFrame(() => window.ScrollTrigger.refresh());
    }
  });
})();
