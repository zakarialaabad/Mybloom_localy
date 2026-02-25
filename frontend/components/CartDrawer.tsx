'use client';

import { X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [isMounted, setIsMounted] = useState(false);

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
      <div className={`fixed inset-y-0 right-0 z-[101] w-full max-w-[480px] bg-[#f9f9f9] shadow-xl flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-center p-6 relative shrink-0">
          <h2 className="text-xl font-serif font-bold text-gray-800">YOUR CART (3 ITEMS)</h2>
          <button 
            onClick={onClose}
            className="absolute right-6 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Products Container */}
          <div className="bg-white border border-gray-200 rounded-sm mb-8">
            <div className="px-4 py-3 border-b border-gray-200 bg-[#fdfdfd]">
              <h3 className="font-serif font-bold text-gray-700 text-sm">Other Products ( 3 items )</h3>
            </div>
            
            <div className="flex flex-col">
              {/* Item 1 */}
              <div className="p-4 flex gap-4 border-b border-gray-100">
                <div className="relative w-24 h-24 bg-gray-50 shrink-0 border border-gray-100">
                  <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200" alt="Sugar Pop" fill className="object-cover mix-blend-multiply p-2" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-gray-900">SUGAR POP</h4>
                      <p className="font-serif italic text-xs text-gray-400 mt-0.5">Body Butter</p>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold italic text-gray-900">140 DH</div>
                      <div className="font-serif italic text-xs text-gray-400 line-through">200 DH</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-serif">Size 50ml</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-serif">Quantity</span>
                      <div className="flex items-center bg-gray-100 rounded-full px-1 py-0.5">
                        <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">-</button>
                        <span className="w-6 text-center text-xs font-serif italic">1</span>
                        <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">+</button>
                      </div>
                    </div>
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-4 flex gap-4">
                <div className="relative w-24 h-24 bg-gray-50 shrink-0 border border-gray-100">
                  <Image src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200" alt="Over Dose" fill className="object-cover mix-blend-multiply p-2" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-gray-900">OVER DOSE</h4>
                      <p className="font-serif italic text-xs text-gray-400 mt-0.5">Bold Body Mist</p>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold italic text-gray-900">100 DH</div>
                      <div className="font-serif italic text-xs text-gray-400 line-through">180 DH</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 font-serif">Size 50ml</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-serif">Quantity</span>
                      <div className="flex items-center bg-gray-100 rounded-full px-1 py-0.5">
                        <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">-</button>
                        <span className="w-6 text-center text-xs font-serif italic">1</span>
                        <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">+</button>
                      </div>
                    </div>
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-serif font-bold text-gray-800">Your Price</span>
              <span className="font-serif font-bold italic text-gray-900">360 DH</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-serif font-bold text-gray-800">Expédition</div>
                <div className="font-serif italic text-xs text-gray-500 mt-0.5">Gratuit dès 590 DH</div>
              </div>
              <span className="font-serif font-bold italic text-gray-900">30 DH</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-serif font-bold text-gray-800">Coupon</div>
                <div className="font-serif italic text-xs text-gray-500 mt-0.5">Ajoutez un code promo et économisez sur votre commande.</div>
              </div>
              <span className="font-serif font-bold italic text-gray-900">0 DH</span>
            </div>
            
            <hr className="border-gray-200 my-4" />
            
            <div className="flex justify-between items-center">
              <span className="font-serif font-bold text-gray-800">Total</span>
              <span className="font-serif font-bold italic text-xl text-gray-900">390 DH</span>
            </div>
          </div>

          {/* Coupon Input */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 font-serif mb-3">If you have a coupon code, please apply it below</p>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Coupon code" 
                className="flex-1 border-2 border-dashed border-gray-200 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white font-serif"
              />
              <button className="bg-[#4a403a] text-white px-6 py-3 rounded-sm font-serif italic text-sm hover:bg-[#3a322d] transition-colors whitespace-nowrap">
                Apply coupon ›
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/checkout"
              onClick={onClose}
              className="flex-1 bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-base hover:bg-[#3a322d] transition-colors text-center"
            >
              Acheter maintenant ›
            </Link>
            <button className="flex-1 bg-white text-[#4a403a] border border-gray-200 py-4 rounded-sm font-serif italic text-base hover:bg-gray-50 transition-colors">
              Voir le panier
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
