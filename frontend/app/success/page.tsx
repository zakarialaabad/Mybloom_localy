'use client';

import { Headphones, ArrowLeft, Check, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { orderService } from '@/services/api';

export default function OrderSuccessPage() {
  const router = useRouter();
  const params  = useSearchParams();
  const order   = params.get('order')  ?? '';
  const total   = params.get('total')  ?? '';
  const name    = params.get('name')   ?? '';
  const phone   = params.get('phone')  ?? '';
  const city    = params.get('city')   ?? 'MAROC';

  type InvoiceStatus = 'idle' | 'sending' | 'sent' | 'failed';
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('idle');
  const [invoiceError,  setInvoiceError]  = useState<string | null>(null);

  const invoiceSent = useRef(false);
  useEffect(() => {
    if (!order || invoiceSent.current) return;
    invoiceSent.current = true;

    console.log(`[WhatsApp Invoice] Queuing invoice for order: ${order}`);
    setInvoiceStatus('sending');

    orderService.sendInvoice(order)
      .then(() => {
        // Backend replied 202 instantly — WhatsApp is being sent in background
        console.log(`[WhatsApp Invoice] ✅ Queued — invoice will arrive on ${phone} shortly.`);
        setInvoiceStatus('sent');
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Network error';
        console.error('[WhatsApp Invoice] ❌ Request failed:', msg, err);
        setInvoiceStatus('failed');
        setInvoiceError(msg);
      });
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

      {/* ━━━ WHATSAPP INVOICE NOTIFICATION ━━━ */}
      {invoiceStatus !== 'idle' && (
        <div className={`fixed bottom-6 right-4 left-4 md:left-auto md:right-6 md:w-[340px] z-50 rounded-lg shadow-lg border px-4 py-3 flex items-start gap-3 transition-all duration-300 ${
          invoiceStatus === 'sending' ? 'bg-white border-gray-200' :
          invoiceStatus === 'sent'    ? 'bg-[#f0fdf4] border-green-200' :
                                        'bg-[#fff5f7] border-[#fecdd3]'
        }`}>
          <div className="shrink-0 mt-0.5">
            {invoiceStatus === 'sending' && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
            {invoiceStatus === 'sent'    && <MessageCircle className="w-4 h-4 text-green-600" />}
            {invoiceStatus === 'failed'  && <AlertCircle className="w-4 h-4 text-[#da2966]" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[12px] font-bold tracking-wide uppercase ${
              invoiceStatus === 'sending' ? 'text-gray-500' :
              invoiceStatus === 'sent'    ? 'text-green-700' :
                                            'text-[#da2966]'
            }`}>
              {invoiceStatus === 'sending' && 'Envoi de la facture…'}
              {invoiceStatus === 'sent'    && 'Facture envoyée via WhatsApp'}
              {invoiceStatus === 'failed'  && 'Facture non envoyée'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              {invoiceStatus === 'sending' && 'Génération du PDF et envoi WhatsApp en cours.'}
              {invoiceStatus === 'sent'    && `Vous recevrez la facture sur ${phone} dans quelques instants.`}
              {invoiceStatus === 'failed'  && (invoiceError ?? 'Une erreur est survenue lors de l\'envoi.')}
            </p>
          </div>
          <button
            onClick={() => setInvoiceStatus('idle')}
            className="shrink-0 text-gray-300 hover:text-gray-500 text-lg leading-none mt-0.5"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

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