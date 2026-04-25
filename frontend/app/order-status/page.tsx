'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheckCircle2, ChevronUp } from 'lucide-react';
import { orderService, OrderTrackResult } from '@/services/api';
import { statusContent, STATUS_LABELS } from '@/lib/statusContent';

export default function OrderStatusPage() {
  const params      = useSearchParams();
  const orderNumber = params.get('order') ?? '';
  const phone       = params.get('phone') ?? '';

  const [trackData, setTrackData] = useState<OrderTrackResult | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [isContentsOpen, setIsContentsOpen] = useState(true);
  const [showReviewTooltip, setShowReviewTooltip] = useState(false);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    orderService.track(orderNumber, phone)
      .then(setTrackData)
      .catch(() => setError('Commande introuvable.'))
      .finally(() => setLoading(false));
  }, [orderNumber, phone]);

  // STATUS_LABELS and statusContent imported from '@/lib/statusContent' for reuse and testability

  const currentStatus = trackData?.status ?? '';
  const content = statusContent[currentStatus as keyof typeof statusContent];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-8 font-serif">
            <Link href="/" className="hover:text-gray-800">Accueil</Link> / <Link href="/cart" className="hover:text-gray-800">Panier</Link> / <Link href="/checkout" className="hover:text-gray-800">Livraison</Link> / <span className="text-gray-800">Commande</span>
          </div>

          {loading && <p className="font-serif italic text-gray-400 text-sm py-12 text-center">Chargement…</p>}
          {error   && <p className="font-serif text-red-500 text-sm py-12 text-center">{error}</p>}

          {!loading && !error && (
          <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-16">
            {/* Left Column - Order Status */}
            <div className="flex-1 lg:w-[60%]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-gray-500 font-serif text-[13px] mb-2 uppercase tracking-wider">COMMANDE #{orderNumber || 'LX-8921-Q'}</p>
                  <h1 key={currentStatus} className="text-[32px] md:text-[38px] font-serif text-gray-800 tracking-tight leading-none mb-1 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-2">
                    {content?.title ?? STATUS_LABELS[currentStatus] ?? 'Statut de la commande'}
                  </h1>
                </div>
                <div className="flex justify-center">
                  <div className="relative w-[68px] h-[68px] md:w-[80px] md:h-[80px]">

                    <svg
                      viewBox="15 4 170 184"
                      className="absolute inset-0 w-full h-full text-[#fdefed] fill-current"
                    >
                      <path d="M 100.00,4.00 C 110.00,4.00 115.00,12.00 120.00,15.00 C 126.00,18.00 135.00,15.00 142.00,20.00 C 148.00,24.00 148.00,32.00 152.00,38.00 C 158.00,44.00 166.00,44.00 170.00,52.00 C 174.00,58.00 170.00,68.00 174.00,74.00 C 180.00,81.00 185.00,88.00 185.00,95.00 C 185.00,105.00 178.00,111.00 175.00,119.00 C 172.00,125.00 176.00,132.00 172.00,138.00 C 168.00,145.00 159.00,144.00 152.00,150.00 C 146.00,156.00 146.00,165.00 139.00,170.00 C 132.00,174.00 124.00,170.00 117.00,175.00 C 111.00,180.00 106.00,188.00 100.00,188.00 C 94.00,188.00 89.00,180.00 83.00,175.00 C 76.00,170.00 68.00,174.00 61.00,170.00 C 54.00,165.00 54.00,156.00 48.00,150.00 C 41.00,144.00 32.00,145.00 28.00,138.00 C 24.00,132.00 28.00,125.00 25.00,119.00 C 22.00,111.00 15.00,105.00 15.00,95.00 C 15.00,88.00 20.00,81.00 26.00,74.00 C 30.00,68.00 26.00,58.00 30.00,52.00 C 34.00,44.00 42.00,44.00 48.00,38.00 C 52.00,32.00 52.00,24.00 58.00,20.00 C 65.00,15.00 74.00,18.00 80.00,15.00 C 85.00,12.00 90.00,4.00 100.00,4.00 Z" />
                    </svg>

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
              </div>

              {/* Success Banner */}
              <div className="bg-[#fdf4f6] rounded-[8px] p-6 mb-10 flex gap-4 items-start shadow-sm border border-[#faeef1]">
                <div className="w-6 h-6 shrink-0 mt-0.5 rounded-full bg-white flex items-center justify-center shadow-sm text-[#c72864]">
                  <CheckCircle2 className="w-[18px] h-[18px]" fill="#c72864" stroke="white" strokeWidth={3} />
                </div>
                <div key={`banner-${currentStatus}`} className="transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-[#c72864] font-serif font-bold text-[17px] mb-1.5">{content?.title ?? STATUS_LABELS[currentStatus] ?? 'Statut de la commande'}</h3>
                  <p className="text-[#888] text-[12.5px] font-serif leading-[1.6]">
                    {content?.subtitle ?? 'Nous mettons à jour le statut de votre commande. Revenez dans quelques instants pour voir les dernières informations.'}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-3 md:pl-5 mb-14">
                {(() => {
                  const DISPLAY_STEPS = [
                    { key: 'confirmed',  label: 'Commande validée' },
                    { key: 'preparing',  label: 'Préparation de votre colis' },
                    { key: 'shipped',    label: 'En cours de livraison' },
                    { key: 'delivered',  label: 'Livrée' },
                  ];

                  const historyDates: Record<string, string> = {};
                  if (trackData) {
                    trackData.status_histories.forEach(h => {
                      historyDates[h.status] = h.created_at;
                      if (h.status === 'dispatched') historyDates['shipped'] = h.created_at;
                    });
                  }

                  // Map each order status to the LAST active step index (0-based).
                  // 'pending'   → -1  : NO steps highlighted (not yet confirmed by admin).
                  // 'confirmed' →  0  : Only step 1 (Order Valid) lit.
                  // 'preparing' →  1  : Steps 1-2 lit (auto after 6 h).
                  // 'shipped'   →  2  : Steps 1-3 lit (auto after 3 h more).
                  // 'delivered' →  3  : All steps lit (manual by admin).
                  const STATUS_ACTIVE_INDEX: Record<string, number> = {
                    pending:    -1,
                    confirmed:   0,
                    preparing:   1,
                    shipped:     2,
                    dispatched:  2,
                    delivered:   3,
                    cancelled:  -1,
                  };
                  const activeIndex = STATUS_ACTIVE_INDEX[currentStatus] ?? -1;

                  return DISPLAY_STEPS.map((step, idx) => {
                    const isDone = activeIndex >= 0 && idx <= activeIndex;
                    const isActive = activeIndex >= 0 && idx === activeIndex;
                    const isLast = idx === DISPLAY_STEPS.length - 1;
                    const dateRaw = historyDates[step.key];
                    const dateFormatted = dateRaw 
                      ? new Date(dateRaw).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : ''; 

                    return (
                      <div key={idx} className="relative flex gap-6">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[14px] font-hanken font-medium z-10 shrink-0 border-[2px] transition-colors ${isDone ? 'bg-[#403531] border-[#403531] text-white' : 'bg-white border-[#403531] text-[#403531]'}`}>
                                  <span className="num">{idx + 1}</span>
                                </div>
                          {!isLast && <div className="w-[2px] h-[70px] bg-[#403531]" />}
                        </div>
                        <div className={`pt-0.5 ${isLast ? '' : 'pb-[32px]'}`}>
                          <h4 className={`font-serif font-bold text-[16px] md:text-[17px] transition-colors ${isDone ? 'text-[#c72864]' : 'text-[#403531]'}`}>
                            {step.label}
                          </h4>
                          {dateFormatted ? (
                            <p className="text-gray-400/80 font-serif text-[12px] mt-1">{dateFormatted}</p>
                          ) : (
                            <p className="h-[18px]"></p>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Leave a Review Button */}
                <div 
                  className="flex-1 relative"
                  onMouseEnter={() => currentStatus !== 'delivered' && setShowReviewTooltip(true)}
                  onMouseLeave={() => setShowReviewTooltip(false)}
                  onFocus={() => currentStatus !== 'delivered' && setShowReviewTooltip(true)}
                  onBlur={() => setShowReviewTooltip(false)}
                >
                  {currentStatus === 'delivered' ? (
                    <Link
                      href={`/feedback?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`}
                      className="block w-full bg-[#403531] text-white py-[14px] rounded-[5px] font-serif italic text-[14px] hover:bg-[#2d2522] transition-colors text-center shadow-sm"
                    >
                      Laisser un avis ›
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-[14px] rounded-[5px] font-serif italic text-[14px] cursor-not-allowed shadow-sm opacity-60 transition-opacity hover:opacity-70"
                    >
                      Laisser un avis ›
                    </button>
                  )}
                  
                  {/* Tooltip - Shows when not delivered and hovering */}
                  {currentStatus !== 'delivered' && showReviewTooltip && (
                    <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-max px-4 py-3 bg-[#da2966] text-white rounded-[6px] text-[12px] font-serif shadow-xl z-50 pointer-events-none">
                      <p className="font-bold tracking-wide whitespace-nowrap">Avis disponibles après la livraison</p>
                      <p className="text-[11px] opacity-95 mt-1.5 whitespace-normal max-w-[220px]">Ce bouton s'active une fois que votre commande est livrée</p>
                      {/* Arrow pointer */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#da2966]"></div>
                    </div>
                  )}
                </div>

                <Link href="/contact" className="flex-1 bg-white text-[#333] border border-gray-200 py-[14px] rounded-[5px] font-serif italic text-[14px] hover:bg-gray-50 transition-colors shadow-sm text-center">
                  Besoin d'aide ?
                </Link>
              </div>
            </div>

            {/* Right Column - Shipment Contents */}
            <div className="lg:w-[40%] bg-[#fffcf8] border border-[#f5eedf] rounded-sm h-fit overflow-hidden">
              {/* Mobile Accordion Header & Desktop Header */}
              <div 
                className="flex justify-between items-center bg-[#f4f4f4] px-5 py-3.5 md:bg-transparent md:px-8 md:pt-8 md:pb-4 cursor-pointer md:cursor-default transition-colors"
                onClick={() => window.innerWidth < 1024 && setIsContentsOpen(!isContentsOpen)}
              >
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[13px] md:text-lg font-serif text-[#4a4a4a] tracking-wide">
                    Contenu de l'envoi ( {trackData?.items.length || 0} articles )
                  </h2>
                  <ChevronUp className={`w-3.5 h-3.5 text-[#4a4a4a] transition-transform lg:hidden ${isContentsOpen ? '' : 'rotate-180'}`} />
                </div>
                {trackData && (
                  <span className="font-serif text-[#111] font-semibold text-[15px] lg:hidden">
                    <span className="num">{trackData.total.toFixed(2)}</span>{' '}
                    <span>DH</span>
                  </span>
                )}
              </div>

              {/* Collapsible Content */}
              <div className={`${isContentsOpen ? 'block' : 'hidden'} lg:block px-6 py-8 md:p-8 pt-6`}>
                {/* Cart Items */}
                <div className="space-y-6 mb-10">
                  {trackData?.items.map((item, idx) => (
                    <div key={idx} className="flex gap-5 items-center">
                      <div className="relative w-[65px] h-[65px] bg-[#f2f2f2] rounded-md shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100">
                        <Image src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : '/' + item.image_url) : 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200'} alt={item.product_name} fill className="object-cover mix-blend-multiply p-1.5 rounded-md" />
                        <span className="absolute -top-[7px] -right-[7px] w-[20px] h-[20px] bg-[#4a4846] text-white text-[10px] flex items-center justify-center rounded-full font-serif"><span className="num">{item.quantity}</span></span>
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div className="flex flex-col">
                          <h4 className="font-serif font-bold text-[#4a4846] text-[14px] uppercase tracking-wide leading-tight">{item.product_name}</h4>
                          <p className="font-serif italic text-[11.5px] text-[#888] mt-[2px]">
                            {item.product_name.toLowerCase().includes('pop') || item.product_name.toLowerCase().includes('butter') ? 'Body Butter' : 'Bold Body Mist'} / Size {item.product_size_label}
                          </p>
                        </div>
                        <div className="font-serif italic text-[#7a7a7a] text-[13px] whitespace-nowrap pl-2">
                          <span className="num">{(item.unit_price * item.quantity).toFixed(2)}</span>{' '}<span>DH</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {trackData && (
                <div className="space-y-4 pt-1">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="font-serif text-[#4a4846]">Your Price</span>
                    <span className="font-serif italic text-[#7a7a7a]"><span className="num">{trackData.subtotal.toFixed(2)}</span>{' '}<span>DH</span></span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="font-serif text-[#4a4846]">Expédition</span>
                    <span className="font-serif font-bold italic text-[#111]">{trackData.shipping_cost === 0 ? 'Free' : (<><span className="num">{trackData.shipping_cost.toFixed(2)}</span>{' '}<span>DH</span></>)}</span>
                  </div>
                  {trackData.coupon_discount > 0 ? (
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-serif text-[#4a4846]">Coupon</span>
                      <span className="font-serif italic text-[#7a7a7a]"><span className="num">{trackData.coupon_discount.toFixed(2)}</span>{' '}<span>DH</span></span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-serif text-[#4a4846]">Coupon</span>
                      <span className="font-serif italic text-[#7a7a7a]"><span className="num">0.00</span>{' '}<span>DH</span></span>
                    </div>
                  )}
                  <div className="border-t border-[#e5e5df] my-2 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-[#333] text-[15px]">Total</span>
                      <span className="font-serif font-bold text-[#111] text-[16px]"><span className="num">{trackData.total.toFixed(2)}</span>{' '}<span>DH</span></span>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}