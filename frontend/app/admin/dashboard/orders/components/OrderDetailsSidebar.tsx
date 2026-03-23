'use client';

import React, { useState, useEffect } from 'react';
import { X, ListTodo, PackageCheck } from 'lucide-react';
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
          className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[1px]"
          onClick={onClose}
        />
        <div className="fixed top-0 right-0 z-50 w-full md:w-[600px] h-full bg-[#fcf9f9] flex items-center justify-center border-l border-gray-100">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[1px]"
          onClick={onClose}
        />
        <div className="fixed top-0 right-0 z-50 w-full md:w-[600px] h-full bg-[#fcf9f9] flex items-center justify-center border-l border-gray-100">
          <p className="text-gray-500">Failed to load order</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 z-50 w-full md:w-[600px] h-full bg-[#fcf9f9] shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between p-8 border-b border-[#e1ced3]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[24px] font-serif font-bold text-[#444] tracking-tight">
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
            <h3 className="text-[18px] font-serif font-bold text-[#444] tracking-wide mb-6">
              Status Timeline
            </h3>

            <div className="relative pl-3 space-y-8 before:absolute before:inset-y-0 before:left-[1.125rem] before:w-[1px] before:bg-gray-300">
              {([
                { label: 'Order Valid' },
                { label: 'Preparing Your Package' },
                { label: 'Out for Delivery' },
                { label: 'Delivered' },
              ] as { label: string }[]).map((step, idx) => {
                const activeIdx = SIDEBAR_STATUS_RANK[order.status] ?? -1;
                const isStepDone = activeIdx >= 0 && idx <= activeIdx;
                const isStepActive = idx === activeIdx;
                return (
                  <div key={idx} className="relative flex items-center gap-4">
                    <div className={`relative z-10 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ring-4 ring-[#fcf9f9] transition-colors ${
                      isStepDone
                        ? 'bg-gray-800 border-gray-800 text-white'
                        : 'bg-[#fcf9f9] border-gray-400 text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[15px] font-serif font-bold transition-colors ${
                      isStepActive ? 'text-[#da2966]' : isStepDone ? 'text-[#444]' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Status notice */}
            {order.status === 'pending' && (
              <p className="text-[12px] text-amber-600 font-semibold mt-4 bg-amber-50 border border-amber-200 rounded-[8px] px-3 py-2">
                ⏳ Awaiting admin confirmation — click &ldquo;Validate Confirmation&rdquo; below to confirm this order.
              </p>
            )}
            {order.status === 'confirmed' && (
              <p className="text-[12px] text-blue-600 font-semibold mt-4 bg-blue-50 border border-blue-200 rounded-[8px] px-3 py-2">
                🕐 Order confirmed. &ldquo;Preparing Your Package&rdquo; will activate automatically after 6 hours.
              </p>
            )}
            {order.status === 'preparing' && (
              <p className="text-[12px] text-purple-600 font-semibold mt-4 bg-purple-50 border border-purple-200 rounded-[8px] px-3 py-2">
                📦 Package is being prepared. &ldquo;Out for Delivery&rdquo; will activate automatically after 3 hours.
              </p>
            )}
            {order.status === 'shipped' && (
              <p className="text-[12px] text-green-600 font-semibold mt-4 bg-green-50 border border-green-200 rounded-[8px] px-3 py-2">
                🚚 Order is out for delivery — click &ldquo;Mark as Delivered&rdquo; below once the customer receives it.
              </p>
            )}
          </div>

          <hr className="border-[#e1ced3] mb-8" />

          {/* Customer Details */}
          <div className="mb-10">
            <h3 className="text-[18px] font-serif font-bold text-[#444] tracking-wide mb-6">
              Customer Details
            </h3>

            <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f5ebed]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center text-[20px] font-serif font-bold uppercase">
                    {order.customer_name
                      ? order.customer_name.substring(0, 2)
                      : '??'}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-serif font-bold text-[#444]">
                      {order.customer_name}
                    </h4>
                    <p className="text-[14px] text-gray-500 mt-0.5">
                      {order.customer_phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#fcf9f9] rounded-[12px] px-4 py-2 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#f5ebed]">
                    <div className="flex items-center gap-2 mb-1 justify-center">
                      <ListTodo size={14} className="text-[#da2966]" />
                      <span className="text-[16px] font-serif font-bold text-[#da2966]">
                        {order.items_count}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Total Items
                    </span>
                  </div>

                  <div className="bg-[#fcf9f9] rounded-[12px] px-4 py-2 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#f5ebed]">
                    <div className="flex items-center gap-2 mb-1 justify-center">
                      <PackageCheck size={14} className="text-[#da2966]" />
                      <span className="text-[16px] font-serif font-bold text-[#da2966]">
                        {order.total} DH
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Total Order
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-[11px] text-[#da2966] font-bold tracking-widest uppercase mb-2">
                  Email Address
                </h5>
                <p className="text-[13px] text-gray-500 tracking-wide uppercase">
                  {order.customer_email}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-[#e1ced3] mb-8" />

          {/* Items Ordered */}
          <div className="mb-12">
            <h3 className="text-[18px] font-serif font-bold text-[#444] tracking-wide mb-6">
              Items Ordered
            </h3>

            <div className="flex">
              <div className="flex-1 border-r-2 border-gray-800 pr-6 mr-6 max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-6">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => {
                    // Get primary image URL from product
                    // Backend provides: image_url (primary) OR images array with is_primary flag
                    const imageUrl = item.product?.image_url || 
                                     item.product?.images?.find(img => img.is_primary)?.url || 
                                     item.product?.images?.[0]?.url || 
                                     null;

                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Product Image */}
                          <div className="relative w-16 h-16 bg-gray-100 rounded-[12px] overflow-hidden flex-shrink-0 border border-gray-200">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.product?.name || 'Product'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image URL fails to load
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-xs">
                              {!imageUrl && 'No Image'}
                            </div>

                            {/* Quantity Badge */}
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-white text-[10px] font-bold z-10 border border-white">
                              {item.quantity}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-serif font-bold text-[#444] truncate">
                              {item.product?.name || `Product #${item.product_id}`}
                            </h4>
                            <p className="text-[12px] text-gray-500 italic font-serif">
                              {item.quantity} × {Number(item.unit_price).toFixed(2)} DH
                            </p>
                          </div>
                        </div>

                        {/* Price — Using line_total from backend (NOT total_price) */}
                        <div className="text-[16px] font-serif font-bold text-[#222] italic flex-shrink-0 pl-4">
                          {Number(item.line_total || 0).toFixed(2)} DH
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[14px] text-gray-400 italic">No items found</p>
                )}
              </div>
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
                  {order.total} DH
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[15px] font-serif font-bold text-[#444]">
                  Expédition
                </span>
                <span className="text-[16px] font-serif font-bold text-[#222] italic">
                  Free
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[15px] font-serif font-bold text-[#444]">
                  Coupon
                </span>
                <span className="text-[16px] font-serif font-bold text-[#222] italic">
                  - 0 DH
                </span>
              </div>

              <hr className="border-[#e1ced3] my-4" />

              <div className="flex items-center justify-between">
                <span className="text-[16px] font-serif font-bold text-[#444]">
                  Total
                </span>
                <span className="text-[18px] font-serif font-bold text-[#222] italic">
                  {order.total} DH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-8 flex gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
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
                  <span className="text-[18px] ml-1">›</span>
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
                  <span className="text-[18px] ml-1">›</span>
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
