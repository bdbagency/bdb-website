/* ═══════════════════════════════════════════════════════════════
   BDB AGENCY — Effects Engine v2
   White-first · Framer aesthetic · Mixed typography
   Scroll reveal · Nav glassmorphism · Stat counters
   Testimonial dots · Logo marquee · HLS video · Mobile menu
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
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  function initReveal() {
    document.querySelectorAll('.reveal').forEach((el) => {
      if (!el.dataset.delay && el.parentElement) {
        const siblings = [...el.parentElement.querySelectorAll(':scope > .reveal')];
        const idx = siblings.indexOf(el);
        if (idx > 0) el.dataset.delay = idx * 100;
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
    let lastScrollY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const scrollingDown = currentY > lastScrollY && currentY > 60;
          const atTop = currentY < 60;

          if (atTop) {
            // At top — show everything
            nav.classList.remove('nav-hide-sides');
          } else if (scrollingDown) {
            // Scrolling down — hide logo & CTA
            nav.classList.add('nav-hide-sides');
          } else {
            // Scrolling up — show logo & CTA
            nav.classList.remove('nav-hide-sides');
          }

          lastScrollY = currentY;
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
    const duration = 2000;
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
     5. TESTIMONIAL PAGINATION (dots)
  ───────────────────────────────────────── */
  function initTestimonials() {
    const pages = document.querySelectorAll('.testimonial-page');
    const dots  = document.querySelectorAll('[data-tpage]');
    if (!pages.length) return;

    let current = 0;

    function goTo(idx) {
      pages[current].classList.remove('active');
      dots[current]?.classList.remove('dot-active');
      current = (idx + pages.length) % pages.length;
      pages[current].classList.add('active');
      dots[current]?.classList.add('dot-active');
    }

    dots.forEach(dot => dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.tpage));
    }));

    // Swipe support
    const container = document.getElementById('testimonial-container');
    if (container) {
      let tx = 0;
      container.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
      container.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); }
      }, { passive: true });
    }
  }

  /* ─────────────────────────────────────────
     6. LOGO MARQUEE
  ───────────────────────────────────────── */
  function initMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    // Clone children for seamless loop
    const items = track.innerHTML;
    track.innerHTML = items + items;
  }

  /* ─────────────────────────────────────────
     7. HLS VIDEO BACKGROUND
  ───────────────────────────────────────── */
  function initVideoElement(video) {
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

  function initVideo() {
    initVideoElement(document.getElementById('hero-video'));
    initVideoElement(document.getElementById('break-video'));
  }

  /* ─────────────────────────────────────────
     8. SERVICE BAR EXPAND
  ───────────────────────────────────────── */
  function initServiceBar() {
    document.querySelectorAll('.service-bar-item').forEach(item => {
      item.addEventListener('click', () => {
        const expanded = item.querySelector('.service-bar-detail');
        if (!expanded) return;
        const isOpen = expanded.classList.contains('open');
        // Close all
        document.querySelectorAll('.service-bar-detail.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.service-bar-item .icon-plus').forEach(i => i.style.transform = '');
        if (!isOpen) {
          expanded.classList.add('open');
          item.querySelector('.icon-plus').style.transform = 'rotate(45deg)';
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    initReveal();
    initNav();
    initMobileMenu();
    initCounters();
    initTestimonials();
    initMarquee();
    initVideo();
    initServiceBar();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
