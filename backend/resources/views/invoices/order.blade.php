<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invoice – {{ $order->order_number }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #333; background: #fff; }
  .page { padding: 50px 60px; max-width: 900px; margin: 0 auto; }

  /* ── Header ─────────────────────────────────────────────────────────── */
  .header { text-align: center; margin-bottom: 50px; }
  .invoice-title { font-size: 15px; font-weight: 700; color: #da2966; letter-spacing: 1px; margin-top: 10px; margin-bottom: 40px; text-transform: uppercase; font-family: 'Times New Roman', serif;}

  /* ── Info grid ────────────────────────────────────────────────────────── */
  .info-wrapper { padding: 20px 0; margin-bottom: 10px; }
  .info-grid { display: table; width: 100%; }
  .info-block { display: table-cell; vertical-align: top; }
  .info-block.left { text-align: left; width: 35%; }
  .info-block.center { text-align: left; width: 40%; border-left: 1px solid #f0e0e6; padding-left: 24px; }
  .info-block.right { text-align: right; width: 25%; border-left: 1px solid #f0e0e6; padding-left: 24px; }
  .info-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 600; }
  .info-value { font-size: 13px; font-weight: bold; color: #222; margin-bottom: 14px; line-height: 1.4; }
  .info-value.pink { color: #da2966; }
  .info-value.normal { font-weight: normal; color: #444; }
  
  /* ── Divider ──────────────────────────────────────────────────────────── */
  .divider { height: 1.5px; background: #da2966; margin: 10px 0 24px 0; }

  /* ── Delivery address ────────────────────────────────────────────────────── */
  .delivery-section { background: #f0ebe3; padding: 20px 24px 24px 24px; margin-bottom: 30px; border-radius: 3px; width: 100%; }
  .delivery-label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 10px; }
  .delivery-address { font-size: 14px; color: #333; line-height: 1.6; font-weight: normal; }

  /* ── Items table ─────────────────────────────────────────────────────── */
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead tr { background: #333; color: #fff; }
  thead th { padding: 10px 15px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
  thead th:nth-child(2) { text-align: center; }
  thead th:nth-child(3) { text-align: right; }
  thead th:nth-child(4) { text-align: right; }
  tbody tr { border-bottom: 1px solid #eee; }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 12px 15px; font-size: 12px; vertical-align: top; }
  tbody td:nth-child(2) { text-align: center; font-weight: 700; color: #333; vertical-align: middle; }
  tbody td:nth-child(3) { text-align: right; color: #666; vertical-align: middle; }
  tbody td:nth-child(4) { text-align: right; font-weight: 700; color: #333; vertical-align: middle; }
  tbody .product-name { font-weight: 700; color: #333; margin-bottom: 2px; text-transform: uppercase; font-size: 11px; }
  tbody .product-details { font-size: 10px; color: #999; }

  /* ── Totals section ──────────────────────────────────────────────────── */
  .totals-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .totals-table td { padding: 8px 15px; font-size: 12px; border-bottom: 1px solid #eee; }
  .totals-table tr:last-child td { border-bottom: none; }                 
  .totals-table .label { color: #666; width: 50%; border-right: 1px solid #eee; }
  .totals-table .value { text-align: right; font-weight: 600; color: #666; }
  .totals-table .shipping .value { color: #da2966; }
  .totals-table .discount .value { color: #da2966; }
  .totals-table .discount .label { color: #999; }
  
  .total-row { background: #222; }
  .total-row td { padding: 12px 15px; border: none; }
  .total-row .label { color: #fff; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; border-right: none; }
  .total-row .value { color: #fff; font-size: 14px; font-weight: 700; }

  /* ── Footer ──────────────────────────────────────────────────────────── */
  .divider-footer { height: 1px; background: #da2966; margin: 30px 0 20px 0; }
  .footer { text-align: center; }
  .thank-you { font-size: 12px; font-style: italic; color: #333; margin-bottom: 12px; }
  .footer-contact { font-size: 11px; color: #1976d2; }
  .footer-contact a { color: #1976d2; text-decoration: none; }
  .footer-contact .phone { color: #1976d2; }
</style>
</head>
<body>
<div class="page">

  {{-- ── HEADER ─────────────────────────────────────────────────────────── --}}
  <div class="header">
    @php
      $logoPath = public_path('logo.png');
      if (file_exists($logoPath)) {
          $logoData = base64_encode(file_get_contents($logoPath));
          $logoSrc = 'data:image/png;base64,' . $logoData;
      } else {
          // Fallback: use text if logo doesn't exist
          $logoSrc = null;
      }
    @endphp
    @if($logoSrc)
      <img src="{{ $logoSrc }}" alt="MyBloom" style="height: 90px; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto;">
    @else
      <div style="text-align: center; font-size: 32px; font-weight: bold; color: #da2966; margin-bottom: 10px; font-family: 'Times New Roman', serif;">
        MyBloom
      </div>
    @endif
    <div class="invoice-title">INVOICE</div>
  </div>

  {{-- ── INFO GRID ──────────────────────────────────────────────────────── --}}
  <div class="info-wrapper">
    <div class="info-grid">
      <div class="info-block left">
        <div class="info-label">INVOICE NUMBER</div>
        <div class="info-value pink">#{{ $order->order_number }}</div>
        <div class="info-label">ORDER ID</div>
        <div class="info-value">{{ $order->order_number }}</div>
      </div>
      <div class="info-block center">
        <div class="info-label">CUSTOMER DETAILS</div>
        <div class="info-value">{{ $order->customer_name }}</div>
        <div class="info-value normal">{{ $order->customer_phone }}</div>
      </div>
      <div class="info-block right">
        <div class="info-label">DATE</div>
        <div class="info-value normal">{{ $order->created_at->format('F d, Y') }}</div>
      </div>
    </div>
  </div>

  {{-- ── DIVIDER ─────────────────────────────────────────────────────────── --}}
  <div class="divider"></div>

  {{-- ── DELIVERY ADDRESS ────────────────────────────────────────────────── --}}
  <div class="delivery-section">
    <div class="delivery-label">Delivery Address</div>
    <div class="delivery-address">{{ $order->shipping_address_full ?? $order->shipping_address }}</div>
  </div>

  {{-- ── ITEMS TABLE ─────────────────────────────────────────────────────── --}}
  <table>
    <thead>
      <tr>
        <th style="width: 45%;">Product / Description</th>
        <th style="width: 15%; text-align: center;">Qty</th>
        <th style="width: 20%; text-align: right;">Unit Price</th>
        <th style="width: 20%; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      @foreach($order->items as $item)
      <tr>
        <td>
          <div class="product-name">{{ $item->product->name ?? 'Product' }}</div>
          @if($item->size_label)
            <div class="product-details">{{ $item->size_label }}</div>
          @endif
          @if($item->product?->productType?->name)
            <div class="product-details">{{ $item->product->productType->name }}</div>
          @endif
        </td>
        <td style="text-align: center;">{{ $item->quantity }}</td>
        <td style="text-align: right;">{{ number_format((float)$item->unit_price, 2, '.', '') }} DH</td>
        <td style="text-align: right; font-weight: 700;">{{ number_format((float)$item->unit_price * $item->quantity, 2, '.', '') }} DH</td>
      </tr>
      @endforeach
    </tbody>
  </table>

  {{-- ── TOTALS ──────────────────────────────────────────────────────────── --}}
  <table class="totals-table">
    <tbody>
      <tr>
        <td class="label">Subtotal</td>
        <td class="value">{{ number_format((float)$order->subtotal, 2, '.', '') }} DH</td>
      </tr>
      <tr class="shipping">
        <td class="label">Shipping</td>
        <td class="value">@if((float)$order->shipping_cost === 0.0)Free @else {{ number_format((float)$order->shipping_cost, 2, '.', '') }} DH @endif</td>
      </tr>
      @if((float)$order->discount_amount > 0)
      <tr class="discount">
        <td class="label" style="color: #999;">Discount (Coupon)</td>
        <td class="value">-{{ number_format((float)$order->discount_amount, 2, '.', '') }} DH</td>
      </tr>
      @endif
      <tr class="total-row">
        <td class="label">Total Due</td>
        <td class="value">{{ number_format((float)$order->total, 2, '.', '') }} DH</td>
      </tr>
    </tbody>
  </table>

  {{-- ── DIVIDER ─────────────────────────────────────────────────────────── --}}
  <div class="divider-footer"></div>

  {{-- ── FOOTER ──────────────────────────────────────────────────────────── --}}
  <div class="footer">
    <div class="thank-you">Thank you for your purchase with MyBloom</div>
    <div class="footer-contact">
      <a href="mailto:Bloomparfums1@gmail.com">Bloomparfums1@gmail.com</a><br>
      <div style="margin-top: 6px;" class="phone">+212 608 656 271</div>
    </div>
  </div>

</div>
</body>
</html>
