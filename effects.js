/* ═══════════════════════════════════════════════════════════════
   BDB AGENCY — Effects Engine v3
   White-first · Framer aesthetic · Mixed typography
   Scroll reveal · Nav glassmorphism · Stat counters
   Testimonial dots · Logo marquee · HLS video · Mobile menu
   Custom cursor · Scroll progress · Magnetic CTA · Portfolio filter
   Spotlight cards · Staggered grid reveals
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. SCROLL REVEAL (fade-up, grid-aware stagger)
  ───────────────────────────────────────── */
  function initReveal() {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;
          setTimeout(() => el.classList.add('visible'), parseInt(delay));
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.reveal').forEach((el) => {
      if (!el.dataset.delay && el.parentElement) {
        const siblings = [...el.parentElement.querySelectorAll(':scope > .reveal')];
        const idx = siblings.indexOf(el);
        if (idx > 0) el.dataset.delay = idx * 80;
      }
      revealObserver.observe(el);
    });

    // Video cinematic reveal — threshold más alto para que se vea más del video antes de activar
    const videoRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          videoRevealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.video-scroll-reveal').forEach((el) => {
      videoRevealObserver.observe(el);
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
            nav.classList.remove('nav-hide-sides');
          } else if (scrollingDown) {
            nav.classList.add('nav-hide-sides');
          } else {
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
     9. CUSTOM CURSOR
  ───────────────────────────────────────── */
  function initCustomCursor() {
    if (!window.matchMedia('(pointer:fine)').matches) return;

    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    dot.style.cssText = `position:fixed;width:6px;height:6px;background:#0e1011;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:opacity 0.3s;`;

    const ring = document.createElement('div');
    ring.id = 'cursor-ring';
    ring.style.cssText = `position:fixed;width:36px;height:36px;border:1.5px solid rgba(14,16,17,0.3);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width 0.3s,height 0.3s,border-color 0.3s,background 0.15s;will-change:transform;`;

    const label = document.createElement('div');
    label.id = 'cursor-label';
    label.style.cssText = `position:fixed;pointer-events:none;z-index:9999;opacity:0;font-family:'Figtree',sans-serif;font-size:11px;font-weight:600;color:#fff;background:#0e1011;padding:4px 10px;border-radius:100px;transform:translate(-50%,-130%);transition:opacity 0.2s;white-space:nowrap;`;

    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.appendChild(label);

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      label.style.left = mx + 'px';
      label.style.top = my + 'px';
    });

    function animateRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '52px';
        ring.style.height = '52px';
        ring.style.borderColor = 'rgba(14,16,17,0.5)';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'rgba(14,16,17,0.3)';
        label.style.opacity = '0';
      });
    });

    document.querySelectorAll('.portfolio-item').forEach(el => {
      const lbl = el.dataset.cursorLabel || 'Ver →';
      el.addEventListener('mouseenter', () => {
        label.textContent = lbl;
        label.style.opacity = '1';
        ring.style.width = '64px';
        ring.style.height = '64px';
      });
      el.addEventListener('mouseleave', () => {
        label.style.opacity = '0';
        ring.style.width = '36px';
        ring.style.height = '36px';
      });
    });
  }

  /* ─────────────────────────────────────────
     10. SCROLL PROGRESS BAR
  ───────────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.style.cssText = `position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,#cbfb45,#0e1011);z-index:9998;width:0%;transition:width 0.1s linear;`;
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (window.scrollY / h * 100) + '%';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     11. MAGNETIC EFFECT ON CTA BUTTONS
  ───────────────────────────────────────── */
  function initMagnetic() {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px,${y}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(.23,1,.32,1)';
        setTimeout(() => { btn.style.transition = ''; }, 500);
      });
    });
  }

  /* ─────────────────────────────────────────
     12. ANIMATED PORTFOLIO FILTER WITH SLIDING PILL
  ───────────────────────────────────────── */
  function initPortfolioFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item[data-category]');
    if (!btns.length) return;

    const pill = document.createElement('div');
    pill.style.cssText = `position:absolute;background:#0e1011;border-radius:9999px;transition:all 0.35s cubic-bezier(.23,1,.32,1);z-index:0;pointer-events:none;`;
    const filterWrap = btns[0].parentElement;
    filterWrap.style.position = 'relative';
    filterWrap.insertBefore(pill, filterWrap.firstChild);

    function movePill(btn) {
      const fw = filterWrap.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      pill.style.left = (br.left - fw.left) + 'px';
      pill.style.top = (br.top - fw.top) + 'px';
      pill.style.width = br.width + 'px';
      pill.style.height = br.height + 'px';
    }

    const active = filterWrap.querySelector('.filter-btn.active');
    if (active) {
      requestAnimationFrame(() => {
        pill.style.transition = 'none';
        movePill(active);
        requestAnimationFrame(() => { pill.style.transition = ''; });
      });
    }

    btns.forEach(btn => {
      btn.style.position = 'relative';
      btn.style.zIndex = '1';
      btn.addEventListener('click', () => {
        btns.forEach(b => {
          b.classList.remove('active');
          b.style.color = '';
        });
        btn.classList.add('active');
        btn.style.color = '#fff';
        movePill(btn);

        const filter = btn.dataset.filter;
        items.forEach((item, i) => {
          const match = filter === 'all' || item.dataset.category?.includes(filter);
          item.style.transition = `opacity 0.4s ${i * 0.05}s, transform 0.4s ${i * 0.05}s`;
          if (match) {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
            item.style.pointerEvents = '';
          } else {
            item.style.opacity = '0.15';
            item.style.transform = 'scale(0.95)';
            item.style.pointerEvents = 'none';
          }
        });
      });
    });
  }

  /* ─────────────────────────────────────────
     13. SCROLL WORD REVEAL (split text animation)
  ───────────────────────────────────────── */
  function initScrollWordReveal() {
    document.querySelectorAll('.scroll-word-reveal').forEach(function(el) {
      // Build new inner HTML splitting each word into an animated span
      var newHTML = '';
      el.childNodes.forEach(function(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          // Split preserving whitespace tokens
          node.textContent.split(/(\s+)/).forEach(function(part) {
            if (part.trim()) {
              newHTML += '<span class="wrev" style="display:inline-block;opacity:0;transform:translateY(18px);transition:opacity 0.6s ease-out,transform 0.6s ease-out;">' + part + '</span>';
            } else {
              newHTML += part;
            }
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Preserve the wrapper element (e.g. <em>) but split its words too
          var tag = node.tagName.toLowerCase();
          var attrs = '';
          for (var i = 0; i < node.attributes.length; i++) {
            attrs += ' ' + node.attributes[i].name + '="' + node.attributes[i].value + '"';
          }
          var inner = '';
          node.textContent.split(/(\s+)/).forEach(function(part) {
            if (part.trim()) {
              inner += '<span class="wrev" style="display:inline-block;opacity:0;transform:translateY(18px);transition:opacity 0.6s ease-out,transform 0.6s ease-out;">' + part + '</span>';
            } else {
              inner += part;
            }
          });
          newHTML += '<' + tag + attrs + '>' + inner + '</' + tag + '>';
        }
      });
      el.innerHTML = newHTML;

      // Trigger animation when 30% of element enters viewport (once)
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var words = el.querySelectorAll('.wrev');
            words.forEach(function(w, i) {
              setTimeout(function() {
                w.style.opacity = '1';
                w.style.transform = 'translateY(0)';
              }, i * 80);
            });
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(el);
    });
  }

  /* ─────────────────────────────────────────
     14. SPOTLIGHT HOVER EFFECT ON CARDS
  ───────────────────────────────────────── */
  function initSpotlight() {
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.background = `radial-gradient(300px at ${x}px ${y}px, rgba(203,251,69,0.08), transparent 80%)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.background = '';
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
    initCustomCursor();
    initScrollProgress();
    initMagnetic();
    initPortfolioFilter();
    initSpotlight();
    initScrollWordReveal();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
