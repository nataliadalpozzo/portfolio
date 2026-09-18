gsap.registerPlugin(ScrollTrigger);

/* ============ CURSOR CUSTOM (estrela) ============ */
const cursor = document.getElementById('cursor');
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
let cursorWordEl = null;

if(!isTouch){
  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let cx = mx, cy = my;

  window.addEventListener('mousemove', (e)=>{
    mx = e.clientX; my = e.clientY;
    if(cursorWordEl){
      cursorWordEl.style.left = mx + 'px';
      cursorWordEl.style.top = my + 'px';
    }
  });

  gsap.ticker.add(()=>{
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%) rotate(${(mx-cx)*2}deg)`;
  });

  document.querySelectorAll('a, button, .proj-card, .skill-chip').forEach(el=>{
    el.addEventListener('mouseenter', ()=>{
      cursor.classList.add('big');
      const word = el.getAttribute('data-cursor-word');
      if(word){
        cursorWordEl = document.createElement('div');
        cursorWordEl.className = 'cursor-word';
        cursorWordEl.textContent = word;
        cursorWordEl.style.left = mx + 'px';
        cursorWordEl.style.top = my + 'px';
        document.body.appendChild(cursorWordEl);
        requestAnimationFrame(()=> cursorWordEl.classList.add('show'));
      }
    });
    el.addEventListener('mouseleave', ()=>{
      cursor.classList.remove('big');
      if(cursorWordEl){
        cursorWordEl.remove();
        cursorWordEl = null;
      }
    });
  });
}

/* ============ NAV ============ */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

ScrollTrigger.create({
  start: 'top -80',
  onUpdate: (self)=> nav.classList.toggle('scrolled', self.scroll() > 80)
});

navToggle.addEventListener('click', ()=>{
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', ()=> navLinks.classList.remove('open'));
});

/* ============ TILT DAS PROJ CARDS ============ */
document.querySelectorAll('.proj-card').forEach(card=>{
  card.style.setProperty('--tilt', (card.dataset.tilt || 0) + 'deg');
});

/* ============ HERO — SEQUENCIA DE ENTRADA ============ */
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTl
  .from('.logo', { y: -20, opacity: 0, duration: .6 })
  .from('.nav-links a', { y: -14, opacity: 0, duration: .5, stagger: .06 }, '-=.4')
  .from('.tape', { y: -30, opacity: 0, rotate: -20, duration: .7 }, '-=.2')
  .from('.eyebrow-hand', { opacity: 0, y: 14, duration: .5 }, '-=.2')
  .from('.hero-title .line', { yPercent: 120, opacity: 0, duration: .8, stagger: .1 }, '-=.2')
  .from('.hero-sub', { opacity: 0, y: 14, duration: .5 }, '-=.4')
  .from('.hero-actions .btn', { opacity: 0, y: 14, duration: .5, stagger: .1 }, '-=.3')
  .from('.polaroid', { opacity: 0, scale: .85, rotate: 14, duration: .8, ease: 'back.out(1.4)' }, '-=.9')
  .from('.washi', { opacity: 0, x: 20, duration: .5 }, '-=.4')
  .from('.scribble', { opacity: 0, scale: .6, duration: .6, ease: 'back.out(2)' }, '-=.3')
  .from('.marquee', { opacity: 0, duration: .6 }, '-=.2');

/* marquee infinito */
gsap.to('.marquee-track', { xPercent: -50, duration: 18, repeat: -1, ease: 'none' });

/* ============ REVEALS POR SECAO ============ */
function revealSection(selector, opts = {}){
  const el = document.querySelector(selector);
  if(!el) return;
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 78%' },
    y: 40, opacity: 0, duration: .8, ease: 'power3.out',
    ...opts
  });
}

revealSection('.section-head[data-x]'); // noop guard

document.querySelectorAll('section').forEach(sec=>{
  const head = sec.querySelector('.section-head');
  if(head){
    gsap.from(head.children, {
      scrollTrigger: { trigger: head, start: 'top 82%' },
      y: 30, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out'
    });
  }
});

gsap.from('.photo-frame', {
  scrollTrigger: { trigger: '.sobre', start: 'top 70%' },
  rotate: -14, opacity: 0, y: 30, duration: .9, ease: 'back.out(1.3)'
});
gsap.from('.sobre-text > *', {
  scrollTrigger: { trigger: '.sobre-text', start: 'top 75%' },
  y: 24, opacity: 0, duration: .6, stagger: .12, ease: 'power2.out'
});

gsap.utils.toArray('.proj-card').forEach((card, i)=>{
  gsap.from(card, {
    scrollTrigger: { trigger: card, start: 'top 88%' },
    y: 50, opacity: 0, rotate: (i % 2 === 0 ? -6 : 6), duration: .7, ease: 'power3.out'
  });
});

gsap.utils.toArray('.servico-item').forEach(item=>{
  gsap.from(item, {
    scrollTrigger: { trigger: item, start: 'top 90%' },
    opacity: 0, x: -30, duration: .6, ease: 'power2.out'
  });
});

gsap.from('.contato-links > *', {
  scrollTrigger: { trigger: '.contato-links', start: 'top 85%' },
  opacity: 0, y: 24, duration: .5, stagger: .1, ease: 'power2.out'
});

/* respeita usuários que pedem menos movimento */
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  gsap.globalTimeline.timeScale(50);
}
