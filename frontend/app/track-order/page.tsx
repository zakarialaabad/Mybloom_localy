import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, Info } from 'lucide-react';

export default function TrackOrderPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-0 rounded-sm overflow-hidden border border-gray-100 shadow-sm">
            
            {/* Left Column - Image with Van */}
            <div className="lg:w-[55%] relative min-h-[500px] lg:min-h-[700px] bg-[#f5f5f5]">
              <Image 
                src="https://images.unsplash.com/photo-1549460298-0524244a2c07?auto=format&fit=crop&q=80&w=1200" 
                alt="Bloom Parfums Delivery Van" 
                fill 
                className="object-cover"
              />
              {/* Logo Overlay on Van (Conceptual) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-64 border-8 border-aura-gold/30 rounded-full flex flex-col items-center justify-center bg-white/10 backdrop-blur-[2px]">
                   <span className="text-4xl font-serif font-bold text-aura-gold tracking-tight italic">Bloom</span>
                   <span className="text-3xl font-serif text-aura-gold tracking-widest -mt-2">Parfums</span>
                </div>
              </div>
            </div>

            {/* Right Column - Tracking Form */}
            <div className="lg:w-[45%] p-8 md:p-20 flex flex-col justify-center bg-white">
              <div className="max-w-md mx-auto w-full">
                
                {/* Truck Icon Icon */}
                <div className="w-16 h-16 bg-[#fdf8f1] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#f5eedf]">
                  <div className="w-10 h-10 bg-[#e8c99b] rounded-full flex items-center justify-center text-white shadow-sm">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM17 12V9.5h2.5l1.97 2.5H17z" />
                    </svg>
                  </div>
                </div>

                {/* Headings */}
                <div className="text-center mb-12">
                  <h1 className="text-2xl font-serif font-bold text-gray-800 mb-4 tracking-wide">TRACK YOUR ORDER</h1>
                  <p className="text-gray-400 font-serif text-sm leading-relaxed px-4">
                    Enter your order details below to check the status of your delivery
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-8">
                  {/* Order ID Field */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-3 tracking-[0.2em] font-serif uppercase">Order ID</label>
                    <div className="relative border-b border-gray-200 pb-2 focus-within:border-aura-gold transition-colors flex items-center gap-3">
                      <Package className="w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. #ORD-89302" 
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm font-serif italic text-gray-700 placeholder:text-gray-200"
                      />
                    </div>
                    <div className="flex items-start gap-2 mt-3">
                       <Info className="w-3.5 h-3.5 text-gray-300 mt-0.5" />
                       <p className="text-[10px] text-gray-300 font-serif leading-relaxed italic">
                         Our support team will send you your Order ID when your order is confirmed.
                       </p>
                    </div>
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-3 tracking-[0.2em] font-serif uppercase">Phone Number</label>
                    <div className="relative border-b border-gray-200 pb-2 focus-within:border-aura-gold transition-colors flex items-center">
                      <div className="flex items-center gap-1 pr-3 border-r border-gray-100 mr-3 pointer-events-none">
                        <span className="text-xs font-serif text-gray-600">MAR</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <input 
                        type="tel" 
                        placeholder="+212 6 00 00 00 00" 
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm font-serif italic text-gray-700 placeholder:text-gray-200"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Link 
                    href="/order-status"
                    className="block w-full text-center bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-base hover:bg-[#3a322d] transition-transform active:scale-[0.98] shadow-lg shadow-gray-200 mt-4"
                  >
                    Track Order ›
                  </Link>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-10 text-xs font-serif text-gray-400">
                  Need assistance? <Link href="#" className="text-aura-gold underline hover:text-[#b89b72] transition-colors decoration-aura-gold/30 underline-offset-4">Contact Support</Link>
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