/**
 * cart.js
 * UI-only cart: add to cart button handling, ghost message popups,
 * tree counter calculation, variant selection.
 *
 * TODO: Celium backend integration
 *   - Replace `cartState` local object with Celium cart API calls
 *   - POST /api/cart/add with { productId, variantId, quantity }
 *   - GET /api/cart to sync cart count badge
 *   - Emit cart:updated event for reactive UI updates
 *
 * Samsara Olive Oil Landing Page
 */

'use strict';

const COST_PER_TREE = 450; // ZAR — for tree counter calculation

/* ── Local cart state (UI only) ─────────────────────────── */
// TODO: Replace with Celium cart state sync
const cartState = {
  items: [],
  total: 0,
  treeCount: 0,
};

/* ── Ghost message container ─────────────────────────────── */
let ghostContainer;

function getGhostContainer() {
  if (!ghostContainer) {
    ghostContainer = document.getElementById('ghost-messages');
  }
  return ghostContainer;
}

/**
 * Show a floating ghost message popup.
 * @param {Object} opts
 * @param {string} opts.productName
 * @param {number} opts.price
 * @param {number} opts.trees
 */
function showGhostMessage({ productName, price, trees }) {
  const container = getGhostContainer();
  if (!container) return;

  const item = document.createElement('div');
  item.className = 'ghost-message__item';
  item.setAttribute('role', 'status');
  item.setAttribute('aria-live', 'polite');

  const treeWord = trees === 1 ? 'tree' : 'trees';

  item.innerHTML = `
    <span class="ghost-message__emoji">🌿</span>
    <div>
      <div class="ghost-message__text">Added to cart</div>
      <div class="ghost-message__text" style="opacity:0.7;font-size:0.75rem;margin-top:2px;">${productName}</div>
      ${trees > 0 ? `
        <div class="ghost-message__text" style="margin-top:6px;">
          This helps rehabilitate
          <span class="ghost-message__count">${trees}</span>
          ${treeWord} 🫒
        </div>
      ` : ''}
    </div>
  `;

  container.appendChild(item);

  // Auto-remove after animation completes (ghostIn 0.4s + hold 2.5s + ghostOut 0.5s = 3.4s)
  setTimeout(() => {
    item.remove();
  }, 3500);
}

/* ── Cart count badge update ─────────────────────────────── */
function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  const totalItems = cartState.items.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'flex' : 'none';

  // Pulse animation on update
  badge.animate([
    { transform: 'scale(1.4)' },
    { transform: 'scale(1)' },
  ], { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
}

/* ── Add to cart ─────────────────────────────────────────── */

/**
 * @param {string} productId
 * @param {string} productName
 * @param {number} price
 * @param {string} variant
 */
function addToCart(productId, productName, price, variant) {
  const trees = Math.floor(price / COST_PER_TREE);

  // Update local state
  const existing = cartState.items.find(
    i => i.productId === productId && i.variant === variant
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cartState.items.push({ productId, productName, price, variant, qty: 1 });
  }

  cartState.total += price;
  cartState.treeCount += trees;

  // TODO: Celium backend call
  // await celium.cart.add({ productId, variantId: variant, quantity: 1, price });

  // Visual feedback
  showGhostMessage({ productName, price, trees });
  updateCartBadge();

  // Button feedback
  return { success: true, trees };
}

/* ── Button press animation ──────────────────────────────── */
function animateButtonPress(btn, trees) {
  const originalText = btn.textContent;

  btn.textContent = trees > 0
    ? `✓ +${trees} tree${trees > 1 ? 's' : ''}`
    : '✓ Added';

  btn.style.backgroundColor = 'var(--color-olive)';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.backgroundColor = '';
    btn.disabled = false;
  }, 1800);
}

/* ── Variant selection ───────────────────────────────────── */
function initVariantButtons() {
  const variantGroups = document.querySelectorAll('.product-card__variants');

  variantGroups.forEach(group => {
    const btns = group.querySelectorAll('.variant-btn');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Deactivate all in group
        btns.forEach(b => b.classList.remove('is-active'));
        // Activate clicked
        btn.classList.add('is-active');

        // Update parent card's price if variant has a price override
        const price = btn.dataset.price;
        if (price) {
          const card   = btn.closest('.product-card');
          const priceEl = card?.querySelector('.product-card__price-value');
          if (priceEl) {
            priceEl.textContent = `R\u00a0${parseInt(price).toLocaleString('en-ZA')}`;
          }
          // Update the cart button's data attribute
          const cartBtn = card?.querySelector('.btn--cart');
          if (cartBtn) {
            cartBtn.dataset.price   = price;
            cartBtn.dataset.variant = btn.dataset.variant;
          }
        }
      });
    });

    // Activate first by default
    btns[0]?.classList.add('is-active');
  });
}

/* ── Init all add-to-cart buttons ────────────────────────── */
function initCartButtons() {
  const buttons = document.querySelectorAll('.btn--cart');

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const card        = btn.closest('.product-card');
      const productId   = btn.dataset.productId   || card?.dataset.productId   || 'unknown';
      const productName = btn.dataset.productName || card?.dataset.productName || 'Product';
      const price       = parseInt(btn.dataset.price || '0', 10);
      const variant     = btn.dataset.variant || '';

      const result = addToCart(productId, productName, price, variant);
      animateButtonPress(btn, result.trees);
    });
  });
}

/* ── Export ──────────────────────────────────────────────── */
export function initCart() {
  initVariantButtons();
  initCartButtons();

  // Expose for debugging
  // TODO: Remove in production
  window.__samsaraCart = cartState;
}

export { addToCart, showGhostMessage };
