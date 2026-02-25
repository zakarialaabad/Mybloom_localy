import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Headphones } from 'lucide-react';

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f9f9f9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-0 bg-white shadow-sm rounded-sm overflow-hidden">
            
            {/* Left Column - Image */}
            <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-[600px] bg-[#f4ece3]">
              <Image 
                src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&q=80&w=1000" 
                alt="Order Packaging" 
                fill 
                className="object-cover"
              />
              {/* Simulated Shipping Label Overlay */}
              <div className="absolute bottom-12 left-12 bg-white/90 backdrop-blur-sm p-4 rounded-sm shadow-lg border border-gray-200 max-w-[240px] transform -rotate-2">
                <div className="text-[10px] text-gray-500 font-mono mb-1">TO: MyBloom Client</div>
                <div className="text-sm font-bold text-gray-800 font-mono mb-2">LAAYOUNE, MAROC</div>
                <div className="w-full h-8 bg-[url('https://www.freepnglogos.com/uploads/barcode-png/barcode-laser-code-vector-graphic-pixabay-3.png')] bg-contain bg-no-repeat bg-center opacity-70"></div>
              </div>
            </div>

            {/* Right Column - Order Details */}
            <div className="lg:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
              <div className="max-w-md mx-auto w-full">
                
                {/* Success Icon */}
                <div className="w-16 h-16 bg-[#fdf8f1] rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 bg-[#e8c99b] rounded-full flex items-center justify-center text-white shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Headings */}
                <div className="text-center mb-10">
                  <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3 tracking-wide">ORDER RECEIVED</h1>
                  <p className="text-gray-500 font-serif text-sm leading-relaxed">
                    Thank you for your purchase. Your fragrance<br />journey begins now.
                  </p>
                </div>

                {/* Order Info Table */}
                <div className="space-y-6 border-t border-b border-gray-100 py-6 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-serif text-xs tracking-wider">ORDER ID</span>
                    <span className="font-bold text-gray-900 font-serif">#LX-8921-Q</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-serif text-xs tracking-wider">DATE</span>
                    <span className="font-bold text-gray-900 font-serif">October 24, 2026</span>
                  </div>
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-gray-400 font-serif text-xs tracking-wider mt-1">DELIVERY TO</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 font-serif">Ayoub LAGHZAL</div>
                      <div className="text-gray-500 font-serif text-xs mt-1 max-w-[180px] leading-relaxed">
                        N° 10, Rue XYZ, Appt 3 Hay Hassani 20230, CASABLANCA MAROC
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100">
                    <span className="font-bold text-gray-900 font-serif text-xs tracking-wider">TOTAL AMOUNT</span>
                    <span className="font-bold text-gray-900 font-serif text-base">720.00 DH</span>
                  </div>
                </div>

                {/* Confirmation Call Box */}
                <div className="bg-[#fdfbf5] rounded-sm p-5 mb-8 border border-[#f5eedf]">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="w-4 h-4 text-[#cda873]" />
                    <span className="text-[#cda873] font-serif font-bold text-[10px] tracking-widest uppercase">Confirmation Call</span>
                  </div>
                  <p className="text-gray-500 text-xs font-serif leading-relaxed">
                    Our concierge will contact you shortly at <strong className="text-gray-800">+ 212 6 11 95 50 60</strong> to confirm your delivery preferences
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link 
                    href="/" 
                    className="flex-1 bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-sm hover:bg-[#3a322d] transition-colors text-center"
                  >
                    Continue Shopping ›
                  </Link>
                  <Link 
                    href="/track-order"
                    className="flex-1 bg-white text-[#4a403a] border border-gray-200 py-4 rounded-sm font-serif italic text-sm hover:bg-gray-50 transition-colors text-center"
                  >
                    Track My Order
                  </Link>
                </div>
                {/* Support Link */}
                <div className="text-center text-xs font-serif text-gray-500">
                  Need assistance? <Link href="#" className="text-[#cda873] underline hover:text-[#b89b72] transition-colors">Contact Support</Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}