/**
 * cart-drawer.js — Slide-in cart drawer
 * Samsara Olive Oil
 */
'use strict';

var DELIVERY_FEE = 100;

var DRAWER_HTML = [
  '<div id="cart-drawer" class="cart-drawer" aria-label="Shopping cart" hidden>',
  '  <div class="cart-drawer__backdrop"></div>',
  '  <div class="cart-drawer__panel">',
  '    <div class="cart-drawer__header">',
  '      <h2 class="cart-drawer__title">Your Cart</h2>',
  '      <button class="cart-drawer__close" aria-label="Close cart">&times;</button>',
  '    </div>',
  '    <div class="cart-drawer__body">',
  '      <div id="cart-drawer-empty" class="cart-drawer__empty">',
  '        <span>🌿</span>',
  '        <p>Your cart is empty.</p>',
  '        <p>Add some olive oil to get started.</p>',
  '      </div>',
  '      <ul id="cart-drawer-items" class="cart-drawer__items" hidden></ul>',
  '    </div>',
  '    <div class="cart-drawer__footer" id="cart-drawer-footer" hidden>',
  '      <div class="cart-drawer__subtotal">',
  '        <span>Subtotal</span>',
  '        <span id="cart-drawer-subtotal">R0</span>',
  '      </div>',
  '      <p class="cart-drawer__delivery-note">+ R100 delivery • calculated at checkout</p>',
  '      <button class="btn btn--primary cart-drawer__checkout" id="cart-drawer-checkout">',
  '        Checkout',
  '      </button>',
  '    </div>',
  '  </div>',
  '</div>'
].join('\n');

/* ── Render items ────────────────────────────────────────── */
function renderCartDrawer() {
  var cart      = window.__samsaraCart;
  var listEl    = document.getElementById('cart-drawer-items');
  var emptyEl   = document.getElementById('cart-drawer-empty');
  var footerEl  = document.getElementById('cart-drawer-footer');
  var subtotalEl = document.getElementById('cart-drawer-subtotal');
  var badgeEl   = document.getElementById('cart-badge');

  if (!cart || !listEl) return;

  var totalQty = cart.items.reduce(function (acc, i) { return acc + i.qty; }, 0);

  // Badge
  if (badgeEl) {
    badgeEl.textContent = totalQty;
    badgeEl.hidden = totalQty === 0;
  }

  if (totalQty === 0) {
    listEl.hidden   = true;
    emptyEl.hidden  = false;
    footerEl.hidden = true;
    return;
  }

  emptyEl.hidden  = false; // kept for layout, but list takes over
  emptyEl.hidden  = true;
  listEl.hidden   = false;
  footerEl.hidden = false;

  listEl.innerHTML = cart.items.map(function (item, idx) {
    var label = item.productName + (item.variant ? ' <small>(' + item.variant + ')</small>' : '');
    return [
      '<li class="cart-item" data-idx="' + idx + '">',
      '  <div class="cart-item__info">',
      '    <span class="cart-item__name">' + label + '</span>',
      '    <span class="cart-item__price">R' + item.price.toLocaleString('en-ZA') + '</span>',
      '  </div>',
      '  <div class="cart-item__controls">',
      '    <button class="cart-item__qty-btn" data-action="dec" data-idx="' + idx + '" aria-label="Remove one">&#8722;</button>',
      '    <span class="cart-item__qty">' + item.qty + '</span>',
      '    <button class="cart-item__qty-btn" data-action="inc" data-idx="' + idx + '" aria-label="Add one">&#43;</button>',
      '    <button class="cart-item__remove" data-idx="' + idx + '" aria-label="Remove item">&times;</button>',
      '  </div>',
      '</li>',
    ].join('\n');
  }).join('');

  if (subtotalEl) {
    subtotalEl.textContent = 'R' + cart.total.toLocaleString('en-ZA');
  }
}

/* ── Open / close ────────────────────────────────────────── */
function openCartDrawer() {
  var drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  renderCartDrawer();
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(function () { drawer.classList.add('is-open'); });
}

function closeCartDrawer() {
  var drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(function () { drawer.hidden = true; }, 300);
}

/* ── Qty / remove controls ───────────────────────────────── */
function handleDrawerClick(e) {
  var cart = window.__samsaraCart;
  if (!cart) return;

  var btn = e.target.closest('[data-action],[data-idx].cart-item__remove');
  if (!btn) return;

  var idx    = parseInt(btn.dataset.idx, 10);
  var action = btn.dataset.action;
  var item   = cart.items[idx];
  if (!item) return;

  if (btn.classList.contains('cart-item__remove')) {
    // Remove entirely
    cart.total       -= item.price * item.qty;
    cart.totalTrees  -= (item.trees || 0) * item.qty;
    cart.items.splice(idx, 1);
  } else if (action === 'inc') {
    item.qty++;
    cart.total      += item.price;
    cart.totalTrees += (item.trees || 0);
  } else if (action === 'dec') {
    if (item.qty <= 1) {
      cart.total       -= item.price;
      cart.totalTrees  -= (item.trees || 0);
      cart.items.splice(idx, 1);
    } else {
      item.qty--;
      cart.total      -= item.price;
      cart.totalTrees -= (item.trees || 0);
    }
  }

  // Clamp
  if (cart.total < 0) cart.total = 0;
  if (cart.totalTrees < 0) cart.totalTrees = 0;

  renderCartDrawer();
}

/* ── Init ────────────────────────────────────────────────── */
window.initCartDrawer = function () {
  document.body.insertAdjacentHTML('beforeend', DRAWER_HTML);

  var drawer   = document.getElementById('cart-drawer');
  var backdrop = drawer.querySelector('.cart-drawer__backdrop');
  var closeBtn = drawer.querySelector('.cart-drawer__close');
  var itemList = document.getElementById('cart-drawer-items');
  var checkBtn = document.getElementById('cart-drawer-checkout');
  var cartIcon = document.getElementById('cart-icon-btn');

  if (backdrop) backdrop.addEventListener('click', closeCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (itemList) itemList.addEventListener('click', handleDrawerClick);
  if (cartIcon) cartIcon.addEventListener('click', openCartDrawer);
  if (checkBtn) checkBtn.addEventListener('click', function () {
    closeCartDrawer();
    setTimeout(function () {
      if (window.openCheckout) window.openCheckout();
    }, 320);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCartDrawer();
  });

  // Expose for other modules
  window.openCartDrawer   = openCartDrawer;
  window.updateCartDrawer = renderCartDrawer;
};
