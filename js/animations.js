/**
 * animations.js
 * Handles: hero particle canvas, scroll reveal (IntersectionObserver),
 * parallax, and breathing pulse coordination.
 * Samsara Olive Oil Landing Page
 */

'use strict';

/* ── Particle Canvas ─────────────────────────────────────── */

function initParticleCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const PARTICLE_COUNT = 38;
  const COLORS = [
    'rgba(201, 160, 64,',   // gold
    'rgba(181, 101, 29,',   // copper
    'rgba(247, 240, 230,',  // cream
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.6 + 0.4,
      vx:   (Math.random() - 0.5) * 0.18,
      vy:   -(Math.random() * 0.25 + 0.05), // drift upward slowly
      alpha:Math.random() * 0.4 + 0.05,
      color:COLORS[Math.floor(Math.random() * COLORS.length)],
      life: Math.random(),
      speed:Math.random() * 0.003 + 0.001,
    };
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Pulse alpha using sine wave
      p.life += p.speed;
      const a = p.alpha * (0.5 + 0.5 * Math.sin(p.life * Math.PI * 2));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${a.toFixed(3)})`;
      ctx.fill();

      // Tiny soft glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grad.addColorStop(0, `${p.color}${(a * 0.3).toFixed(3)})`);
      grad.addColorStop(1, `${p.color}0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) {
        p.y = H + 10;
        p.x = Math.random() * W;
      }
    });

    animId = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    initParticles();
    draw();
    window.addEventListener('resize', () => {
      resize();
      initParticles();
    }, { passive: true });
  }

  // Pause when tab hidden for performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });

  start();
}

/* ── Scroll Reveal (IntersectionObserver) ────────────────── */

function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.reveal, .product-card, .story__eyebrow, .story__title, .story__body, ' +
    '.hero__tagline, .hero__sub, .story__bg, .section__header, .mission, ' +
    '.draw-line, .footer__logo'
  );

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Don't unobserve bg images — keep parallax trigger
        if (!entry.target.classList.contains('story__bg')) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  revealEls.forEach(el => observer.observe(el));

  // Stagger product cards
  const cards = document.querySelectorAll('.product-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.index || 0) * 120;
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card, i) => {
    card.dataset.index = i;
    cardObserver.observe(card);
  });
}

/* ── Soft Parallax (scroll-based image offset) ───────────── */

function initParallax() {
  // Skip on mobile (performance)
  if (window.innerWidth < 768) return;

  const bg = document.querySelector('.story__bg');
  if (!bg) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const rect = bg.parentElement.getBoundingClientRect();
        const progress = -rect.top / (rect.height + window.innerHeight);
        const offset = progress * 60; // px of travel
        bg.style.transform = `scale(1.1) translateY(${offset}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── Hero tagline entrance (triggered after logo loads) ──── */

function initHeroText() {
  const tagline = document.querySelector('.hero__tagline');
  const sub = document.querySelector('.hero__sub');

  // Stagger the entrance
  if (tagline) setTimeout(() => tagline.classList.add('is-visible'), 900);
  if (sub)     setTimeout(() => sub.classList.add('is-visible'), 1200);
}

/* ── Site nav progress dots ──────────────────────────────── */

function initSiteNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const dots = nav.querySelectorAll('.site-nav__dot');
  const sections = Array.from(document.querySelectorAll('[data-section]'));

  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sections.indexOf(entry.target);
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => io.observe(s));

  // Show nav after hero
  setTimeout(() => nav.classList.add('is-visible'), 2000);

  // Click to scroll
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      sections[i]?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ── Init ────────────────────────────────────────────────── */

export function initAnimations() {
  initParticleCanvas();
  initScrollReveal();
  initParallax();
  initHeroText();
  initSiteNav();
}
