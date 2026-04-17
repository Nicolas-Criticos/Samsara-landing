/**
 * slider.js
 * Tree rehabilitation slider calculator.
 * "It costs R450 to rehabilitate one olive tree."
 * Samsara Olive Oil Landing Page
 */

'use strict';

const COST_PER_TREE = 450; // ZAR
const MAX_TREES_DISPLAY = 20; // max tree icons to render

/**
 * Format a number as ZAR currency string.
 * e.g. 1780 → "R 1,780"
 */
function formatZAR(value) {
  return 'R\u00a0' + Math.round(value).toLocaleString('en-ZA');
}

/**
 * Animate a number counting up/down to the target.
 */
function animateCount(el, from, to, duration = 400) {
  const start = performance.now();
  const diff  = to - from;

  if (diff === 0) return;

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(from + diff * eased);

    el.textContent = current;
    el.classList.add('counting');

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = to;
      el.classList.remove('counting');
    }
  }

  requestAnimationFrame(step);
}

/**
 * Render tree emoji icons.
 * Shows up to MAX_TREES_DISPLAY trees; if more, shows "+ X more" text.
 */
function renderTreeIcons(container, count) {
  const displayCount = Math.min(count, MAX_TREES_DISPLAY);
  const existing = container.querySelectorAll('.tree-icon');

  // Add new icons
  for (let i = 0; i < displayCount; i++) {
    if (!existing[i]) {
      const span = document.createElement('span');
      span.className = 'tree-icon';
      span.setAttribute('aria-hidden', 'true');
      span.textContent = '🌿';
      container.appendChild(span);
    }
  }

  // Activate icons up to count
  const allIcons = container.querySelectorAll('.tree-icon');
  allIcons.forEach((icon, i) => {
    if (i < displayCount) {
      // Stagger activation
      setTimeout(() => icon.classList.add('is-active'), i * 40);
    } else {
      icon.classList.remove('is-active');
    }
  });

  // Remove excess icons
  for (let i = allIcons.length - 1; i >= displayCount; i--) {
    setTimeout(() => {
      if (!allIcons[i].classList.contains('is-active')) {
        allIcons[i].remove();
      }
    }, 200);
  }

  // Show "+ X more" if over the display cap
  let moreEl = container.querySelector('.tree-icon-more');
  if (count > MAX_TREES_DISPLAY) {
    if (!moreEl) {
      moreEl = document.createElement('span');
      moreEl.className = 'tree-icon-more';
      moreEl.style.cssText = `
        font-size: 0.75rem;
        letter-spacing: 0.08em;
        color: var(--color-olive-light);
        align-self: center;
        white-space: nowrap;
      `;
      container.appendChild(moreEl);
    }
    moreEl.textContent = `+ ${count - MAX_TREES_DISPLAY} more trees`;
  } else if (moreEl) {
    moreEl.remove();
  }
}

/**
 * Main slider init.
 */
window.initSlider = function() {
  const slider     = document.getElementById('rehab-range');
  const amountEl   = document.getElementById('slider-amount-display');
  const treeCountEl= document.getElementById('slider-tree-count');
  const iconWrap   = document.getElementById('slider-tree-icons');
  const resultText = document.getElementById('slider-result-text');

  if (!slider || !amountEl || !treeCountEl) return;

  let prevTreeCount = 0;
  let prevAmount    = 0;

  function update() {
    const value     = parseInt(slider.value, 10);
    const treeCount = Math.floor(value / COST_PER_TREE);

    // Update progress fill via CSS custom property
    const pct = ((value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--slider-progress', pct + '%');

    // Animate the amount display
    animateCount(amountEl, prevAmount, value, 300);
    prevAmount = value;

    // Update amount display text (JS updates the textContent,
    // but we use a wrapper span for the "R" prefix)
    const amountWrap = document.getElementById('slider-amount-display');
    if (amountWrap) {
      amountWrap.textContent = formatZAR(value);
    }

    // Animate tree count
    if (treeCount !== prevTreeCount) {
      animateCount(treeCountEl, prevTreeCount, treeCount, 400);

      if (iconWrap) {
        renderTreeIcons(iconWrap, treeCount);
      }

      prevTreeCount = treeCount;
    }

    // Update result sentence
    if (resultText) {
      if (treeCount === 0) {
        resultText.textContent = 'Move the slider to see your impact 🌱';
      } else if (treeCount === 1) {
        resultText.innerHTML = `Your purchase of <strong>${formatZAR(value)}</strong> helps rehabilitate`;
      } else {
        resultText.innerHTML = `Your purchase of <strong>${formatZAR(value)}</strong> helps rehabilitate`;
      }
    }
  }

  slider.addEventListener('input', update);

  // Keyboard accessibility — also fires on arrow keys
  slider.addEventListener('keydown', (e) => {
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      requestAnimationFrame(update);
    }
  });

  // Initial render
  update();
}
