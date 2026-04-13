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
      setError('Veuillez entrer votre numéro de commande et votre numéro de téléphone.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.get(`/v1/orders/${trimmed}/track`, {
        params: { phone: phone.trim() },
      });
      router.push(`/order-status?order=${encodeURIComponent(trimmed)}&phone=${encodeURIComponent(phone.trim())}`);
    } catch {
      setError('Commande non trouvée. Veuillez vérifier votre numéro de commande et votre numéro de téléphone.');
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
          src="/logo.png"
          alt="MyBloom"
          width={130}
          height={32}
          className="object-contain h-[26px]"
        />
      </div>

      <main className="flex-1 flex items-center justify-center overflow-hidden md:overflow-visible px-3 pb-16 md:pb-0 md:px-0 md:py-0" style={{backgroundColor: 'rgba(252, 138, 138, 0.08)'}}>
        <div className="w-full md:flex md:flex-col lg:flex-row gap-0 md:rounded-none md:overflow-hidden md:border-none border-gray-100 md:shadow-none md:min-h-screen">
          
          {/* Left Column - Desktop Only */}
          <div className="hidden lg:block lg:w-1/2 relative min-h-[500px] lg:min-h-screen bg-[#f5f5f5]">
            <Image 
              src="/public_Image/bloomDelivere.jpg" 
              alt="Bloom Parfums Delivery Van" 
              fill 
              className="object-cover"
            />
            {/* Logo Overlay on Van — removed, image stands alone */}
          </div>

          {/* Right Column - Tracking Form */}
          <div className="lg:w-1/2 px-5 py-5 md:px-8 lg:px-12 bg-transparent w-full rounded-sm shadow-sm md:shadow-none md:rounded-none flex flex-col justify-center items-center">
            <div className="md:max-w-md lg:max-w-[480px] w-full md:bg-white md:shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:rounded-lg p-2 md:p-10 lg:p-12">
              
              {/* Pink Scalloped Truck Icon */}
              <div className="flex justify-center mb-4 md:mb-8">
                <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full text-[#fdefed] fill-current">
                    <path d="M 100.00,4.00 C 110.00,4.00 115.00,12.00 120.00,15.00 C 126.00,18.00 135.00,15.00 142.00,20.00 C 148.00,24.00 148.00,32.00 152.00,38.00 C 158.00,44.00 166.00,44.00 170.00,52.00 C 174.00,58.00 170.00,68.00 174.00,74.00 C 180.00,81.00 185.00,88.00 185.00,95.00 C 185.00,105.00 178.00,111.00 175.00,119.00 C 172.00,125.00 176.00,132.00 172.00,138.00 C 168.00,145.00 159.00,144.00 152.00,150.00 C 146.00,156.00 146.00,165.00 139.00,170.00 C 132.00,174.00 124.00,170.00 117.00,175.00 C 111.00,180.00 106.00,188.00 100.00,188.00 C 94.00,188.00 89.00,180.00 83.00,175.00 C 76.00,170.00 68.00,174.00 61.00,170.00 C 54.00,165.00 54.00,156.00 48.00,150.00 C 41.00,144.00 32.00,145.00 28.00,138.00 C 24.00,132.00 28.00,125.00 25.00,119.00 C 22.00,111.00 15.00,105.00 15.00,95.00 C 15.00,88.00 20.00,81.00 26.00,74.00 C 30.00,68.00 26.00,58.00 30.00,52.00 C 34.00,44.00 42.00,44.00 48.00,38.00 C 52.00,32.00 52.00,24.00 58.00,20.00 C 65.00,15.00 74.00,18.00 80.00,15.00 C 85.00,12.00 90.00,4.00 100.00,4.00 Z" />
                  </svg>
                  <div className="relative z-10 w-[50px] h-[50px] md:w-[64px] md:h-[64px] bg-white rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-7 h-7 md:w-9 md:h-9 text-[#da2966]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM17 12V9.5h2.5l1.97 2.5H17z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Headings */}
              <div className="text-center mb-5 md:mb-10">
                <h1 className="text-[18px] md:text-2xl font-serif font-bold text-[#3a3a3a] mb-1 tracking-wide">SUIVRE VOTRE COMMANDE</h1>
                <p className="text-[#888] font-serif text-[11px] md:text-xs leading-snug px-4">
                  Entrez vos détails de commande ci-dessous pour vérifier le statut de votre livraison
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4 md:space-y-8" onSubmit={handleSubmit}>
                {/* Order ID Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-wider font-serif uppercase">NUMÉRO DE COMMANDE</label>
                  <div className="relative border-b border-gray-200 pb-[6px] focus-within:border-gray-400 transition-colors flex items-center gap-2.5">
                    <Package className="w-5 h-5 text-[#4a4a4a] mb-0.5" />
                    <div className="w-[1px] h-[18px] bg-gray-300"></div>
                    <input 
                      type="text" 
                      placeholder="ex. #ORD-89302"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      required
                      className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-serif text-gray-700 placeholder:text-[#b8b8b8]"
                    />
                  </div>
                  <div className="flex items-start gap-1.5 mt-1.5">
                     <svg className="w-[10px] h-[10px] text-[#555] mt-[2px] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                     <p className="text-[9px] text-[#777] font-serif leading-tight">
                       Notre équipe d'assistance vous enverra votre numéro de commande lorsque votre commande sera confirmée.
                     </p>
                  </div>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-2 tracking-wider font-serif uppercase">NUMÉRO DE TÉLÉPHONE</label>
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
                  {loading ? 'Recherche…' : 'Suivre commande ›'}
                </button>
              </form>

              {/* Footer Link */}
              <div className="text-center mt-5 md:mt-12 text-xs font-serif text-gray-500">
                Besoin d'aide ? {' '}
                <Link href="#" className="text-[#da2966] underline decoration-[#da2966] hover:text-[#b1184e] transition-colors underline-offset-[3px]">
                  Contacter le support
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