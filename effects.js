/* ═══════════════════════════════════════════════════════════════
   BDB AGENCY — Effects Engine
   Dark theme · Lime accent · Apple/Framer aesthetic
   Scroll reveal · Stat counters · Carousel · Portfolio filters
   Nav glassmorphism · Smooth scroll · Magnetic buttons
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. SCROLL REVEAL (fade-up)
  ───────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => { el.classList.add('visible'); }, parseInt(delay));
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  function initReveal() {
    document.querySelectorAll('.reveal').forEach((el) => {
      if (!el.dataset.delay && el.parentElement) {
        const siblings = [...el.parentElement.querySelectorAll(':scope > .reveal')];
        const idx = siblings.indexOf(el);
        if (idx > 0) el.dataset.delay = idx * 80;
      }
      revealObserver.observe(el);
    });
  }

  /* ─────────────────────────────────────────
     2. NAV GLASSMORPHISM ON SCROLL
  ───────────────────────────────────────── */
  function initNav() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('nav-scrolled', window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     3. MOBILE MENU
  ───────────────────────────────────────── */
  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu   = document.getElementById('mobile-menu');
    const close  = document.getElementById('menu-close');
    if (!toggle || !menu) return;

    const openMenu  = () => { menu.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { menu.classList.remove('open'); document.body.style.overflow = ''; };

    toggle.addEventListener('click', openMenu);
    close?.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ─────────────────────────────────────────
     4. STAT COUNTERS
  ───────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 2200;
    const start    = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.floor(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function initCounters() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-target]').forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────
     5. TESTIMONIAL CAROUSEL
  ───────────────────────────────────────── */
  function initCarousel() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots   = document.querySelectorAll('[data-slide]');
    if (!slides.length) return;

    let current = 0;
    let timer   = null;

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('dot-active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('dot-active');
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 5000);
    }

    dots.forEach(dot => dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.slide));
      startTimer();
    }));

    const container = document.getElementById('testimonial-container');
    if (container) {
      let tx = 0;
      container.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
      container.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); startTimer(); }
      }, { passive: true });
    }

    startTimer();
  }

  /* ─────────────────────────────────────────
     6. PORTFOLIO FILTERS
  ───────────────────────────────────────── */
  function initFilters() {
    const btns  = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    if (!btns.length) return;

    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach(item => {
        const cats = (item.dataset.category || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        item.style.opacity    = show ? '1' : '0';
        item.style.transform  = show ? 'scale(1)' : 'scale(0.96)';
        item.style.pointerEvents = show ? '' : 'none';
      });
    }));
  }

  /* ─────────────────────────────────────────
     7. MAGNETIC BUTTONS (lime CTAs)
  ───────────────────────────────────────── */
  function initMagnetic() {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx   = (e.clientX - rect.left - rect.width  / 2) * 0.3;
        const dy   = (e.clientY - rect.top  - rect.height / 2) * 0.3;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.5s cubic-bezier(.165,.84,.44,1)';
        btn.style.transform  = '';
        setTimeout(() => { btn.style.transition = ''; }, 500);
      });
    });
  }

  /* ─────────────────────────────────────────
     8. HLS VIDEO BACKGROUND
  ───────────────────────────────────────── */
  function initVideo() {
    const video = document.getElementById('hero-video');
    if (!video) return;
    const src = video.dataset.src;
    if (!src) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(() => {});
    } else if (window.Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
    }
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    initReveal();
    initNav();
    initMobileMenu();
    initCounters();
    initCarousel();
    initFilters();
    initMagnetic();
    initVideo();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
