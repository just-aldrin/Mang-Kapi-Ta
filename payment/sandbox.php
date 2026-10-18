<?php
declare(strict_types=1);
require __DIR__ . '/../inc/bootstrap.php';

/** Simulated GCash approval screen. Available only when no real payment key is configured. */

if (payments_mode() !== 'sandbox') {
    http_response_code(404);
    exit('Not found');
}

$ref = (string) ($_GET['ref'] ?? $_POST['ref'] ?? '');
$order = $ref !== '' ? find_order($ref) : null;
if (!$order || empty($_SESSION['orders'][$order['ref']])) {
    http_response_code(404);
    exit('Order not found');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_valid($_POST['csrf'] ?? null)) {
    if (($_POST['action'] ?? '') === 'approve') {
        order_mark_paid($order['ref']);
    } else {
        order_set_status($order['ref'], 'failed');
    }
    redirect(url('order.php?ref=' . urlencode($order['ref'])));
}

render_head('GCash (test mode) | Mang KAPI Ta', 'page-sim');
?>
<main id="main" class="page">
  <div class="wrap">
    <div class="sim-phone">
      <div class="sim-banner">TEST MODE &middot; SIMULATED GCASH SCREEN &middot; NO REAL MONEY</div>
      <div class="sim-top"><strong>GCash</strong>Confirm payment</div>
      <div class="sim-body">
        <p class="sim-merchant">Mang KAPI Ta Modern Coffee</p>
        <div class="sim-amount"><?= e(peso((int) $order['total'])) ?></div>
        <p class="sim-merchant">Order <?= e($order['ref']) ?></p>
        <form method="post">
          <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="ref" value="<?= e($order['ref']) ?>">
          <button class="btn btn-blue btn-block" name="action" value="approve" type="submit">Pay <?= e(peso((int) $order['total'])) ?></button>
          <br>
          <button class="btn btn-outline btn-block" name="action" value="decline" type="submit">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</main>
<?php render_footer(false); ?>
