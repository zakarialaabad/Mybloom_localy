'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, ArrowLeft, Phone } from 'lucide-react';
import apiClient from '@/services/api';

const HEADER_H     = 80;
const BOTTOM_NAV_H = 60;

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
    let phoneNumber = phone.trim();

    if (phoneNumber && !phoneNumber.startsWith('+212')) {
      phoneNumber = '+212' + phoneNumber.replace(/^0/, '');
    }

    if (!trimmed || !phoneNumber) {
      setError('Veuillez entrer votre numéro de commande et votre numéro de téléphone.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.get(`/v1/orders/${trimmed}/track`, {
        params: { phone: phoneNumber },
      });
      router.push(`/order-status?order=${encodeURIComponent(trimmed)}&phone=${encodeURIComponent(phoneNumber)}`);
    } catch {
      setError('Commande non trouvée. Veuillez vérifier votre numéro de commande et votre numéro de téléphone.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-white md:min-h-screen">

      {/* ─── Desktop Header ─── */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* ─── Mobile Header (fixed) ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white h-[80px] border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="absolute left-[32.3px] w-[38px] h-[38px] bg-[#f4f4f4] rounded-full flex items-center justify-center transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#3a3a3a]" />
        </button>
        <Image
          src="/logo.png"
          alt="MyBloom"
          width={95}
          height={29}
          className="object-contain w-[95px] h-[29px]"
        />
      </div>

      {/* Spacer header */}
      <div className="md:hidden shrink-0" style={{ height: HEADER_H }} />

      <main
        className="flex items-center justify-center px-[32.3px] md:px-0 md:flex-1"
        style={{
          backgroundColor: 'rgba(252, 138, 138, 0.08)',
          height: `calc(100dvh - ${HEADER_H}px - ${BOTTOM_NAV_H}px)`,
        }}
      >
        <div className="w-full bg-white rounded-xl shadow-md md:bg-transparent md:rounded-none md:shadow-none md:max-w-none md:flex md:flex-col lg:flex-row gap-0 overflow-hidden lg:min-h-screen">

          {/* Left Column - Desktop Only */}
          <div className="hidden lg:block lg:w-1/2 relative min-h-[500px] lg:min-h-screen bg-[#f5f5f5]">
            <Image
              src="/public_Image/bloomDelivere.jpg"
              alt="Bloom Parfums Delivery Van"
              fill
              className="object-cover"
            />
          </div>

          {/* Right Column - Tracking Form */}
          <div className="lg:w-1/2 px-[28.4px] py-[51.2px] md:px-8 lg:px-12 w-full flex-1 flex flex-col justify-center items-center">
            <div className="md:max-w-md lg:max-w-[480px] w-full md:bg-white md:shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:rounded-lg p-0 md:p-10 lg:p-12">

              {/* ─── Pink Scalloped Truck Icon ─── */}
              <div className="flex justify-center mb-[30px]">
                <div className="relative w-[68px] h-[68px] md:w-[80px] md:h-[80px]">

                  {/*
                    FIX CENTRAGE :
                    Le path SVG occupe réellement X: 15→185, Y: 4→188
                    → centre visuel de la forme : X=100, Y=96
                    → avec viewBox="0 0 200 200", le centre du SVG est X=100, Y=100
                    → décalage de 4px vers le bas du cercle blanc par rapport au badge.

                    Solution : recadrer le viewBox sur les bornes exactes de la forme
                    viewBox="15 4 170 184"  (x_min y_min largeur hauteur)
                    → maintenant le centre géométrique du SVG = centre visuel du badge ✓
                  -->*/}
                  <svg
                    viewBox="15 4 170 184"
                    className="absolute inset-0 w-full h-full text-[#fdefed] fill-current"
                  >
                    <path d="M 100.00,4.00 C 110.00,4.00 115.00,12.00 120.00,15.00 C 126.00,18.00 135.00,15.00 142.00,20.00 C 148.00,24.00 148.00,32.00 152.00,38.00 C 158.00,44.00 166.00,44.00 170.00,52.00 C 174.00,58.00 170.00,68.00 174.00,74.00 C 180.00,81.00 185.00,88.00 185.00,95.00 C 185.00,105.00 178.00,111.00 175.00,119.00 C 172.00,125.00 176.00,132.00 172.00,138.00 C 168.00,145.00 159.00,144.00 152.00,150.00 C 146.00,156.00 146.00,165.00 139.00,170.00 C 132.00,174.00 124.00,170.00 117.00,175.00 C 111.00,180.00 106.00,188.00 100.00,188.00 C 94.00,188.00 89.00,180.00 83.00,175.00 C 76.00,170.00 68.00,174.00 61.00,170.00 C 54.00,165.00 54.00,156.00 48.00,150.00 C 41.00,144.00 32.00,145.00 28.00,138.00 C 24.00,132.00 28.00,125.00 25.00,119.00 C 22.00,111.00 15.00,105.00 15.00,95.00 C 15.00,88.00 20.00,81.00 26.00,74.00 C 30.00,68.00 26.00,58.00 30.00,52.00 C 34.00,44.00 42.00,44.00 48.00,38.00 C 52.00,32.00 52.00,24.00 58.00,20.00 C 65.00,15.00 74.00,18.00 80.00,15.00 C 85.00,12.00 90.00,4.00 100.00,4.00 Z" />
                  </svg>

                  {/* Cercle blanc + icône — centré en absolu sur le badge */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[42px] h-[42px] md:w-[50px] md:h-[50px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                      <svg
                        style={{ width: '26px', height: '22px' }}
                        className="text-[#da2966]"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM17 12V9.5h2.5l1.97 2.5H17z" />
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

              {/* Headings */}
              <div className="text-center mb-[50px] md:mb-10">
                <h1 className="text-[17px] md:text-2xl font-serif font-bold text-[#3a3a3a] mb-[14px] tracking-wide leading-tight">
                  SUIVRE<br />VOTRE COMMANDE
                </h1>
                <p className="text-[#888] font-serif text-[10px] md:text-xs leading-snug px-4">
                  Entrez vos détails de commande ci-dessous pour vérifier le statut de votre livraison
                </p>
              </div>

              {/* Form */}
              <form className="space-y-[45px] md:space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-[35px] md:space-y-8">

                  {/* Order ID Field */}
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 mb-1 tracking-wider font-serif uppercase">
                      NUMÉRO DE COMMANDE
                    </label>
                    <div className="relative border-b border-gray-200 pb-[4px] focus-within:border-gray-400 transition-colors flex items-center gap-2.5">
                      <Package className="w-4 h-4 md:w-5 md:h-5 text-[#4a4a4a] mb-0.5" />
                      <div className="w-[1px] h-[14px] bg-gray-300"></div>
                      <input
                        type="text"
                        placeholder="ex. #ORD-89302"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        required
                        className="flex-1 bg-transparent border-none focus:outline-none text-[13px] md:text-[15px] font-serif text-gray-700 placeholder:text-[#b8b8b8]"
                      />
                    </div>
                    <div className="flex items-start gap-1 mt-1">
                      <svg className="w-[8px] h-[8px] md:w-[10px] md:h-[10px] text-[#555] mt-[2px] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                      <p className="text-[8px] md:text-[9px] text-[#777] font-serif leading-tight">
                        Notre équipe d'assistance vous enverra votre numéro de commande lorsque votre commande sera confirmée.
                      </p>
                    </div>
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 mb-1 tracking-wider font-serif uppercase">
                      NUMÉRO DE TÉLÉPHONE
                    </label>
                    <div className="relative border-b border-gray-200 pb-[4px] focus-within:border-gray-400 transition-colors flex items-center gap-2.5">
                      <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#4a4a4a] mb-0.5" />
                      <div className="w-[1px] h-[14px] bg-gray-300"></div>
                      <input
                        type="tel"
                        placeholder="06 00 00 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="flex-1 bg-transparent border-none focus:outline-none text-[13px] md:text-[15px] font-serif text-gray-700 placeholder:text-[#b8b8b8]"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-[10px] md:text-xs font-serif text-center mt-1">{error}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full text-center bg-[#4b3d37] text-white py-[12px] md:py-[15px] mt-[45px] md:mt-6 rounded-[5px] font-serif italic text-[13px] md:text-[15px] hover:bg-[#382d29] transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Recherche…' : 'Suivre commande ›'}
                </button>
              </form>

              {/* Footer Link */}
              <div className="text-center mt-[30px] md:mt-12 text-[10px] md:text-xs font-serif text-gray-500">
                Besoin d'aide ?{' '}
                <Link href="/contact" className="text-[#da2966] underline decoration-[#da2966] hover:text-[#b1184e] transition-colors underline-offset-[3px]">
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