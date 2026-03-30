<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Facture – <?php echo e($order->order_number); ?></title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 13px; color: #2d2d2d; background: #ffffff; }
  .page { padding: 40px 48px; }

  /* ── Header ─────────────────────────────────────────────────────────── */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; border-bottom: 2px solid #da2966; padding-bottom: 24px; }
  .brand-name { font-size: 28px; font-weight: 700; color: #da2966; letter-spacing: 1px; font-style: italic; }
  .brand-tagline { font-size: 10px; color: #9e9e9e; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
  .invoice-meta { text-align: right; }
  .invoice-label { font-size: 22px; font-weight: 700; color: #423835; text-transform: uppercase; letter-spacing: 3px; }
  .invoice-number { font-size: 13px; color: #9e9e9e; margin-top: 4px; }
  .invoice-date { font-size: 11px; color: #bdbdbd; margin-top: 2px; }

  /* ── Addresses ───────────────────────────────────────────────────────── */
  .addresses { display: flex; justify-content: space-between; margin-bottom: 32px; gap: 24px; }
  .address-block { flex: 1; }
  .address-block h3 { font-size: 9px; font-weight: 700; color: #9e9e9e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
  .address-block p { font-size: 12px; color: #2d2d2d; line-height: 1.7; }
  .address-block .name { font-weight: 700; font-size: 13px; margin-bottom: 2px; }

  /* ── Status badge ────────────────────────────────────────────────────── */
  .status-row { display: flex; justify-content: flex-end; margin-bottom: 28px; }
  .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .status-pending    { background: #fff3e0; color: #e65100; }
  .status-confirmed  { background: #e8f5e9; color: #2e7d32; }
  .status-shipped    { background: #e3f2fd; color: #1565c0; }
  .status-delivered  { background: #f3e5f5; color: #6a1b9a; }
  .status-cancelled  { background: #fce4ec; color: #c62828; }

  /* ── Items table ─────────────────────────────────────────────────────── */
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #423835; color: #ffffff; }
  thead th { padding: 10px 14px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  thead th:last-child { text-align: right; }
  tbody tr { border-bottom: 1px solid #f0f0f0; }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 11px 14px; font-size: 12px; vertical-align: middle; }
  tbody td:last-child { text-align: right; font-weight: 600; }
  tbody .product-name { font-weight: 600; color: #2d2d2d; }
  tbody .product-variant { font-size: 10px; color: #9e9e9e; margin-top: 2px; }
  tbody tr:nth-child(even) { background: #fafafa; }

  /* ── Totals ──────────────────────────────────────────────────────────── */
  .totals { float: right; width: 280px; margin-bottom: 40px; }
  .totals table { margin-bottom: 0; }
  .totals td { padding: 7px 14px; font-size: 12px; border-bottom: none; }
  .totals .label { color: #757575; }
  .totals .value { text-align: right; font-weight: 600; }
  .totals .discount { color: #2e7d32; }
  .totals .divider { border-top: 1px solid #e0e0e0; }
  .totals .total-row td { padding: 10px 14px; font-weight: 700; font-size: 15px; color: #da2966; }

  /* ── Footer ──────────────────────────────────────────────────────────── */
  .clearfix { clear: both; }
  .footer { border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 24px; text-align: center; }
  .footer p { font-size: 10px; color: #bdbdbd; line-height: 1.8; }
  .footer .thank-you { font-size: 14px; font-weight: 700; color: #da2966; margin-bottom: 8px; font-style: italic; }
  .footer .contact { font-size: 11px; color: #9e9e9e; }

  /* ── Note box ────────────────────────────────────────────────────────── */
  .note-box { background: #fff5f7; border-left: 3px solid #da2966; padding: 12px 16px; margin-bottom: 28px; border-radius: 2px; }
  .note-box p { font-size: 11px; color: #6d4c41; line-height: 1.6; }
</style>
</head>
<body>
<div class="page">

  
  <div class="header">
    <div>
      <div class="brand-name">MyBloom</div>
      <div class="brand-tagline">Parfums &amp; Soins • Maroc</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-label">Facture</div>
      <div class="invoice-number"># <?php echo e($order->order_number); ?></div>
      <div class="invoice-date"><?php echo e($order->created_at->format('d M Y')); ?></div>
    </div>
  </div>

  
  <div class="status-row">
    <?php
      $statusClass = match($order->status) {
        'confirmed'  => 'status-confirmed',
        'shipped'    => 'status-shipped',
        'delivered'  => 'status-delivered',
        'cancelled'  => 'status-cancelled',
        default      => 'status-pending',
      };
      $statusLabel = match($order->status) {
        'confirmed'  => 'Confirmée',
        'shipped'    => 'Expédiée',
        'delivered'  => 'Livrée',
        'cancelled'  => 'Annulée',
        default      => 'En attente',
      };
    ?>
    <span class="status-badge <?php echo e($statusClass); ?>"><?php echo e($statusLabel); ?></span>
  </div>

  
  <div class="addresses">
    <div class="address-block">
      <h3>Vendeur</h3>
      <p class="name">MyBloom</p>
      <p>Laayoune, Maroc<br>contact@mybloom.ma</p>
    </div>
    <div class="address-block" style="text-align: right;">
      <h3>Client</h3>
      <p class="name"><?php echo e($order->customer_name); ?></p>
      <p>
        <?php echo e($order->customer_phone); ?><br>
        <?php if($order->shipping_city): ?><?php echo e($order->shipping_city); ?><?php endif; ?>
        <?php if($order->customer_email): ?><br><?php echo e($order->customer_email); ?><?php endif; ?>
      </p>
    </div>
  </div>

  
  <table>
    <thead>
      <tr>
        <th style="width:50%">Produit</th>
        <th style="text-align:center">Taille</th>
        <th style="text-align:center">Qté</th>
        <th style="text-align:right">P.U.</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <?php $__currentLoopData = $order->items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
      <tr>
        <td>
          <div class="product-name"><?php echo e($item->product->name ?? 'Produit'); ?></div>
          <?php if($item->size_label): ?>
            <div class="product-variant"><?php echo e($item->size_label); ?></div>
          <?php endif; ?>
        </td>
        <td style="text-align:center; color:#9e9e9e;"><?php echo e($item->size_label ?? '—'); ?></td>
        <td style="text-align:center;"><?php echo e($item->quantity); ?></td>
        <td style="text-align:right;"><?php echo e(number_format((float)$item->unit_price, 2, '.', ' ')); ?> DH</td>
        <td><?php echo e(number_format((float)$item->unit_price * $item->quantity, 2, '.', ' ')); ?> DH</td>
      </tr>
      <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </tbody>
  </table>

  
  <div class="totals">
    <table>
      <tr>
        <td class="label">Sous-total</td>
        <td class="value"><?php echo e(number_format((float)$order->subtotal, 2, '.', ' ')); ?> DH</td>
      </tr>
      <tr>
        <td class="label">Livraison</td>
        <td class="value">
          <?php if((float)$order->shipping_cost === 0.0): ?>
            Gratuit
          <?php else: ?>
            <?php echo e(number_format((float)$order->shipping_cost, 2, '.', ' ')); ?> DH
          <?php endif; ?>
        </td>
      </tr>
      <?php if((float)$order->discount_amount > 0): ?>
      <tr>
        <td class="label discount">Remise</td>
        <td class="value discount">− <?php echo e(number_format((float)$order->discount_amount, 2, '.', ' ')); ?> DH</td>
      </tr>
      <?php endif; ?>
      <tr class="divider">
        <td colspan="2" style="padding:0; border-top: 1px solid #e0e0e0;"></td>
      </tr>
      <tr class="total-row">
        <td class="label">Total</td>
        <td class="value"><?php echo e(number_format((float)$order->total, 2, '.', ' ')); ?> DH</td>
      </tr>
    </table>
  </div>

  <div class="clearfix"></div>

  
  <div class="note-box">
    <p>Notre équipe vous contactera dans les plus brefs délais pour confirmer votre commande et vous communiquer les détails de livraison. Merci de votre confiance.</p>
  </div>

  
  <div class="footer">
    <div class="thank-you">Merci pour votre achat !</div>
    <p class="contact">
      MyBloom — Laayoune, Maroc &nbsp;|&nbsp; contact@mybloom.ma
    </p>
    <p style="margin-top:6px;">Cette facture a été générée automatiquement. Pour toute question, contactez-nous via WhatsApp.</p>
  </div>

</div>
</body>
</html>
<?php /**PATH C:\Users\acer\Desktop\Parfum\backend\resources\views/invoices/order.blade.php ENDPATH**/ ?>