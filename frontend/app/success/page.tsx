'use client';

import { Headphones, ArrowLeft, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function OrderSuccessPage() {
  const router = useRouter();
  const params  = useSearchParams();
  const order   = params.get('order')  ?? '';
  const total   = params.get('total')  ?? '';
  const name    = params.get('name')   ?? '';
  const phone   = params.get('phone')  ?? '';
  const city    = params.get('city')   ?? 'MAROC';

  return (
    <>
      <div className="hidden md:block">
        <Header />
      </div>
      
      {/* ━━━ MOBILE HEADER ━━━ */}
      <div className="md:hidden flex items-center justify-center relative px-4 py-4 bg-white shrink-0">
        <button onClick={() => router.back()} className="absolute left-4 w-10 h-10 bg-[#f3f3f3] rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-serif italic text-2xl font-bold tracking-wide text-gray-800">
          My<span style={{ color: '#da2966' }}>B</span>loom
        </span>
      </div>

      <main className="min-h-screen bg-[#fff9f9] md:bg-[#f9f9f9] font-serif">
        <div className="max-w-7xl mx-auto md:px-6 lg:px-8 md:py-12 flex flex-col items-center justify-center h-full">
          <div className="w-full md:flex md:flex-row md:bg-white md:shadow-sm md:rounded-sm md:overflow-hidden">
            
            {/* Left Column - Image (Desktop Only) */}
            <div className="hidden md:block md:w-1/2 relative min-h-[600px] bg-[#f4ece3]">
              <Image 
                src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&q=80&w=1000" 
                alt="Order Packaging" 
                fill 
                className="object-cover"
              />
              {/* Simulated Shipping Label Overlay */}
              <div className="absolute bottom-12 left-12 bg-white/90 backdrop-blur-sm p-4 rounded-sm shadow-lg border border-gray-200 max-w-[240px] transform -rotate-2">
                <div className="text-[10px] text-gray-500 font-mono mb-1">TO: MyBloom Client</div>
                <div className="text-sm font-bold text-gray-800 font-mono mb-2">{city.toUpperCase()}, MAROC</div>
                <div className="w-full h-8 bg-[url('https://www.freepnglogos.com/uploads/barcode-png/barcode-laser-code-vector-graphic-pixabay-3.png')] bg-contain bg-no-repeat bg-center opacity-70"></div>
              </div>
            </div>

            {/* Right Column - Order Details */}
            <div className="w-full md:w-1/2 p-4 md:p-16 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full bg-white md:bg-transparent shadow-sm md:shadow-none rounded-xl md:rounded-none p-6 md:p-0 my-4 md:my-0">
                
                {/* Success Icon */}
                <div className="relative w-16 h-16 mx-auto mb-5">
                   {/* Pink Scalloped Badge Background */}
                   <svg className="w-full h-full text-[#ffebee] drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 4.5L18 3.5L19 6.8L22 8.5L21 12L22 15.5L19 17.2L18 20.5L14.5 19.5L12 22L9.5 19.5L6 20.5L5 17.2L2 15.5L3 12L2 8.5L5 6.8L6 3.5L9.5 4.5L12 2Z" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-9 bg-[#da2966] rounded-full flex items-center justify-center shadow-sm">
                        <Check className="w-5 h-5 text-white stroke-[3px]" />
                      </div>
                   </div>
                </div>

                {/* Headings */}
                <div className="text-center mb-8">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-wide uppercase">ORDER RECEIVED</h1>
                  <p className="text-gray-500 text-[13px] md:text-sm leading-relaxed">
                    Thank you for your purchase. Your fragrance<br />journey begins now.
                  </p>
                </div>

                {/* Order Info Table */}
                <div className="space-y-5 border-t border-gray-50 py-6 mb-2">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-400 tracking-wider uppercase">ORDER ID</span>
                    <span className="font-bold text-gray-900">#{order || 'LX-8921-Q'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-400 tracking-wider uppercase">DATE</span>
                    <span className="font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-start text-[13px]">
                    <span className="text-gray-400 tracking-wider uppercase mt-1">DELIVERY TO</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{name || 'Client Name'}</div>
                      <div className="text-gray-500 mt-1 max-w-[180px] leading-relaxed text-[11px]">{city ? `N° 10, Rue XYZ, Appt 3\n${city}, MAROC` : 'Casablanca, MAROC'}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[13px] pt-4 mt-2">
                    <span className="font-bold text-gray-900 tracking-wider uppercase">TOTAL AMOUNT</span>
                    <span className="font-bold text-gray-900 text-lg">{total ? `${Number(total).toFixed(2)} DH` : '720.00 DH'}</span>
                  </div>
                </div>

                {/* Confirmation Call Box */}
                <div className="bg-[#fff5f7] rounded-lg p-5 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="w-4 h-4 text-[#da2966]" />
                    <span className="text-[#da2966] font-bold text-[10px] tracking-widest uppercase">CONFIRMATION CALL</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Our concierge will contact you shortly at <strong className="text-gray-800">{phone || '+212 6 XX XX XX XX'}</strong> to confirm your delivery preferences
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <Link 
                    href="/" 
                    className="flex-1 bg-[#4b3d37] text-white py-3.5 rounded-[4px] italic text-[13px] hover:bg-[#3a322d] transition-colors text-center shadow-md font-bold"
                  >
                    Buy It Now ›
                  </Link>
                  <Link
                    href={`/order-status?order=${encodeURIComponent(order)}&phone=${encodeURIComponent(phone)}`}
                    className="flex-1 bg-white text-[#4a403a] border border-gray-200 py-3.5 rounded-[4px] italic text-[13px] hover:bg-gray-50 transition-colors text-center font-bold shadow-sm"
                  >
                    Track My Order
                  </Link>
                </div>
                {/* Support Link */}
                <div className="text-center text-[11px] text-gray-400">
                  Need assistance ? <Link href="#" className="text-[#da2966] underline decoration-[#da2966] underline-offset-2 hover:text-[#b82256] transition-colors">Contact Support</Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}