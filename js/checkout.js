/**
 * checkout.js — Checkout modal + Supabase order capture
 * Samsara Olive Oil
 */
'use strict';

var SUPABASE_URL      = 'https://recqyhjooukkdwsrjslp.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlY3F5aGpvb3Vra2R3c3Jqc2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMjkzMTAsImV4cCI6MjA4MzcwNTMxMH0.vN0bzTBBrtSBzicjniXXyCUAdn9YIWKHmXIKMJKb0rg';
var DELIVERY_FEE      = 100;

var _supabase = null;

function getSB() {
  if (!_supabase && window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

/* ── Modal HTML ──────────────────────────────────────────── */
var MODAL_HTML = [
  '<div id="checkout-modal" class="checkout-modal" role="dialog" aria-modal="true" aria-label="Checkout" hidden>',
  '  <div class="checkout-modal__backdrop"></div>',
  '  <div class="checkout-modal__panel">',
  '    <button class="checkout-modal__close" aria-label="Close">&times;</button>',
  '    <h2 class="checkout-modal__title">Complete Your Order</h2>',
  '    <div class="checkout-modal__body">',
  '      <div class="checkout-summary">',
  '        <h3 class="checkout-summary__heading">Your Order</h3>',
  '        <div id="checkout-items"></div>',
  '        <div class="checkout-summary__row"><span>Subtotal</span><span id="co-subtotal">R0</span></div>',
  '        <div class="checkout-summary__row"><span>Delivery</span><span>R100</span></div>',
  '        <div class="checkout-summary__row checkout-summary__row--total"><span>Total</span><span id="co-total">R0</span></div>',
  '      </div>',
  '      <form id="checkout-form" class="checkout-form" novalidate>',
  '        <div class="checkout-form__group">',
  '          <label for="cf-name">Full Name *</label>',
  '          <input type="text" id="cf-name" name="name" required autocomplete="name" placeholder="Jane Smith" />',
  '        </div>',
  '        <div class="checkout-form__group">',
  '          <label for="cf-email">Email *</label>',
  '          <input type="email" id="cf-email" name="email" required autocomplete="email" placeholder="jane@example.com" />',
  '        </div>',
  '        <div class="checkout-form__group">',
  '          <label for="cf-phone">Phone *</label>',
  '          <input type="tel" id="cf-phone" name="phone" required autocomplete="tel" placeholder="+27 82 000 0000" />',
  '        </div>',
  '        <div class="checkout-form__group">',
  '          <label for="cf-address">Street Address *</label>',
  '          <input type="text" id="cf-address" name="address" required autocomplete="street-address" placeholder="12 Main Road" />',
  '        </div>',
  '        <div class="checkout-form__row">',
  '          <div class="checkout-form__group">',
  '            <label for="cf-city">City *</label>',
  '            <input type="text" id="cf-city" name="city" required autocomplete="address-level2" placeholder="Cape Town" />',
  '          </div>',
  '          <div class="checkout-form__group">',
  '            <label for="cf-postal">Postal Code *</label>',
  '            <input type="text" id="cf-postal" name="postal" required autocomplete="postal-code" placeholder="8001" />',
  '          </div>',
  '        </div>',
  '        <div class="checkout-form__group">',
  '          <label for="cf-province">Province *</label>',
  '          <select id="cf-province" name="province" required>',
  '            <option value="">Select province...</option>',
  '            <option>Western Cape</option>',
  '            <option>Eastern Cape</option>',
  '            <option>Northern Cape</option>',
  '            <option>Gauteng</option>',
  '            <option>KwaZulu-Natal</option>',
  '            <option>Free State</option>',
  '            <option>Limpopo</option>',
  '            <option>Mpumalanga</option>',
  '            <option>North West</option>',
  '          </select>',
  '        </div>',
  '        <div class="checkout-form__group">',
  '          <label for="cf-notes">Notes (optional)</label>',
  '          <textarea id="cf-notes" name="notes" rows="2" placeholder="Special instructions..."></textarea>',
  '        </div>',
  '        <div id="checkout-error" class="checkout-error" hidden></div>',
  '        <button type="submit" class="btn btn--primary checkout-form__submit" id="checkout-submit">',
  '          <span id="co-btn-text">Pay R<span id="co-pay-amount">0</span> with PayFast</span>',
  '          <span id="co-btn-loading" hidden>Processing...</span>',
  '        </button>',
  '      </form>',
  '    </div>',
  '  </div>',
  '</div>'
].join('\n');

/* ── Populate summary ────────────────────────────────────── */
function populateSummary() {
  var cart = window.__samsaraCart;
  if (!cart) return;

  var itemsEl = document.getElementById('checkout-items');
  if (itemsEl) {
    itemsEl.innerHTML = cart.items.map(function (item) {
      var label = item.productName + (item.variant ? ' (' + item.variant + ')' : '') + ' \u00d7 ' + item.qty;
      var price = 'R' + (item.price * item.qty).toLocaleString('en-ZA');
      return '<div class="checkout-summary__item"><span>' + label + '</span><span>' + price + '</span></div>';
    }).join('');
  }

  var sub   = cart.total;
  var total = sub + DELIVERY_FEE;

  var subEl = document.getElementById('co-subtotal');
  var totEl = document.getElementById('co-total');
  var payEl = document.getElementById('co-pay-amount');
  if (subEl) subEl.textContent = 'R' + sub.toLocaleString('en-ZA');
  if (totEl) totEl.textContent = 'R' + total.toLocaleString('en-ZA');
  if (payEl) payEl.textContent = total.toLocaleString('en-ZA');
}

/* ── Open / close ────────────────────────────────────────── */
function openCheckout() {
  var modal = document.getElementById('checkout-modal');
  if (!modal) return;
  populateSummary();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(function () { modal.classList.add('is-open'); });
}

function closeCheckout() {
  var modal = document.getElementById('checkout-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(function () { modal.hidden = true; }, 300);
}

/* ── Submit ──────────────────────────────────────────────── */
function handleSubmit(e) {
  e.preventDefault();

  var form      = document.getElementById('checkout-form');
  var btn       = document.getElementById('checkout-submit');
  var btnText   = document.getElementById('co-btn-text');
  var btnLoad   = document.getElementById('co-btn-loading');
  var errorEl   = document.getElementById('checkout-error');
  var cart      = window.__samsaraCart;

  if (!form.checkValidity()) { form.reportValidity(); return; }
  if (!cart || !cart.items.length) { showError('Your cart is empty.'); return; }

  btn.disabled       = true;
  btnText.hidden     = true;
  btnLoad.hidden     = false;
  errorEl.hidden     = true;

  var subtotal = cart.total;
  var total    = subtotal + DELIVERY_FEE;

  var payload = {
    customer_name:       form.name.value.trim(),
    customer_email:      form.email.value.trim(),
    customer_phone:      form.phone.value.trim(),
    delivery_address:    form.address.value.trim(),
    delivery_city:       form.city.value.trim(),
    delivery_province:   form.province.value,
    delivery_postal_code:form.postal.value.trim(),
    items:               cart.items,
    subtotal:            subtotal,
    delivery_fee:        DELIVERY_FEE,
    total:               total,
    notes:               form.notes.value.trim() || null,
    status:              'pending',
  };

  var sb = getSB();
  if (!sb) {
    showError('Payment service unavailable. Please contact us directly.');
    btn.disabled = false; btnText.hidden = false; btnLoad.hidden = true;
    return;
  }

  sb.from('orders').insert(payload).select('id').single().then(function (res) {
    if (res.error) throw res.error;
    window.submitToPayFast({
      id:            res.data.id,
      customerName:  payload.customer_name,
      customerEmail: payload.customer_email,
      total:         total,
    });
  }).catch(function (err) {
    console.error('Order error:', err);
    showError('Something went wrong. Please try again or contact us directly.');
    btn.disabled = false; btnText.hidden = false; btnLoad.hidden = true;
  });
}

function showError(msg) {
  var el = document.getElementById('checkout-error');
  if (el) { el.textContent = msg; el.hidden = false; }
}

/* ── Payment result banners ──────────────────────────────── */
function checkPaymentResult() {
  var params  = new URLSearchParams(window.location.search);
  var payment = params.get('payment');
  if (!payment) return;

  var banner = document.getElementById('payment-banner');
  if (!banner) return;

  if (payment === 'success') {
    banner.textContent = '🌿 Order received! We\'ll be in touch shortly with tracking details.';
    banner.className   = 'payment-banner payment-banner--success';
    // Clear cart
    var cart = window.__samsaraCart;
    if (cart) { cart.items = []; cart.total = 0; cart.totalTrees = 0; }
    if (window.updateCartDrawer) window.updateCartDrawer();
  } else if (payment === 'cancelled') {
    banner.textContent = 'Payment cancelled. Your cart is still waiting whenever you\'re ready. 🕊️';
    banner.className   = 'payment-banner payment-banner--info';
  }

  banner.hidden = false;
  window.history.replaceState({}, '', window.location.pathname);
  setTimeout(function () {
    banner.style.transition = 'opacity 0.5s';
    banner.style.opacity    = '0';
    setTimeout(function () { banner.hidden = true; banner.style.opacity = ''; }, 500);
  }, 8000);
}

/* ── Init ────────────────────────────────────────────────── */
window.initCheckout = function () {
  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

  var modal    = document.getElementById('checkout-modal');
  var backdrop = modal.querySelector('.checkout-modal__backdrop');
  var closeBtn = modal.querySelector('.checkout-modal__close');
  var form     = document.getElementById('checkout-form');

  closeBtn.addEventListener('click', closeCheckout);
  backdrop.addEventListener('click', closeCheckout);
  form.addEventListener('submit', handleSubmit);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCheckout();
  });

  window.openCheckout = openCheckout;
  checkPaymentResult();
};
