'use client';

import { X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useCartStore from '@/store/cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const items      = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty  = useCartStore((s) => s.updateQty);
  const subtotal   = useCartStore((s) => s.subtotal());
  const itemCount  = useCartStore((s) => s.itemCount());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[101] w-full md:max-w-[480px] bg-[#f9f9f9] shadow-xl flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-center p-6 relative shrink-0 border-b border-gray-100 bg-[#f9f9f9]">
          <button 
            onClick={onClose}
            className="absolute left-6 w-8 h-8 flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 rounded-full transition-colors text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-sm font-serif uppercase tracking-widest font-bold text-gray-800">YOUR CART ({itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'})</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 pt-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {/* Products Container */}
          <div className="mb-6">
            <div className="px-2 pb-3">
              <h3 className="font-serif text-sm text-gray-800">Other Products ( <strong>{itemCount} items</strong> )</h3>
            </div>

            <div className="bg-white border border-gray-100 rounded flex flex-col">
              {items.length === 0 ? (
                <p className="p-6 text-center font-serif italic text-gray-400 text-sm">Your cart is empty.</p>
              ) : items.map((item, idx) => (
                <div key={`${item.productId}-${item.sizeLabel}-${idx}`} className={`p-4 flex gap-4 ${idx < items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="relative w-24 h-24 bg-[#f8f8f8] shrink-0 border border-gray-100/50">
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover mix-blend-multiply p-2" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif tracking-wider uppercase font-bold text-sm text-gray-900">{item.productName}</h4>
                        <p className="font-serif italic text-xs text-gray-500 mt-0.5">Body Mist</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="font-serif font-bold italic text-sm text-gray-900">{item.unitPrice * item.quantity} DH</div>
                        <div className="font-serif italic text-[10px] text-gray-400 line-through mt-0.5">{(item.unitPrice * item.quantity) + 160} DH</div>
                      </div>
                    </div>
                    
                    <div className="text-[11px] text-gray-500 mt-2 font-serif">Size {item.sizeLabel}</div>
                    
                    <div className="flex justify-between items-center mt-3 border-t border-transparent">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-500 font-serif">Quantity</span>
                        <div className="flex items-center border border-gray-200 rounded-full px-2 py-0.5 bg-white space-x-3">
                          <button onClick={() => updateQty(item.productId, item.sizeLabel, item.quantity - 1)} className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">-</button>
                          <span className="text-xs font-serif min-w-[12px] text-center font-medium">{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, item.sizeLabel, item.quantity + 1)} className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.sizeLabel)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4 mb-6 px-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-serif font-bold text-gray-800">Your Price</span>
              <span className="font-serif font-bold italic text-gray-900">{subtotal} DH</span>
            </div>
            
            <div className="flex justify-between items-start text-sm">
              <div>
                <div className="font-serif font-bold text-gray-800">Expédition</div>
                <div className="font-serif italic text-[11px] text-gray-500 mt-0.5">Gratuit dès 590 DH</div>
              </div>
              <span className="font-serif font-bold italic text-gray-900">-- DH</span>
            </div>
            
            <div className="flex justify-between items-start text-sm">
              <div>
                <div className="font-serif font-bold text-gray-800">Coupon</div>
                <div className="font-serif italic text-[11px] text-gray-500 mt-0.5">Ajoutez un code promo et économisez sur votre commande.</div>
              </div>
              <span className="font-serif font-bold italic text-gray-900">0 DH</span>
            </div>

            <hr className="border-gray-200 my-4" />

            <div className="flex justify-between items-center text-base mt-2">
              <span className="font-serif font-bold text-gray-800">Total</span>
              <span className="font-serif font-bold italic text-gray-900">{subtotal} DH</span>
            </div>
          </div>

          {/* Coupon Input */}
          <div className="mb-6 px-2">
            <p className="text-[11px] text-gray-500 font-serif mb-2">If you have a coupon code, please apply it below</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Coupon code" 
                className="flex-1 border border-dashed border-gray-300 rounded px-3 py-2.5 text-xs focus:outline-none focus:border-gray-400 bg-white font-serif"
              />
              <button className="bg-[#4a403a] text-white px-5 py-2.5 rounded font-serif italic text-xs hover:bg-[#3a322d] transition-colors whitespace-nowrap flex items-center gap-1 group">
                Apply coupon <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">›</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-2 pb-4">
            <Link 
              href="/checkout"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1 bg-[#4a403a] text-white py-3.5 rounded font-serif italic text-sm hover:bg-[#3a322d] transition-colors group"
            >
              Acheter maintenant <span className="text-xs group-hover:translate-x-0.5 transition-transform">›</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
