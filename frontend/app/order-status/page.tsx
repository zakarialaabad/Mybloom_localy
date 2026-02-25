import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheckCircle2 } from 'lucide-react';

export default function OrderStatusPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-400 mb-8 font-serif">
            <Link href="/" className="hover:text-gray-800">Home</Link> / <Link href="/cart" className="hover:text-gray-800">Panier</Link> / <Link href="/checkout" className="hover:text-gray-800">Shipping</Link> / <span className="text-gray-800">Order</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column - Order Status */}
            <div className="flex-1 lg:w-[60%]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-gray-500 font-serif text-sm mb-2 uppercase tracking-wider">ORDER #LX-8921-Q</p>
                  <h1 className="text-4xl font-serif text-gray-800">Package Delivered</h1>
                </div>
                <div className="w-12 h-12 bg-[#fdf8f1] rounded-full flex items-center justify-center border border-[#f5eedf]">
                  <svg className="w-6 h-6 text-[#e8c99b]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM17 12V9.5h2.5l1.97 2.5H17z" />
                  </svg>
                </div>
              </div>

              {/* Success Banner */}
              <div className="bg-[#fdfbf5] rounded-sm p-6 mb-12 border border-[#f5eedf] flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-[#cda873] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[#cda873] font-serif font-bold text-lg mb-1">Successfully Delivered</h3>
                  <p className="text-gray-500 text-sm font-serif leading-relaxed">
                    Your order has been delivered safely by our courier and is now in your hands. We hope your new scent brings you joy and satisfaction. Thank you for trusting us with your order.
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-4 mb-12">
                {/* Step 1 */}
                <div className="relative flex gap-6 mb-0">
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 bg-[#4a403a] rounded-full flex items-center justify-center text-white text-xs font-serif z-10 shrink-0">1</div>
                    <div className="w-[2px] h-12 bg-[#4a403a] mt-1 mb-1"></div>
                  </div>
                  <div className="pt-1 pb-8">
                    <h4 className="font-serif font-bold text-[#4a403a] text-lg">Order Valid</h4>
                    <p className="text-gray-400 font-serif text-sm mt-1">October 22, 10:30 AM</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex gap-6 mb-0">
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 bg-[#4a403a] rounded-full flex items-center justify-center text-white text-xs font-serif z-10 shrink-0">2</div>
                    <div className="w-[2px] h-12 bg-[#4a403a] mt-1 mb-1"></div>
                  </div>
                  <div className="pt-1 pb-8">
                    <h4 className="font-serif font-bold text-[#4a403a] text-lg">Order are dispatched</h4>
                    <p className="text-gray-400 font-serif text-sm mt-1">October 23, 12:30 PM</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex gap-6 mb-0">
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 bg-[#4a403a] rounded-full flex items-center justify-center text-white text-xs font-serif z-10 shrink-0">3</div>
                    <div className="w-[2px] h-12 bg-[#4a403a] mt-1 mb-1"></div>
                  </div>
                  <div className="pt-1 pb-8">
                    <h4 className="font-serif font-bold text-[#4a403a] text-lg">Shipped via Livreur</h4>
                    <p className="text-gray-400 font-serif text-sm mt-1">October 23, 17:30 PM</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex gap-6">
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 bg-[#4a403a] rounded-full flex items-center justify-center text-white text-xs font-serif z-10 shrink-0">4</div>
                  </div>
                  <div className="pt-1">
                    <h4 className="font-serif font-bold text-[#b89b72] text-lg">Delivered</h4>
                    <p className="text-gray-400 font-serif text-sm mt-1">October 25, 18:00 PM . Casablanca</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/feedback"
                  className="flex-1 bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-base hover:bg-[#3a322d] transition-colors text-center"
                >
                  Leave a Review ›
                </Link>
                <button className="flex-1 bg-white text-[#4a403a] border border-gray-200 py-4 rounded-sm font-serif italic text-base hover:bg-gray-50 transition-colors">
                  Need Help ?
                </button>
              </div>
            </div>

            {/* Right Column - Shipment Contents */}
            <div className="lg:w-[40%] bg-[#fcfcfc] p-8 border border-gray-100 rounded-sm h-fit">
              <h2 className="text-lg font-serif font-bold text-gray-800 mb-8">Shipment Contents</h2>

              {/* Cart Items */}
              <div className="space-y-6 mb-8">
                {/* Item 1 */}
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-sm shrink-0 border border-gray-200">
                    <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200" alt="Sugar Pop" fill className="object-cover mix-blend-multiply p-2" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-[10px] flex items-center justify-center rounded-full font-serif">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-gray-900 text-sm">SUGAR POP</h4>
                    <p className="font-serif italic text-xs text-gray-400 mt-0.5">Body Butter / Size 50ml</p>
                  </div>
                  <div className="font-serif font-bold italic text-gray-900 text-sm">140 DH</div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-sm shrink-0 border border-gray-200">
                    <Image src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200" alt="Over Dose" fill className="object-cover mix-blend-multiply p-2" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-[10px] flex items-center justify-center rounded-full font-serif">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-gray-900 text-sm">OVER DOSE</h4>
                    <p className="font-serif italic text-xs text-gray-400 mt-0.5">Bold Body Mist / Size 50ml</p>
                  </div>
                  <div className="font-serif font-bold italic text-gray-900 text-sm">340 DH</div>
                </div>
                
                {/* Item 3 */}
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-sm shrink-0 border border-gray-200">
                    <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200" alt="Sugar Pop" fill className="object-cover mix-blend-multiply p-2" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-[10px] flex items-center justify-center rounded-full font-serif">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-gray-900 text-sm">SUGAR POP</h4>
                    <p className="font-serif italic text-xs text-gray-400 mt-0.5">Body Butter / Size 50ml</p>
                  </div>
                  <div className="font-serif font-bold italic text-gray-900 text-sm">180 DH</div>
                </div>

                {/* Item 4 */}
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-sm shrink-0 border border-gray-200">
                    <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200" alt="Sugar Pop" fill className="object-cover mix-blend-multiply p-2" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-[10px] flex items-center justify-center rounded-full font-serif">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-gray-900 text-sm">SUGAR POP</h4>
                    <p className="font-serif italic text-xs text-gray-400 mt-0.5">Body Butter / Size 50ml</p>
                  </div>
                  <div className="font-serif font-bold italic text-gray-900 text-sm">80 DH</div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-gray-800 text-sm">Your Price</span>
                  <span className="font-serif font-bold italic text-gray-900">760 DH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-gray-800 text-sm">Expédition</span>
                  <span className="font-serif font-bold italic text-gray-900">Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-gray-800 text-sm">Coupon</span>
                  <span className="font-serif font-bold italic text-gray-900">- 40 DH</span>
                </div>
                
                <hr className="border-gray-200 my-4" />
                
                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-gray-800">Total</span>
                  <span className="font-serif font-bold italic text-xl text-gray-900">720 DH</span>
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