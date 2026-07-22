(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = prefersReducedMotion ? null : new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  function observeReveal(el, index) {
    if (!el) return;
    if (el.dataset.revealDelay) {
      el.style.setProperty('--reveal-delay', el.dataset.revealDelay);
    } else if (index != null) {
      el.style.setProperty('--reveal-delay', `${Math.min(index * 80, 320)}ms`);
    }

    if (prefersReducedMotion) {
      el.classList.add('in-view');
      return;
    }
    observer.observe(el);
  }

  function setupHeaderShadow() {
    const header = document.querySelector('header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function setupHeroParallax() {
    if (prefersReducedMotion) return;
    const heroWrap = document.querySelector('.hero-right');
    const hero = document.querySelector('.hero');
    if (!heroWrap || !hero) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < hero.offsetHeight) {
          heroWrap.style.transform = `translateY(${scrollY * 0.15}px)`;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-reveal]').forEach((el, i) => observeReveal(el, i % 5));
    setupHeaderShadow();
    setupHeroParallax();
  });

  window.observeReveal = observeReveal;
})();
