/** Road Motion V8 — progressive visual layer, independent of booking logic. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    root.classList.add('intro-complete');
    return;
  }
  root.classList.add('pda-motion-enabled');

  // 1: A short, cinematic brand transition instead of a long loading animation.
  // Never hold the page hostage to network conditions; skip for deep links and reduced motion.
  const loader = document.getElementById('pdaLoader');
  let introDone = false;
  const finishIntro = () => {
    if (introDone) return;
    introDone = true;
    clearTimeout(window.__pdaIntroSafety);
    root.classList.add('intro-complete');
    if (loader) setTimeout(() => { loader.setAttribute('aria-hidden','true');loader.remove(); }, 850);
  };
  if (root.classList.contains('pda-intro-on')) {
    const hero = document.querySelector('.hero-photo img');
    const ready = hero?.decode ? hero.decode().catch(() => {}) : Promise.resolve();
    const shortPause = new Promise(resolve => setTimeout(resolve, 700));
    const failsafe = new Promise(resolve => setTimeout(resolve, 1250));
    Promise.race([Promise.all([ready, shortPause]), failsafe]).then(finishIntro, finishIntro);
  } else finishIntro();

  // 2: Reveal groups with naturally staggered entrance as they enter the viewport.
  const targets = [
    '.quick-inner', '.approach-media figure', '.approach-quote',
    '.lesson-explorer', '.skill-deck',
    '.lesson-journey .journey-photo', '.lesson-journey article',
    '.local-content', '.options-grid article',
    '.booking-aside', '.booking-form-wrap', '.faq details', '.closing .container'
  ].flatMap(selector => Array.from(document.querySelectorAll(selector)));
  targets.forEach((el,i) => {
    if (el.closest('.hero')) return;
    el.setAttribute('data-motion-reveal','');
    // Per section rather than monotonic delay: no lengthy waiting farther down page.
    const siblings = Array.from(el.parentElement.children).filter(n => targets.includes(n));
    const ix = Math.max(0,siblings.indexOf(el));
    el.style.setProperty('--motion-delay', `${Math.min(ix,4)*85}ms`);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.08,rootMargin:'0px 0px 70px 0px'});
    targets.forEach(el=>observer.observe(el));
  } else {
    targets.forEach(el=>el.classList.add('is-visible'));
  }

  // 3: Slow, understated image motion. No pointer-follow or expensive filters.
  document.querySelectorAll('.approach-media figure,.journey-photo,.booking-aside-photo,.local-scene').forEach(el => el.classList.add('motion-photo'));
  const heroPhoto = document.querySelector('.hero-photo');
  if (heroPhoto && matchMedia('(min-width: 761px)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (window.scrollY < window.innerHeight + 200) {
          heroPhoto.style.setProperty('--hero-drift', `${Math.min(window.scrollY*0.085, 44)}px`);
        }
        ticking = false;
      });
    }, {passive:true});
  }

  // 4: Run new content choreography on each existing lesson and skills selection.
  let changeTimer;
  document.addEventListener('pda:lesson-change', () => {
    const info = document.querySelector('.lesson-information');
    if (!info) return;
    info.classList.remove('motion-switch');
    void info.offsetWidth;
    info.classList.add('motion-switch');
    clearTimeout(changeTimer);
    changeTimer=setTimeout(()=>info.classList.remove('motion-switch'),630);
  });
  let skillTimer;
  document.addEventListener('pda:skill-change', () => {
    const visual = document.querySelector('.skill-visual');
    if (!visual) return;
    visual.classList.remove('motion-switch');
    void visual.offsetWidth;
    visual.classList.add('motion-switch');
    clearTimeout(skillTimer);
    skillTimer=setTimeout(()=>visual.classList.remove('motion-switch'),630);
  });
  // If user toggles reduced motion while the overlay is open, release it immediately.
  reduce.addEventListener?.('change', e => {
    if (e.matches) {
      finishIntro();
      document.querySelectorAll('[data-motion-reveal]').forEach(el=>el.classList.add('is-visible'));
    }
  });
})();
