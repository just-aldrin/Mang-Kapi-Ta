<?php
declare(strict_types=1);
require __DIR__ . '/inc/bootstrap.php';

render_head('Checkout | Mang KAPI Ta', 'page-checkout');
render_header();
?>
<main id="main" class="page">
  <div class="wrap">
    <ol class="steps"><li class="on">1. Your details</li><li>2. Pay with GCash</li><li>3. Confirmation</li></ol>
    <h1>Checkout</h1>
    <p class="page-sub">Tell us who is collecting the order. You will pay with GCash on the next step.</p>

    <div class="panel" data-checkout-empty hidden>
      <h2>Your order is empty</h2>
      <p>Affix a few stamps from the menu first.</p>
      <a class="btn btn-dark" href="<?= e(url('#menu')) ?>">Back to the menu</a>
    </div>

    <form id="checkout-form" class="checkout-grid" novalidate>
      <div class="panel">
        <h2>Pickup details</h2>
        <label>Full name
          <input type="text" name="name" required maxlength="100" autocomplete="name" placeholder="Juan Dela Cruz">
        </label>
        <div class="field-row">
          <label>GCash / mobile number
            <input type="tel" name="phone" required inputmode="tel" autocomplete="tel" placeholder="0917 123 4567">
          </label>
          <label>Email (for your receipt)
            <input type="email" name="email" required autocomplete="email" placeholder="you@email.com">
          </label>
        </div>
        <label>Order type
          <select name="order_type">
            <option value="pickup">Pickup at the Brew Bar</option>
            <option value="dine-in">Dine-in at the Brew Bar</option>
          </select>
        </label>
        <label>Notes for the barista (optional)
          <input type="text" name="notes" maxlength="300" placeholder="Less ice, no sugar, etc.">
        </label>
      </div>

      <div class="panel">
        <h2>Order summary</h2>
        <div data-summary-lines></div>
        <div class="summary-total"><span>Total</span><strong data-summary-total></strong></div>
        <div class="pay-methods">
          <div class="pay-method"><span class="gcash-badge">GCash</span><span>Pay securely with your GCash wallet</span></div>
        </div>
        <button class="btn btn-dark btn-block" type="submit">Continue to payment</button>
        <p class="form-msg" data-checkout-msg role="status"></p>
      </div>
    </form>
  </div>
</main>
<?php render_footer(); ?>
