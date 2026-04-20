/**
 * app.js — Main entry point
 * Samsara Olive Oil Landing Page
 *
 * Initialises all modules after DOM is ready.
 * Pure vanilla JS, no frameworks.
 */

'use strict';

/* ── Smooth scroll for anchor links ─────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── Page load class (triggers CSS entry animation) ────── */
function initPageEntry() {
  document.body.classList.add('page-enter');
}

/* ── Boot ────────────────────────────────────────────────── */
function boot() {
  initPageEntry();
  initSmoothScroll();
  window.initAnimations();
  window.initSlider();
  window.initCart();
  window.initCartDrawer();
  window.initCheckout();

  console.log(
    '%c🌿 Samsara Olive Oil — rooted in the Karoo',
    'color: #c9a040; font-family: Georgia, serif; font-size: 14px; padding: 4px 0;'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
