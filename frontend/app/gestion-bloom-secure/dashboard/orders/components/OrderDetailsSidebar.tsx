'use client';

import React, { useState, useEffect } from 'react';
import { X, PackageCheck, ShoppingCart } from 'lucide-react';
import { AdminOrderFull, adminOrderService } from '@/services/api';

interface OrderDetailsSidebarProps {
  orderId: number;
  onClose: () => void;
  onStatusUpdated?: () => void; // Called after status changes so parent can refresh list
}

/**
 * ENGINEERING NOTES:
 * - Fetches full order details (items, images, shipping, coupon) on mount
 * - Uses backend-provided product images via AdminOrderItem.product.image_url
 * - Items list scrolls when 5+ items (trigger at ~260px max-height)
 * - Handles loading state and error gracefully
 * - All product images come from backend, no external placeholder service
 */

// Map order status to the last completed step index (0-based).
// pending    = -1 → no steps lit (not yet confirmed)
// confirmed  =  0 → step 1 done (Order Valid only)
// preparing  =  1 → steps 1-2 done (auto-advanced after 6 h)
// shipped    =  2 → steps 1-3 done (auto-advanced after 3 h more)
// delivered  =  3 → all steps done (manual by admin)
const SIDEBAR_STATUS_RANK: Record<string, number> = {
  pending:   -1,
  confirmed:  0,
  preparing:  1,
  shipped:    2,
  dispatched: 2,
  delivered:  3,
  cancelled: -1,
};

export default function OrderDetailsSidebar({
  orderId,
  onClose,
  onStatusUpdated,
}: OrderDetailsSidebarProps) {
  const [order, setOrder] = useState<AdminOrderFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const fullOrder = await adminOrderService.get(orderId);
        setOrder(fullOrder);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleValidateConfirmation = async () => {
    if (!order || order.status !== 'pending') return;
    setIsValidating(true);
    try {
      await adminOrderService.updateStatus(order.id, 'confirmed');
      const updated = await adminOrderService.get(orderId);
      setOrder(updated);
      onStatusUpdated?.();
    } catch (error) {
      console.error('Failed to validate order:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Step 4 — manual delivery confirmation (only available when status === 'shipped')
  const handleMarkDelivered = async () => {
    if (!order || order.status !== 'shipped') return;
    setIsDelivering(true);
    try {
      await adminOrderService.updateStatus(order.id, 'delivered');
      const updated = await adminOrderService.get(orderId);
      setOrder(updated);
      onStatusUpdated?.();
    } catch (error) {
      console.error('Failed to mark as delivered:', error);
    } finally {
      setIsDelivering(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="fixed bottom-0 md:top-0 right-0 z-[60] w-full md:w-[600px] h-[85vh] md:h-full bg-[#fcf9f9] flex items-center justify-center border-l border-gray-100 rounded-t-[20px] md:rounded-none">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="fixed bottom-0 md:top-0 right-0 z-[60] w-full md:w-[600px] h-[85vh] md:h-full bg-[#fcf9f9] flex items-center justify-center border-l border-gray-100 rounded-t-[20px] md:rounded-none">
          <p className="text-gray-500">Failed to load order</p>
        </div>
      </>
    );
  }

  // Derive a display string for the delivery address. Backend may provide
  // `shipping_address_full` (string) or `shipping_address` (string or object).
  const rawDelivery: any = (order as any).shipping_address_full ?? (order as any).shipping_address;
  let deliveryAddressStr = '';
  if (!rawDelivery) {
    deliveryAddressStr = order.customer_email || '';
  } else if (typeof rawDelivery === 'string') {
    deliveryAddressStr = rawDelivery;
  } else if (typeof rawDelivery === 'object') {
    deliveryAddressStr = [rawDelivery.address, rawDelivery.quartier, rawDelivery.city, rawDelivery.zip]
      .filter(Boolean)
      .join(', ');
  } else {
    deliveryAddressStr = String(rawDelivery);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close order details sidebar"
      />

      {/* Sidebar - acts as bottom drawer on mobile */}
      <div 
        className="fixed bottom-0 md:top-0 right-0 z-[60] w-full md:w-[600px] h-[85vh] md:h-full bg-[#fcf9f9] shadow-2xl flex flex-col transform transition-transform duration-300 translate-y-0 md:translate-y-0 md:translate-x-0 border-l border-gray-100 rounded-t-[24px] md:rounded-none overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
      >
        {/* Mobile handle indicator */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden bg-white rounded-t-[24px]">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 md:p-5 sm:p-8 border-b border-[#e1ced3] bg-[#fcf9f9]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="order-details-title" className="text-[16px] sm:text-[18px] sm:text-[20px] md:text-[20px] sm:text-[24px] font-serif font-bold text-[#444] tracking-tight">
                ORDER #{order.order_number}
              </h2>
              <span className="px-3 py-1 bg-pink-50 text-[#da2966] text-[12px] font-bold rounded-full capitalize">
                {order.status}
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mt-1">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(order.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 pb-[120px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Status Timeline — reflects actual order.status */}
          <div className="mb-10">
            <h3 className="text-[16px] sm:text-[18px] font-serif font-bold text-[#444] tracking-wide mb-6">
              Status Timeline
            </h3>

            <div className="relative pl-3 space-y-8 before:absolute before:inset-y-0 before:left-[1.125rem] before:w-[1px] before:bg-gray-300">
              {([
                { label: 'Order Valid', statusKey: 'confirmed' },
                { label: 'Preparing Your Package', statusKey: 'preparing' },
                { label: 'Out for Delivery', statusKey: 'shipped' },
                { label: 'Delivered', statusKey: 'delivered' },
              ] as { label: string; statusKey: string }[]).map((step, idx) => {
                const activeIdx = SIDEBAR_STATUS_RANK[order.status] ?? -1;
                const isStepDone = activeIdx >= 0 && idx <= activeIdx;
                const isStepActive = idx === activeIdx;
                
                // Find corresponding status history entry
                const statusHistory = order.status_histories?.find(
                  (h) => h.status === step.statusKey || h.status.toLowerCase() === step.statusKey.toLowerCase()
                );
                
                const stepDate = statusHistory?.created_at
                  ? new Date(statusHistory.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : null;
                  
                const stepTime = statusHistory?.created_at
                  ? new Date(statusHistory.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : null;
                
                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className={`relative z-10 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ring-4 ring-[#fcf9f9] transition-colors ${
                      isStepDone
                        ? 'bg-gray-800 border-gray-800 text-white'
                        : 'bg-[#fcf9f9] border-gray-400 text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <span className={`text-[15px] font-serif font-bold transition-colors block ${
                        isStepActive ? 'text-[#da2966]' : isStepDone ? 'text-[#444]' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                      {(isStepDone || isStepActive) && stepDate && stepTime && (
                        <span className="text-[12px] text-gray-500 font-medium mt-1.5 block">
                          {stepDate} at {stepTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          <hr className="border-[#e1ced3] mb-8" />

          {/* Customer Details */}
          <div className="mb-10">
            <h3 className="text-[16px] sm:text-[18px] font-serif font-bold text-[#444] tracking-wide mb-6">
              Détails du client
            </h3>

            <div className="bg-white rounded-[20px] p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f5ebed]">
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-6 gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center text-[16px] sm:text-[18px] sm:text-[20px] font-serif font-bold uppercase shrink-0">
                    {order.customer_name
                      ? order.customer_name.substring(0, 2)
                      : '??'}
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <h4 className="text-[16px] font-serif font-bold text-[#444] truncate">
                      {order.customer_name}
                    </h4>
                    <p className="text-[14px] text-gray-500 mt-0.5 truncate">
                      {order.customer_phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                  <div className="flex-1 sm:flex-none bg-[#fcf9f9] rounded-[12px] px-4 py-2 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#f5ebed]">
                    <div className="flex items-center gap-2 mb-1 justify-center">
                      <PackageCheck size={14} className="text-[#da2966]" />
                      <span className="text-[16px] font-serif font-bold text-[#da2966]">
                        {(order.customer_total_spent || 0).toLocaleString()} DH
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Montant total dépensé
                    </span>
                  </div>

                  <div className="flex-1 sm:flex-none bg-[#fcf9f9] rounded-[12px] px-4 py-2 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#f5ebed]">
                    <div className="flex items-center gap-2 mb-1 justify-center">
                      <ShoppingCart size={14} className="text-[#da2966]" />
                      <span className="text-[16px] font-serif font-bold text-[#da2966]">
                        {order.customer_total_items || 0}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Produits totaux
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-[11px] text-[#da2966] font-bold tracking-widest uppercase mb-2">
                  Adresse de livraison
                </h5>
                <p className="text-[13px] text-gray-500 tracking-wide uppercase break-words">
                  {deliveryAddressStr}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-[#e1ced3] mb-8" />

          {/* Items Ordered */}
          <div className="mb-12">
            <h3 className="text-[16px] sm:text-[18px] font-serif font-bold text-[#444] tracking-wide mb-6">
              Articles commandés
            </h3>

            <div className="max-h-[420px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => {
                  // Get primary image URL from product
                  // Backend provides: image_url (primary) OR images array with is_primary flag
                  const imageUrl = item.product?.image_url || 
                                   item.product?.images?.find(img => img.is_primary)?.url || 
                                   item.product?.images?.[0]?.url || 
                                   null;

                  return (
                    <div key={item.id} className="flex gap-4 p-4 bg-white rounded-[14px] border border-[#f5ebed] shadow-sm hover:shadow-md transition-shadow">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-[10px] overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center group">
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const container = e.currentTarget.parentElement;
                                if (container) {
                                  container.classList.add('bg-gradient-to-br', 'from-gray-100', 'to-gray-200');
                                }
                              }}
                            />
                            {/* Loading overlay */}
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 text-center px-2">
                            <span className="text-lg">📷</span>
                            <span className="text-[9px] mt-1 font-medium">No image</span>
                          </div>
                        )}

                        {/* Quantity Badge */}
                        <div className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-[#da2966] rounded-full flex items-center justify-center text-white text-[11px] font-bold z-10 border-2 border-white shadow-sm px-1">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[14px] font-serif font-bold text-[#444] line-clamp-2 leading-tight">
                            {item.product?.name || `Product #${item.product_id}`}
                          </h4>
                          <p className="text-[12px] text-gray-500 mt-1.5 font-medium">
                            {item.quantity}× {Number(item.unit_price).toFixed(2)} DH
                          </p>
                        </div>
                        <p className="text-[14px] font-serif font-bold text-[#222] italic pt-2 border-t border-gray-100">
                          {Number(item.line_total || 0).toFixed(2)} DH
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[14px] text-gray-400 italic text-center py-8">No items found</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-serif font-bold text-[#444]">
                  Your Price
                </span>
                <span className="text-[16px] font-serif font-bold text-[#222] italic">
                  {Number(order.subtotal || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[15px] font-serif font-bold text-[#444]">
                  Expédition
                </span>
                <span className="text-[16px] font-serif font-bold text-[#222] italic">
                  {Number(order.shipping_cost || 0) === 0 ? 'Free' : `${Number(order.shipping_cost || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH`}
                </span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-serif font-bold text-[#444]">
                    Coupon {order.coupon?.code && `(${order.coupon.code})`}
                  </span>
                  <span className="text-[16px] font-serif font-bold text-[#da2966] italic">
                    - {Number(order.discount_amount).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH
                  </span>
                </div>
              )}

              <hr className="border-[#e1ced3] my-4" />

              <div className="flex items-center justify-between">
                <span className="text-[16px] font-serif font-bold text-[#444]">
                  Total
                </span>
                <span className="text-[16px] sm:text-[18px] font-serif font-bold text-[#222] italic">
                  {Number(order.total).toLocaleString('fr-MA', { minimumFractionDigits: 2 })} DH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5 sm:p-8 flex gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
          {/* Step 1: Validate (pending → confirmed) */}
          {order.status === 'pending' && (
            <button
              className="flex-1 px-6 py-3.5 bg-[#4a3f3a] text-white font-bold text-[14px] rounded-[6px] hover:bg-[#3d3531] transition-colors flex items-center justify-center gap-2 italic font-serif disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleValidateConfirmation}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Validating…
                </>
              ) : (
                <>
                  Validate Confirmation
                  <span className="text-[16px] sm:text-[18px] ml-1">›</span>
                </>
              )}
            </button>
          )}

          {/* Steps 2 & 3 are auto — show info pill */}
          {(order.status === 'confirmed' || order.status === 'preparing') && (
            <div className="flex-1 px-6 py-3.5 bg-blue-50 text-blue-700 font-bold text-[14px] rounded-[6px] border border-blue-200 flex items-center justify-center italic font-serif gap-2">
              <span>🕐</span>
              {order.status === 'confirmed' ? 'Preparing in ~6h (auto)' : 'Shipping in ~3h (auto)'}
            </div>
          )}

          {/* Step 4: Mark as Delivered (shipped → delivered) — manual */}
          {order.status === 'shipped' && (
            <button
              className="flex-1 px-6 py-3.5 bg-[#0f8e5c] text-white font-bold text-[14px] rounded-[6px] hover:bg-[#0a7a50] transition-colors flex items-center justify-center gap-2 italic font-serif disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleMarkDelivered}
              disabled={isDelivering}
            >
              {isDelivering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  Mark as Delivered
                  <span className="text-[16px] sm:text-[18px] ml-1">›</span>
                </>
              )}
            </button>
          )}

          {/* Delivered or cancelled — read-only indicator */}
          {(order.status === 'delivered' || order.status === 'cancelled') && (
            <div className={`flex-1 px-6 py-3.5 font-bold text-[14px] rounded-[6px] border flex items-center justify-center italic font-serif gap-2 ${
              order.status === 'delivered'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              <span>{order.status === 'delivered' ? '✓' : '✕'}</span>
              {order.status === 'delivered' ? 'Order Delivered' : 'Order Cancelled'}
            </div>
          )}

          <button
            className="flex-1 px-6 py-3.5 bg-white text-[#444] font-bold text-[14px] rounded-[6px] border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center italic font-serif"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
