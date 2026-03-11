'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, Info, ArrowLeft, ChevronDown } from 'lucide-react';
import apiClient from '@/services/api';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone,       setPhone]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = orderNumber.trim().replace(/^#/, '');
    if (!trimmed || !phone.trim()) {
      setError('Please enter your Order ID and phone number.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.get(`/v1/orders/${trimmed}/track`, {
        params: { phone: phone.trim() },
      });
      router.push(`/order-status?order=${encodeURIComponent(trimmed)}&phone=${encodeURIComponent(phone.trim())}`);
    } catch {
      setError('Order not found. Please check your Order ID and phone number.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-dvh md:min-h-screen bg-[#fcf9f9] md:bg-white flex flex-col overflow-hidden md:overflow-auto">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Top App Bar */}
      <div className="md:hidden flex items-center justify-center relative px-4 py-3 bg-white">
        <button 
          onClick={() => router.back()} 
          className="absolute left-4 w-[38px] h-[38px] bg-[#f4f4f4] rounded-full flex items-center justify-center transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#3a3a3a]" />
        </button>
        <Image
          src="/logo.jpeg"
          alt="Bloom Parfums"
          width={130}
          height={32}
          className="object-contain h-[26px]"
        />
      </div>

      <main className="flex-1 flex items-center justify-center overflow-hidden px-3 pb-16 md:pb-0 md:block md:max-w-[1400px] md:w-full md:mx-auto md:px-6 lg:px-8 md:py-12">
        <div className="w-full md:flex md:flex-col lg:flex-row gap-0 md:rounded-sm md:overflow-hidden md:border border-gray-100 md:shadow-sm md:flex-1">
          
          {/* Left Column - Desktop Only */}
          <div className="hidden lg:block lg:w-[55%] relative min-h-[500px] lg:min-h-[700px] bg-[#f5f5f5]">
            <Image 
              src="https://images.unsplash.com/photo-1549460298-0524244a2c07?auto=format&fit=crop&q=80&w=1200" 
              alt="Bloom Parfums Delivery Van" 
              fill 
              className="object-cover"
            />
            {/* Logo Overlay on Van */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64 border-8 border-aura-gold/30 rounded-full flex flex-col items-center justify-center bg-white/10 backdrop-blur-[2px]">
                 <span className="text-4xl font-serif font-bold text-aura-gold tracking-tight italic">Bloom</span>
                 <span className="text-3xl font-serif text-aura-gold tracking-widest -mt-2">Parfums</span>
              </div>
            </div>
          </div>

          {/* Right Column - Tracking Form */}
          <div className="lg:w-[45%] px-5 py-5 md:p-20 bg-white w-full rounded-sm shadow-sm md:shadow-none flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              
              {/* Pink Scalloped Truck Icon */}
              <div className="flex justify-center mb-4 md:mb-8">
                <div className="relative w-[70px] h-[70px] md:w-[90px] md:h-[90px] flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full text-[#fdefed] fill-current">
                    <path d="M 100, 10 A 20,20 0 0,1 120,30 A 20,20 0 0,0 145,45 A 20,20 0 0,1 160,70 A 20,20 0 0,0 170,95 A 20,20 0 0,1 170,125 A 20,20 0 0,0 160,150 A 20,20 0 0,1 145,175 A 20,20 0 0,0 120,190 A 20,20 0 0,1 100,210 A 20,20 0 0,1 80,190 A 20,20 0 0,0 55,175 A 20,20 0 0,1 40,150 A 20,20 0 0,0 30,125 A 20,20 0 0,1 30,95 A 20,20 0 0,0 40,70 A 20,20 0 0,1 55,45 A 20,20 0 0,0 80,30 A 20,20 0 0,1 100,10 z" />
                  </svg>
                  <div className="relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#da2966]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM17 12V9.5h2.5l1.97 2.5H17z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Headings */}
              <div className="text-center mb-5 md:mb-10">
                <h1 className="text-[18px] md:text-2xl font-serif font-bold text-[#3a3a3a] mb-1 tracking-wide">TRACK YOUR ORDER</h1>
                <p className="text-[#888] font-serif text-[11px] md:text-xs leading-snug px-4">
                  Enter your order details below to check the status of your delivery
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4 md:space-y-8" onSubmit={handleSubmit}>
                {/* Order ID Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-wider font-serif uppercase">ORDER ID</label>
                  <div className="relative border-b border-gray-200 pb-[6px] focus-within:border-gray-400 transition-colors flex items-center gap-2.5">
                    <Package className="w-5 h-5 text-[#4a4a4a] mb-0.5" />
                    <div className="w-[1px] h-[18px] bg-gray-300"></div>
                    <input 
                      type="text" 
                      placeholder="e.g. #ORD-89302"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      required
                      className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-serif text-gray-700 placeholder:text-[#b8b8b8]"
                    />
                  </div>
                  <div className="flex items-start gap-1.5 mt-1.5">
                     <svg className="w-[10px] h-[10px] text-[#555] mt-[2px] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                     <p className="text-[9px] text-[#777] font-serif leading-tight">
                       Our support team will send you your Order ID when your order is confirmed.
                     </p>
                  </div>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-wider font-serif uppercase">PHONE NUMBER</label>
                  <div className="relative border-b border-gray-200 pb-[6px] focus-within:border-gray-400 transition-colors flex items-center gap-2">
                    <div className="flex items-center gap-1 shrink-0 text-[#4a4a4a] cursor-pointer">
                      <span className="text-[15px] font-serif">MAR</span>
                      <ChevronDown className="w-4 h-4 text-[#4a4a4a]" strokeWidth={2.5} />
                    </div>
                    <div className="w-[1px] h-[18px] bg-gray-300 ml-1"></div>
                    <input 
                      type="tel" 
                      placeholder="+212 6 00 00 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-serif text-gray-700 placeholder:text-[#b8b8b8] pl-1"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-serif text-center">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full text-center bg-[#4b3d37] text-white py-[12px] md:py-[15px] mt-2 md:mt-6 rounded-[5px] font-serif italic text-[14px] md:text-[15px] hover:bg-[#382d29] transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Searching…' : 'Track Order ›'}
                </button>
              </form>

              {/* Footer Link */}
              <div className="text-center mt-5 md:mt-12 text-xs font-serif text-gray-500">
                Need assistance ? {' '}
                <Link href="#" className="text-[#da2966] underline decoration-[#da2966] hover:text-[#b1184e] transition-colors underline-offset-[3px]">
                  Contact Support
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
      
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}