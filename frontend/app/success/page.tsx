'use client';

import { Headphones, ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function OrderSuccessPage() {
  const router = useRouter();

  // Read order details from sessionStorage (set by checkout page)
  const [orderData, setOrderData] = useState<{
    order: string; total: string; name: string; phone: string; city: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('order_success');
    if (raw) {
      try {
        setOrderData(JSON.parse(raw));
      } catch { /* ignore corrupt data */ }
      sessionStorage.removeItem('order_success');
    }
  }, []);

  const order = orderData?.order ?? '';
  const total = orderData?.total ?? '';
  const name  = orderData?.name  ?? '';
  const phone = orderData?.phone ?? '';
  const city  = orderData?.city  ?? 'MAROC';

  useEffect(() => {
    if (!order || !phone) return;
    // Auto-download invoice PDF — use fetch+blob to avoid cross-origin navigation
    const timer = setTimeout(async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/invoices/${order}/download?phone=${encodeURIComponent(phone)}`;
        const res = await fetch(url);
        if (!res.ok) return; // silently ignore if invoice unavailable
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `invoice-${order}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Silently ignore download errors — user can download manually
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [order, phone]);

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
        <Image src="/logo.png" alt="MyBloom" width={110} height={32} className="object-contain h-[28px] w-auto" />
      </div>

      <main className="min-h-screen bg-[#fff9f9] md:bg-[#f9f9f9] font-serif" style={{backgroundColor: 'rgba(252, 138, 138, 0.08)'}}>
        <div className="w-full md:flex md:flex-row items-center justify-center h-full">
          <div className="w-full md:flex md:flex-row md:bg-transparent md:shadow-none md:rounded-none md:overflow-hidden">
            
            {/* Left Column - Image (Desktop Only) */}
            <div className="hidden md:block md:w-1/2 relative min-h-screen bg-[#f4ece3]">
              <Image 
                src="/public_Image/order_packaging.jpg" 
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
            <div className="w-full md:w-1/2 p-4 md:p-8 lg:p-12 flex flex-col justify-center items-center bg-transparent">
              <div className="md:max-w-md lg:max-w-[480px] w-full md:bg-white md:shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:rounded-lg p-2 md:p-10 lg:p-12 my-4 md:my-0">
                
                {/* Success Icon */}
                <div className="flex justify-center mb-4 md:mb-8">
                  <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] flex items-center justify-center">
                    {/* Pink Scalloped Badge Background */}
                    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full text-[#fdefed] fill-current">
                      <path d="M 100.00,4.00 C 110.00,4.00 115.00,12.00 120.00,15.00 C 126.00,18.00 135.00,15.00 142.00,20.00 C 148.00,24.00 148.00,32.00 152.00,38.00 C 158.00,44.00 166.00,44.00 170.00,52.00 C 174.00,58.00 170.00,68.00 174.00,74.00 C 180.00,81.00 185.00,88.00 185.00,95.00 C 185.00,105.00 178.00,111.00 175.00,119.00 C 172.00,125.00 176.00,132.00 172.00,138.00 C 168.00,145.00 159.00,144.00 152.00,150.00 C 146.00,156.00 146.00,165.00 139.00,170.00 C 132.00,174.00 124.00,170.00 117.00,175.00 C 111.00,180.00 106.00,188.00 100.00,188.00 C 94.00,188.00 89.00,180.00 83.00,175.00 C 76.00,170.00 68.00,174.00 61.00,170.00 C 54.00,165.00 54.00,156.00 48.00,150.00 C 41.00,144.00 32.00,145.00 28.00,138.00 C 24.00,132.00 28.00,125.00 25.00,119.00 C 22.00,111.00 15.00,105.00 15.00,95.00 C 15.00,88.00 20.00,81.00 26.00,74.00 C 30.00,68.00 26.00,58.00 30.00,52.00 C 34.00,44.00 42.00,44.00 48.00,38.00 C 52.00,32.00 52.00,24.00 58.00,20.00 C 65.00,15.00 74.00,18.00 80.00,15.00 C 85.00,12.00 90.00,4.00 100.00,4.00 Z" />
                    </svg>
                    <div className="relative z-10 w-[50px] h-[50px] md:w-[64px] md:h-[64px] bg-[#da2966] rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-7 h-7 md:w-9 md:h-9 text-white stroke-[3px]" />
                    </div>
                  </div>
                </div>

                {/* Headings */}
                <div className="text-center mb-8">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 tracking-wide uppercase">COMMANDE REÇUE</h1>
                  <p className="text-gray-500 text-[13px] md:text-sm leading-relaxed">
                    Merci pour votre achat. Votre voyage parfumé commence maintenant.<br />journey begins now.
                  </p>
                </div>

                {/* Order Info Table */}
                <div className="space-y-5 border-t border-gray-50 py-6 mb-2">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-400 tracking-wider uppercase">NUMÉRO DE COMMANDE</span>
                    <span className="font-bold text-gray-900">#{order || 'LX-8921-Q'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-gray-400 tracking-wider uppercase">DATE</span>
                    <span className="font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-start text-[13px]">
                    <span className="text-gray-400 tracking-wider uppercase mt-1">LIVRAISON À</span>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{name || 'Client Name'}</div>
                      <div className="text-gray-500 mt-1 max-w-[180px] leading-relaxed text-[11px]">{city ? `N° 10, Rue XYZ, Appt 3\n${city}, MAROC` : 'Casablanca, MAROC'}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[13px] pt-4 mt-2">
                    <span className="font-bold text-gray-900 tracking-wider uppercase">MONTANT TOTAL</span>
                    <span className="font-bold text-gray-900 text-lg">{total ? `${Number(total).toFixed(2)} DH` : '720.00 DH'}</span>
                  </div>
                </div>

                {/* Confirmation Call Box */}
                <div className="bg-[#fff5f7] rounded-lg p-5 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="w-4 h-4 text-[#da2966]" />
                    <span className="text-[#da2966] font-bold text-[10px] tracking-widest uppercase">APPEL DE CONFIRMATION</span>
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    Notre concierge vous contactera bientôt à <strong className="text-gray-800">{phone || '+212 6 XX XX XX XX'}</strong> pour confirmer vos préférences de livraison
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <Link 
                    href="/" 
                    className="flex-1 bg-[#4b3d37] text-white py-3.5 rounded-[4px] italic text-[13px] hover:bg-[#3a322d] transition-colors text-center shadow-md font-bold"
                  >
                    Acheter maintenant ›
                  </Link>
                  <Link
                    href={`/order-status?order=${encodeURIComponent(order)}&phone=${encodeURIComponent(phone)}`}
                    className="flex-1 bg-white text-[#4a403a] border border-gray-200 py-3.5 rounded-[4px] italic text-[13px] hover:bg-gray-50 transition-colors text-center font-bold shadow-sm"
                  >
                    Suivre ma commande
                  </Link>
                </div>
                {/* Support Link */}
                <div className="text-center text-[11px] text-gray-400">
                  Besoin d'aide ? <Link href="/contact" className="text-[#da2966] underline decoration-[#da2966] underline-offset-2 hover:text-[#b82256] transition-colors">Contacter le support</Link>
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