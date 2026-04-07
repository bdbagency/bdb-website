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
     5. TESTIMONIAL CAROUSEL (scroll-snap + drag + wheel)
  ───────────────────────────────────────── */
  function initTestimonials() {
    const container = document.getElementById('testimonial-container');
    if (!container) return;

    // Mouse drag to scroll (1:1 with cursor; snap kicks in on release)
    let isDown = false, startX = 0, startScroll = 0;
    container.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX;
      startScroll = container.scrollLeft;
      container.classList.add('dragging');
    });
    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('dragging');
    });
    container.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      container.scrollLeft = startScroll - (e.pageX - startX);
    });
    container.addEventListener('mouseleave', () => {
      if (isDown) { isDown = false; container.classList.remove('dragging'); }
    });

    // Scroll progress → active dot (3 symbolic markers)
    const dots = document.querySelectorAll('.carousel-dot');
    if (dots.length) {
      const updateDots = () => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;
        const progress = Math.max(0, Math.min(1, container.scrollLeft / maxScroll));
        const activeIdx = Math.min(dots.length - 1, Math.floor(progress * dots.length));
        dots.forEach((dot, i) => dot.classList.toggle('carousel-dot-active', i === activeIdx));
      };
      container.addEventListener('scroll', updateDots, { passive: true });
      window.addEventListener('resize', updateDots);
      updateDots();
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
      video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play().catch(() => {});
      });
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
     9. CUSTOM CURSOR — lime glow
  ───────────────────────────────────────── */
  function initCustomCursor() {
    if (!window.matchMedia('(pointer:fine)').matches) return;

    // Hide native cursor via injected style (CSS rule in <style> handles this,
    // but inject as fallback too)
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = 'body,body *{cursor:none!important}';
    document.head.appendChild(cursorStyle);

    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    dot.style.cssText = `position:fixed;width:7px;height:7px;background:#0FB4F7;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:opacity 0.3s,width 0.25s,height 0.25s;box-shadow:0 0 8px rgba(15,180,247,0.9);`;

    const ring = document.createElement('div');
    ring.id = 'cursor-ring';
    ring.style.cssText = `position:fixed;width:36px;height:36px;border:1.5px solid rgba(15,180,247,0.45);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width 0.3s,height 0.3s,border-color 0.3s,box-shadow 0.3s;will-change:transform;box-shadow:0 0 16px rgba(15,180,247,0.2);`;

    const label = document.createElement('div');
    label.id = 'cursor-label';
    label.style.cssText = `position:fixed;pointer-events:none;z-index:9999;opacity:0;font-family:'Figtree',sans-serif;font-size:11px;font-weight:600;color:#0e1011;background:#0FB4F7;padding:4px 10px;border-radius:100px;transform:translate(-50%,-130%);transition:opacity 0.2s;white-space:nowrap;`;

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
        ring.style.borderColor = 'rgba(15,180,247,0.75)';
        ring.style.boxShadow = '0 0 24px rgba(15,180,247,0.4)';
        dot.style.width = '5px';
        dot.style.height = '5px';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'rgba(15,180,247,0.45)';
        ring.style.boxShadow = '0 0 16px rgba(15,180,247,0.2)';
        dot.style.width = '7px';
        dot.style.height = '7px';
        label.style.opacity = '0';
      });
    });

    document.querySelectorAll('.portfolio-item, .work-card-polaroid').forEach(el => {
      const lbl = el.dataset.cursorLabel || 'Ver →';
      el.addEventListener('mouseenter', () => {
        label.textContent = lbl;
        label.style.opacity = '1';
        ring.style.width = '64px';
        ring.style.height = '64px';
        ring.style.boxShadow = '0 0 32px rgba(15,180,247,0.5)';
      });
      el.addEventListener('mouseleave', () => {
        label.style.opacity = '0';
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.boxShadow = '0 0 16px rgba(15,180,247,0.2)';
      });
    });
  }

  /* ─────────────────────────────────────────
     10. SCROLL PROGRESS BAR
  ───────────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.style.cssText = `position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,#0FB4F7,#0e1011);z-index:9998;width:0%;transition:width 0.1s linear;`;
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
     14. 3D TILT — portfolio + service + work cards
  ───────────────────────────────────────── */
  function initTilt() {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    document.querySelectorAll('.portfolio-item, .service-card, .work-card-polaroid').forEach(card => {
      card.style.willChange = 'transform';
      // service-card & work-card-polaroid get shallower tilt for elegance
      const maxRot = card.classList.contains('portfolio-item') ? 14 : 9;
      const maxRotX = card.classList.contains('portfolio-item') ? 10 : 6;

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
      });
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        const rotY =  x * maxRot;
        const rotX = -y * maxRotX;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        card.style.boxShadow = `${-rotY * 1.5}px ${rotX * 1.5}px 32px rgba(0,0,0,0.1)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.55s cubic-bezier(.23,1,.32,1), box-shadow 0.55s ease';
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  /* ─────────────────────────────────────────
     15a. HERO CINEMATIC WORD/CHAR REVEAL (page load)
  ───────────────────────────────────────── */
  function initHeroReveal() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('[data-hero-reveal]').forEach(function(el) {
      var baseDelay = parseInt(el.dataset.heroDelay || 0, 10);
      var isHeading = el.tagName === 'H1' || el.tagName === 'H2';
      var idx = 0;

      // Immediately hide container to prevent flash before JS splits the text
      el.style.opacity = '0';

      function wrapNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          var frag = document.createDocumentFragment();
          var parts = isHeading
            ? [...node.textContent] // char-by-char for headings
            : node.textContent.split(/(\s+)/); // word-by-word for body text
          parts.forEach(function(part) {
            if (!part || (isHeading && (part === ' ' || part === '\n')) || (!isHeading && !part.trim())) {
              frag.appendChild(document.createTextNode(part));
            } else {
              var span = document.createElement('span');
              span.className = 'hrev';
              span.textContent = part;
              if (!reduced) {
                var step = isHeading ? 38 : 65;
                span.style.animationDelay = (baseDelay + idx * step) + 'ms';
              } else {
                span.style.opacity = '1';
                span.style.filter = 'none';
                span.style.transform = 'none';
              }
              idx++;
              frag.appendChild(span);
            }
          });
          node.replaceWith(frag);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          [...node.childNodes].forEach(wrapNode);
        }
      }

      [...el.childNodes].forEach(wrapNode);
      // Reveal container — individual spans now control opacity via CSS animation
      el.style.opacity = '1';
    });
  }

  /* ─────────────────────────────────────────
     15b. PARALLAX ON SERVICE + BLOG IMAGES
  ───────────────────────────────────────── */
  function initParallaxImages() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Only run on desktop (pointer:fine) to avoid mobile jank
    if (!window.matchMedia('(pointer:fine)').matches) return;

    var items = [];
    // Service card images — no conflicting hover transforms on the wrapper
    document.querySelectorAll('.service-card img').forEach(function(img) {
      img.style.willChange = 'transform';
      items.push({ el: img, scale: 1.12, strength: 22 });
    });
    // CEO photo
    var ceoImg = document.querySelector('img[src*="angel-ceo"]');
    if (ceoImg) {
      ceoImg.style.willChange = 'transform';
      items.push({ el: ceoImg, scale: 1.1, strength: 18 });
    }

    if (!items.length) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      requestAnimationFrame(function() {
        var vh = window.innerHeight;
        items.forEach(function(item) {
          var rect = item.el.getBoundingClientRect();
          if (rect.bottom < -100 || rect.top > vh + 100) { ticking = false; return; }
          var progress = (vh / 2 - (rect.top + rect.height / 2)) / vh; // -0.5 → 0.5
          var offset = progress * item.strength;
          item.el.style.transform = 'scale(' + item.scale + ') translateY(' + offset + 'px)';
        });
        ticking = false;
      });
      ticking = true;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial position
  }

  /* ─────────────────────────────────────────
     15c. PARTICLE CANVAS — hero background
  ───────────────────────────────────────── */
  function initParticles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var count = window.innerWidth < 768 ? 30 : 60;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Particle colors: lime, cream, white — all very subtle
    var colors = [
      [203, 251, 69],  // lime
      [253, 251, 246], // cream
      [255, 255, 255], // white
    ];

    for (var i = 0; i < count; i++) {
      var c = colors[i % colors.length];
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        op: Math.random() * 0.35 + 0.08,
        cr: c[0], cg: c[1], cb: c[2]
      });
    }

    var raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)             p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0)             p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.cr + ',' + p.cg + ',' + p.cb + ',' + p.op + ')';
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }

    // Pause animation when tab is hidden (battery saver)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });

    draw();
  }

  /* ─────────────────────────────────────────
     15. PARALLAX ON BDB EXPERIENCE IMAGE
  ───────────────────────────────────────── */
  function initParallax() {
    const img = document.querySelector('img[src*="experience-bg"]');
    if (!img) return;
    const section = img.closest('section');
    if (!section) return;

    // Pre-scale so parallax offset doesn't reveal edges
    img.style.transform = 'scale(1.15) translateY(0px)';
    img.style.transformOrigin = 'center center';
    img.style.willChange = 'transform';

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        // progress: 1 when top of section at bottom of viewport, 0 when section top at viewport top
        const progress = 1 - (rect.top / vh);
        if (progress >= -0.2 && progress <= 1.4) {
          const offset = (progress - 0.5) * 60; // range ≈ -30px → +30px
          img.style.transform = `scale(1.15) translateY(${offset}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  /* ─────────────────────────────────────────
     16. LETTER-BY-LETTER BLUR REVEAL
  ───────────────────────────────────────── */
  function initLetterBlur() {
    // Target h1 and h2 inside .reveal elements
    document.querySelectorAll('.reveal h1, .reveal h2').forEach(heading => {
      const parent = heading.closest('.reveal');
      if (!parent || parent.dataset.letterBlur) return;
      parent.dataset.letterBlur = '1';

      // Split text nodes into letter spans, preserve child elements (em, etc.)
      function splitNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          [...node.textContent].forEach(ch => {
            if (ch === ' ' || ch === '\n') {
              frag.appendChild(document.createTextNode(ch));
            } else {
              const span = document.createElement('span');
              span.className = 'lrev';
              span.textContent = ch;
              span.style.cssText = 'display:inline-block;opacity:0;filter:blur(8px);transition:opacity 0.5s ease,filter 0.5s ease;';
              frag.appendChild(span);
            }
          });
          node.replaceWith(frag);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          [...node.childNodes].forEach(splitNode);
        }
      }

      [...heading.childNodes].forEach(splitNode);

      // Trigger when parent .reveal becomes visible
      const observer = new MutationObserver(() => {
        if (!parent.classList.contains('visible')) return;
        const letters = heading.querySelectorAll('.lrev');
        letters.forEach((l, i) => {
          setTimeout(() => {
            l.style.opacity = '1';
            l.style.filter = 'blur(0)';
          }, i * 28);
        });
        observer.disconnect();
      });
      observer.observe(parent, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ─────────────────────────────────────────
     17. SPOTLIGHT HOVER EFFECT ON CARDS
  ───────────────────────────────────────── */
  function initSpotlight() {
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        card.style.background = `radial-gradient(300px at ${x}px ${y}px, rgba(15,180,247,0.08), transparent 80%)`;
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
    initHeroReveal();     // ← run first so hero animates on load
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
    initTilt();
    initParallax();
    initParallaxImages();
    initLetterBlur();
    initParticles();      // ← last (canvas loop)
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
