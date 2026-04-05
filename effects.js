/* ═══════════════════════════════════════════════════════════════
   BDB AGENCY — Effects Engine
   Scroll reveal · Stat counters · Nav state · Testimonial carousel
   Portfolio filters · Mobile menu · Smooth scroll
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. SCROLL REVEAL
  ───────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i % 4 * 0.1}s`;
    revealObserver.observe(el);
  });

  /* ─────────────────────────────────────────
     2. NAV SCROLL STATE
  ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 50) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }
      lastScroll = y;
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     3. STAT COUNTERS
  ───────────────────────────────────────── */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const duration = 2000;
            const start = performance.now();

            function animate(now) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(eased * target);
              el.textContent = (target >= 100 ? '+' : '') + current.toLocaleString('es-MX');
              if (progress < 1) requestAnimationFrame(animate);
              else el.textContent = (target >= 100 ? '+' : '') + target.toLocaleString('es-MX');
            }

            requestAnimationFrame(animate);
            countObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => countObserver.observe(el));
  }

  /* ─────────────────────────────────────────
     4. TESTIMONIAL CAROUSEL
  ───────────────────────────────────────── */
  const container = document.getElementById('testimonial-container');
  const dotsContainer = document.getElementById('testimonial-dots');

  if (container && dotsContainer) {
    const slides = container.querySelectorAll('.testimonial-slide');
    const dots = dotsContainer.querySelectorAll('button');
    let current = 0;
    let interval;

    function goToSlide(index) {
      slides.forEach((s) => s.classList.remove('active'));
      dots.forEach((d) => d.classList.replace('bg-accent', 'bg-border'));
      slides[index].classList.add('active');
      dots[index].classList.replace('bg-border', 'bg-accent');
      current = index;
    }

    function nextSlide() {
      goToSlide((current + 1) % slides.length);
    }

    function startAutoplay() {
      interval = setInterval(nextSlide, 5000);
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        clearInterval(interval);
        goToSlide(parseInt(dot.dataset.slide, 10));
        startAutoplay();
      });
    });

    startAutoplay();
  }

  /* ─────────────────────────────────────────
     5. PORTFOLIO FILTERS
  ───────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterBtns.length && portfolioItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        portfolioItems.forEach((item) => {
          const categories = item.dataset.category || '';
          if (filter === 'all' || categories.includes(filter)) {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
              item.style.display = '';
              requestAnimationFrame(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
              });
            }, 150);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });

    // Add transition to portfolio items
    portfolioItems.forEach((item) => {
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
  }

  /* ─────────────────────────────────────────
     6. MOBILE MENU
  ───────────────────────────────────────── */
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => mobileMenu.classList.add('open'));
    if (menuClose) {
      menuClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    }
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  /* ─────────────────────────────────────────
     7. SMOOTH SCROLL FOR ANCHOR LINKS
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
