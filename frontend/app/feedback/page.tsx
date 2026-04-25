'use client';

export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';
import { orderService, reviewService, OrderTrackResult } from '@/services/api';
import useCatalogStore from '@/store/catalog';

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('order') ?? '';
  const phone = searchParams.get('phone') ?? '';

  const [orderData, setOrderData] = useState<OrderTrackResult | null>(null);
  const [ratedProductIds, setRatedProductIds] = useState<Set<number>>(new Set());
  const [userReviews, setUserReviews] = useState<Map<number, { rating: number; text: string; images: File[] }>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({ name: '', desc: '', image: '', productId: 0 });
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Invalidate the frontend product-list cache after a review is submitted
  // so homepage sections (BestSellers, etc.) re-fetch and show updated review_count
  const invalidateProductLists = useCatalogStore((s) => s.clearCache);

  useEffect(() => {
    if (!successBanner) return;
    const t = setTimeout(() => setSuccessBanner(null), 3500);
    return () => clearTimeout(t);
  }, [successBanner]);

  useEffect(() => {
    if (!orderNumber || !phone) return;
    orderService.track(orderNumber, phone)
      .then(data => setOrderData(data))
      .catch((err) => {
        console.error('[FeedbackPage] Failed to load order:', err);
        // Don't block the user from submitting reviews if order lookup fails
        // (e.g., 404 for invalid order, 429 for rate limit, network error, etc.)
      });
  }, [orderNumber, phone]);

  // ── Bloque le scroll du body sur mobile uniquement ──
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = '';
    };
  }, []);

  const openModal = (name: string, desc: string, image: string, productId: number) => {
    setSelectedProduct({ name, desc, image, productId });
    setErrorMsg(undefined);
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (rating: number, body: string, images: File[]) => {
    if (!selectedProduct.productId) {
      setErrorMsg('Impossible d\'identifier le produit. Veuillez fermer la fenêtre et réessayer.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(undefined);
    const payload = {
      product_id: selectedProduct.productId,
      order_number: orderNumber || undefined,
      reviewer_name: orderData?.customer_name ?? 'Client',
      rating,
      body,
    };
    try {
      const result = await reviewService.submit(payload, images);
      console.log('[FeedbackPage] Review submitted successfully:', result);
      setRatedProductIds(prev => new Set([...prev, selectedProduct.productId]));
      setUserReviews(prev => new Map(prev).set(selectedProduct.productId, { rating, text: body, images }));
      setSuccessBanner(selectedProduct.name);
      setIsModalOpen(false);
      // Clear the frontend product-list cache so homepage cards re-fetch updated review_count
      invalidateProductLists();
    } catch (err: unknown) {
      const apiError = err as { message?: string; errors?: Record<string, string[]> };
      const detail = apiError?.errors
        ? Object.values(apiError.errors).flat().join(' ')
        : (apiError?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
      setErrorMsg(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 5) return 'Excellent';
    if (rating >= 4) return 'Bon';
    if (rating >= 3) return 'Moyen';
    if (rating >= 2) return 'Mauvais';
    return 'Très mauvais';
  };

  /* ─── Badge partagé — identique à OrderSuccessPage ─── */
  const ScallopBadge = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const outer = size === 'lg' ? 'w-[65px] h-[65px]' : size === 'sm' ? 'w-[48px] h-[48px]' : 'w-[56px] h-[56px]';
    const inner = size === 'lg' ? 'w-9 h-9' : size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
    const icon  = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-[14px] h-[14px]' : 'w-[18px] h-[18px]';
    return (
      <div className={`${outer} relative flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full text-[#fdefed] fill-current">
          <path d="M 100.00,4.00 C 110.00,4.00 115.00,12.00 120.00,15.00 C 126.00,18.00 135.00,15.00 142.00,20.00 C 148.00,24.00 148.00,32.00 152.00,38.00 C 158.00,44.00 166.00,44.00 170.00,52.00 C 174.00,58.00 170.00,68.00 174.00,74.00 C 180.00,81.00 185.00,88.00 185.00,95.00 C 185.00,105.00 178.00,111.00 175.00,119.00 C 172.00,125.00 176.00,132.00 172.00,138.00 C 168.00,145.00 159.00,144.00 152.00,150.00 C 146.00,156.00 146.00,165.00 139.00,170.00 C 132.00,174.00 124.00,170.00 117.00,175.00 C 111.00,180.00 106.00,188.00 100.00,188.00 C 94.00,188.00 89.00,180.00 83.00,175.00 C 76.00,170.00 68.00,174.00 61.00,170.00 C 54.00,165.00 54.00,156.00 48.00,150.00 C 41.00,144.00 32.00,145.00 28.00,138.00 C 24.00,132.00 28.00,125.00 25.00,119.00 C 22.00,111.00 15.00,105.00 15.00,95.00 C 15.00,88.00 20.00,81.00 26.00,74.00 C 30.00,68.00 26.00,58.00 30.00,52.00 C 34.00,44.00 42.00,44.00 48.00,38.00 C 52.00,32.00 52.00,24.00 58.00,20.00 C 65.00,15.00 74.00,18.00 80.00,15.00 C 85.00,12.00 90.00,4.00 100.00,4.00 Z" />
        </svg>
        <div className={`relative z-10 ${inner} bg-white rounded-full flex items-center justify-center shadow-sm`}>
          <Star className={`${icon} fill-[#da2966] text-[#da2966]`} />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ════════════════════════════════════
          MOBILE (< md) — NE PAS TOUCHER
      ════════════════════════════════════ */}
      <div className="md:hidden fixed inset-0 flex flex-col overflow-hidden bg-white z-40 font-serif">

        {/* Header mobile */}
        <div className="flex items-center justify-center relative px-4 py-3.5 bg-white border-b border-gray-100 shrink-0">
          <button
            onClick={() => router.back()}
            className="absolute left-4 w-9 h-9 bg-[#f3f3f3] rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Image src="/logo.png" alt="MyBloom" width={100} height={28} className="object-contain h-[26px] w-auto" />
        </div>

        {/* Zone scrollable — fond rose */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: 'rgba(252, 138, 138, 0.08)' }}
        >
          <div className="flex flex-col justify-center min-h-full px-4 py-6 pb-[72px]">
            <div className="w-full bg-white rounded-xl shadow-[0_2px_18px_rgba(0,0,0,0.07)] px-6 py-7">

              <div className="flex justify-center mb-6">
                <ScallopBadge size="md" />
              </div>

              <div className="text-center mb-6">
                <h1 className="text-[17px] font-bold text-gray-800 mb-2 tracking-wide uppercase">VOTRE AVIS</h1>
                <p className="text-gray-500 text-[12.5px] leading-relaxed">
                  Sélectionnez une note pour chaque produit.<br />
                  Votre avis aide les autres et améliore nos produits.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-5 pb-3 mb-1">
                <span className="text-gray-400 text-[11px] tracking-wide uppercase">
                  Articles ( {orderData?.items.length ?? 0} )
                </span>
                <span className="text-gray-400 text-[11px] tracking-wide uppercase">Note</span>
              </div>

              <div>
                {(orderData?.items ?? []).map((item, idx) => {
                  const isRated = ratedProductIds.has(item.product_id);
                  const userReview = userReviews.get(item.product_id);
                  const starCount = userReview?.rating ?? 0;
                  const isLast = idx === (orderData?.items.length ?? 0) - 1;
                  return (
                    <div
                      key={item.product_id}
                      className={`flex gap-4 py-5 cursor-pointer active:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
                      onClick={() => openModal(item.product_name, item.product_size_label ?? '', item.image_url ?? '', item.product_id)}
                    >
                      <div className="relative w-[64px] h-[64px] bg-gray-50 rounded-lg border border-gray-100 shrink-0 overflow-hidden shadow-sm">
                        {item.image_url ? (
                          <Image src={item.image_url.startsWith('http') ? item.image_url : '/' + item.image_url} alt={item.product_name} fill className="object-cover mix-blend-multiply p-1" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-[13px] font-bold text-gray-800 leading-tight uppercase tracking-wide mb-1 truncate">
                          {item.product_name}
                        </p>
                        <p className="text-[11px] text-gray-500 italic mb-2">{item.product_size_label}</p>
                        {isRated && (
                          <span className="inline-flex items-center gap-1 bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                            Noté <CheckCircle2 className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-center gap-1 shrink-0">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            isRated
                              ? <Star key={s} className={`w-3.5 h-3.5 ${s <= starCount ? 'fill-[#e8a838] text-[#e8a838]' : 'text-gray-300 fill-gray-100'}`} />
                              : <Star key={s} className="w-3.5 h-3.5 text-gray-300 stroke-1" fill="transparent" />
                          ))}
                        </div>
                        {isRated ? (
                          <span className="text-[11px] text-[#e8a838] font-bold italic">{getRatingLabel(starCount)}</span>
                        ) : (
                          <span className="text-[11px] text-gray-400 underline underline-offset-2">Évaluer</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!orderData && (
                  <p className="text-center text-gray-400 text-[13px] italic py-10">
                    Chargement de votre commande…
                  </p>
                )}
              </div>

              <div className="mt-6">
                <Link
                  href="/"
                  className="block w-full text-center bg-[#4b3d37] text-white py-3.5 rounded-[4px] italic text-[12.5px] hover:bg-[#3a322d] transition-colors shadow-md font-bold"
                >
                  Continuer mes achats ›
                </Link>
              </div>

              <div className="text-center text-[11px] text-gray-400 mt-4">
                Besoin d&apos;aide ?{' '}
                <Link href="/contact" className="text-[#da2966] underline underline-offset-2 hover:text-[#b82256] transition-colors">
                  Contacter le support
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          DESKTOP (≥ md)
          Gauche  : image /feedback.jpg (cover)
          Droite  : fond rose + carte blanche
      ════════════════════════════════════ */}
      <div className="hidden md:block font-serif">
        <Header />
        <main>
          <div className="flex flex-row min-h-screen w-full">

            {/* ── Colonne gauche — image feedback.jpg ── */}
            <div className="w-1/2 relative">
              <Image
                src="/feedback.jpg"
                alt="Votre avis"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* ── Colonne droite — fond rose + carte blanche ── */}
            <div
              className="w-1/2 flex flex-col justify-center items-center p-8 lg:p-12"
              style={{ backgroundColor: 'rgba(252, 138, 138, 0.08)' }}
            >
              <div className="w-full max-w-[480px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-lg p-10 lg:p-12">

                {/* Badge */}
                <div className="flex justify-center mb-8">
                  <ScallopBadge size="lg" />
                </div>

                {/* Titre */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2 tracking-wide uppercase">VOTRE AVIS</h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Sélectionnez une note pour chaque produit.<br />
                    Votre avis aide les autres et améliore nos produits.
                  </p>
                </div>

                {/* Liste produits */}
                <div className="border-t border-gray-100 mb-6">
                  {(orderData?.items ?? []).map((item, idx) => {
                    const isRated = ratedProductIds.has(item.product_id);
                    const userReview = userReviews.get(item.product_id);
                    const starCount = userReview?.rating ?? 0;
                    const isLast = idx === (orderData?.items.length ?? 0) - 1;
                    return (
                      <div
                        key={item.product_id}
                        className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''} cursor-pointer hover:bg-gray-50 transition-colors rounded-sm`}
                        onClick={() => openModal(item.product_name, item.product_size_label ?? '', item.image_url ?? '', item.product_id)}
                      >
                        <div className="flex items-center gap-4">
                          {item.image_url && (
                            <div className="relative w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 shrink-0 overflow-hidden">
                              <Image src={item.image_url} alt={item.product_name} fill className="object-cover mix-blend-multiply p-1" />
                            </div>
                          )}
                          <div>
                            {isRated ? (
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 text-[13px]">{item.product_name}</h4>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                              </div>
                            ) : (
                              <h4 className="font-bold text-gray-900 text-[13px]">{item.product_name}</h4>
                            )}
                            <p className="italic text-[11px] text-gray-400 mt-0.5">{item.product_size_label}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {isRated ? (
                            <>
                              <span className="text-[11px] text-[#e8a838] font-medium block mb-1">{getRatingLabel(starCount)}</span>
                              <div className="flex gap-0.5 justify-end">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`w-3.5 h-3.5 ${s <= starCount ? 'fill-[#e8a838] text-[#e8a838]' : 'text-gray-200 fill-gray-100'}`} />
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-[11px] text-gray-400 italic block mb-1">Évaluer cet article</span>
                              <div className="flex gap-0.5 justify-end">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className="w-3.5 h-3.5 text-gray-300" fill="transparent" />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!orderData && (
                    <p className="text-center text-gray-400 italic py-6 text-sm">
                      Chargement de votre commande…
                    </p>
                  )}
                </div>

                {/* Encart merci */}
                <div className="bg-[#fff5f7] rounded-lg p-4 mb-6 text-center">
                  <p className="font-bold text-[#da2966] text-[13px] mb-0.5">Merci pour votre évaluation !</p>
                  <p className="text-gray-400 text-[11px]">Votre avis aide les autres amateurs de parfums.</p>
                </div>

                {/* CTA */}
                <div className="flex gap-3 mb-4">
                  <Link
                    href="/"
                    className="flex-1 bg-[#4b3d37] text-white py-3.5 rounded-[4px] italic text-[13px] hover:bg-[#3a322d] transition-colors text-center shadow-md font-bold"
                  >
                    Continuer mes achats ›
                  </Link>
                </div>

                {/* Support */}
                <div className="text-center text-[11px] text-gray-400">
                  Besoin d&apos;aide ?{' '}
                  <Link href="/contact" className="text-[#da2966] underline decoration-[#da2966] underline-offset-2 hover:text-[#b82256] transition-colors">
                    Contacter le support
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </main>
        <Footer />
      </div>

      {/* ━━━ TOAST DE SUCCÈS ━━━ */}
      <div className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 ${successBanner ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-3 bg-[#4a403a] text-white px-6 py-3 rounded-sm shadow-2xl">
          <svg className="w-4 h-4 text-[#da2966] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-serif italic text-sm">Avis soumis — merci !</p>
        </div>
      </div>

      {/* ━━━ FENÊTRE D'ÉVALUATION ━━━ */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={selectedProduct.name}
        productDesc={selectedProduct.desc}
        productImage={selectedProduct.image}
        onSubmit={handleSubmitReview}
        isSubmitting={submitting}
        errorMsg={errorMsg}
        initialRating={userReviews.get(selectedProduct.productId)?.rating ?? 0}
        initialReviewText={userReviews.get(selectedProduct.productId)?.text ?? ''}
        initialImages={userReviews.get(selectedProduct.productId)?.images ?? []}
      />
    </>
  );
}