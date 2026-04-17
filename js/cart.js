/**
 * cart.js
 * UI-only cart: add to cart button handling, ghost message popups,
 * cumulative tree counter, variant selection.
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

/* ── Local cart state (UI only) ─────────────────────────── */
// TODO: Replace with Celium cart state sync
var cartState = {
  items: [],
  total: 0,
  totalTrees: 0,
};

/* ── Ghost message container ─────────────────────────────── */
var ghostContainer;

function getGhostContainer() {
  if (!ghostContainer) {
    ghostContainer = document.getElementById('ghost-messages');
  }
  return ghostContainer;
}

/**
 * Show a floating ghost message popup with cumulative thankful trees.
 * @param {number} totalTrees — cumulative trees across all cart items
 */
function showGhostMessage(totalTrees) {
  var container = getGhostContainer();
  if (!container) return;

  var item = document.createElement('div');
  item.className = 'ghost-message__item';
  item.setAttribute('role', 'status');
  item.setAttribute('aria-live', 'polite');

  // Format the tree count nicely
  var treeDisplay;
  if (totalTrees < 1) {
    treeDisplay = '½';
  } else {
    treeDisplay = Math.floor(totalTrees);
  }

  var treeWord = totalTrees === 1 ? 'thankful tree' : 'thankful trees';

  item.innerHTML =
    '<span class="ghost-message__emoji">🌿</span>' +
    '<div>' +
      '<span class="ghost-message__count">' + treeDisplay + '</span> ' +
      '<span class="ghost-message__text">' + treeWord + '</span>' +
    '</div>';

  container.appendChild(item);

  // Auto-remove after animation completes
  setTimeout(function() {
    item.remove();
  }, 3500);
}

/* ── Add to cart ─────────────────────────────────────────── */

/**
 * @param {string} productId
 * @param {string} productName
 * @param {number} price
 * @param {string} variant
 * @param {number} trees — trees per unit for this product
 */
function addToCart(productId, productName, price, variant, trees) {
  // Update local state
  var existing = null;
  for (var i = 0; i < cartState.items.length; i++) {
    if (cartState.items[i].productId === productId && cartState.items[i].variant === variant) {
      existing = cartState.items[i];
      break;
    }
  }

  if (existing) {
    existing.qty += 1;
  } else {
    cartState.items.push({ productId: productId, productName: productName, price: price, variant: variant, trees: trees, qty: 1 });
  }

  cartState.total += price;
  cartState.totalTrees += trees;

  // TODO: Celium backend call
  // await celium.cart.add({ productId, variantId: variant, quantity: 1, price });

  // Visual feedback — show cumulative trees
  showGhostMessage(cartState.totalTrees);

  return { success: true, totalTrees: cartState.totalTrees };
}

/* ── Button press animation ──────────────────────────────── */
function animateButtonPress(btn) {
  var originalText = btn.textContent;

  btn.textContent = '✓ Added';
  btn.style.backgroundColor = 'var(--color-olive)';
  btn.disabled = true;

  setTimeout(function() {
    btn.textContent = originalText;
    btn.style.backgroundColor = '';
    btn.disabled = false;
  }, 1800);
}

/* ── Variant selection ───────────────────────────────────── */
function initVariantButtons() {
  var variantGroups = document.querySelectorAll('.product-card__variants');

  variantGroups.forEach(function(group) {
    var btns = group.querySelectorAll('.variant-btn[data-variant]');

    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Deactivate all in group
        btns.forEach(function(b) { b.classList.remove('is-active'); });
        // Activate clicked
        btn.classList.add('is-active');

        // Update parent card's price if variant has a price override
        var price = btn.dataset.price;
        if (price) {
          var card = btn.closest('.product-card');
          var priceEl = card ? card.querySelector('.product-card__price-value') : null;
          if (priceEl) {
            priceEl.textContent = parseInt(price).toLocaleString('en-ZA');
          }
          // Update the cart button's data attribute
          var cartBtn = card ? card.querySelector('.btn--cart') : null;
          if (cartBtn) {
            cartBtn.dataset.price = price;
            cartBtn.dataset.variant = btn.dataset.variant;
          }
        }
      });
    });
  });
}

/* ── Init all add-to-cart buttons ────────────────────────── */
function initCartButtons() {
  var buttons = document.querySelectorAll('.btn--cart');

  buttons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();

      var card        = btn.closest('.product-card');
      var productId   = btn.dataset.productId   || (card ? card.dataset.productId : 'unknown');
      var productName = btn.dataset.productName || (card ? card.dataset.productName : 'Product');
      var price       = parseFloat(btn.dataset.price || '0');
      var variant     = btn.dataset.variant || '';
      var trees       = parseFloat(btn.dataset.trees || '0');

      addToCart(productId, productName, price, variant, trees);
      animateButtonPress(btn);
    });
  });
}

/* ── Export ──────────────────────────────────────────────── */
window.initCart = function() {
  initVariantButtons();
  initCartButtons();

  // Expose for debugging
  // TODO: Remove in production
  window.__samsaraCart = cartState;
};
