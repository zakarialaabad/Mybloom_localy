'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReviewModal from '@/components/ReviewModal';
import { orderService, reviewService, OrderTrackResult } from '@/services/api';

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
  const [errorMsg, setErrorMsg]         = useState<string | undefined>(undefined);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Auto-dismiss the success banner after 3.5 s
  useEffect(() => {
    if (!successBanner) return;
    const t = setTimeout(() => setSuccessBanner(null), 3500);
    return () => clearTimeout(t);
  }, [successBanner]);

  useEffect(() => {
    if (!orderNumber || !phone) return;
    orderService.track(orderNumber, phone)
      .then(data => setOrderData(data))
      .catch(() => {});
  }, [orderNumber, phone]);

  const openModal = (name: string, desc: string, image: string, productId: number) => {
    setSelectedProduct({ name, desc, image, productId });
    setErrorMsg(undefined);
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (rating: number, body: string, images: File[]) => {
    console.log('[FeedbackPage] handleSubmitReview called — productId:', selectedProduct.productId, 'rating:', rating, 'images:', images.length);

    if (!selectedProduct.productId) {
      console.error('[FeedbackPage] Blocked: productId is missing or 0. selectedProduct:', selectedProduct);
      setErrorMsg('Unable to identify the product. Please close the modal and try again.');
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
    console.log('[FeedbackPage] Sending review payload:', payload, '— images count:', images.length);

    try {
      const result = await reviewService.submit(payload, images);
      console.log('[FeedbackPage] Review submitted successfully:', result);
      setRatedProductIds(prev => new Set([...prev, selectedProduct.productId]));
      
      // Update local review store
      setUserReviews(prev => new Map(prev).set(selectedProduct.productId, { rating, text: body, images }));
      
      setSuccessBanner(selectedProduct.name);
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error('[FeedbackPage] Review submission failed:', err);
      const apiError = err as { message?: string; errors?: Record<string, string[]> };
      const detail = apiError?.errors
        ? Object.values(apiError.errors).flat().join(' ')
        : (apiError?.message ?? 'Something went wrong. Please try again.');
      setErrorMsg(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 5) return 'Excellent';
    if (rating >= 4) return 'Good';
    if (rating >= 3) return 'Average';
    if (rating >= 2) return 'Poor';
    return 'Bad';
  };

  return (
    <>
      {/* ━━━ MOBILE LAYOUT ━━━ */}
      <div className="h-dvh bg-white flex flex-col overflow-hidden md:hidden font-serif">

        {/* Mobile Top Bar */}
        <div className="flex items-center justify-center relative px-4 py-4 shrink-0">
          <button onClick={() => router.back()} className="absolute left-4 w-10 h-10 bg-[#f3f3f3] rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Image src="/logo.png" alt="MyBloom" width={110} height={32} className="object-contain h-[28px] w-auto" />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pb-24">

          {/* Pink Scalloped Star Badge */}
          <div className="flex flex-col items-center pt-8 pb-8 px-6 border-b border-transparent">
            {/* Badge Container */}
            <div className="relative w-[72px] h-[72px] mb-4 flex items-center justify-center">
              {/* Outer Pale Pink Scallop */}
              <div className="absolute inset-0 text-[#fdefed]">
               <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-sm">
                  {/* simplified rosette/badge shape */}
                  <path d="M12 2L14.5 4.5L18 3.5L19 6.8L22 8.5L21 12L22 15.5L19 17.2L18 20.5L14.5 19.5L12 22L9.5 19.5L6 20.5L5 17.2L2 15.5L3 12L2 8.5L5 6.8L6 3.5L9.5 4.5L12 2Z" />
                </svg>
              </div>
              
              {/* Inner White Circle */}
              <div className="relative z-10 w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shadow-sm">
                {/* Center Pink Star */}
                <Star className="w-6 h-6 fill-[#da2966] text-[#da2966]" />
              </div>
            </div>
            
            <h1 className="text-xl font-bold text-gray-800 tracking-widest mb-3 uppercase font-serif">YOUR FEEDBACK</h1>
            <p className="text-[13px] text-gray-500 text-center leading-relaxed font-serif">
              Select a star rating for each product.<br />
              Your feedback helps others and improves our products.
            </p>
          </div>

          {/* Section Header - Collapsible Style */}
          <div className="bg-[#f9f9f9] px-5 py-3 flex items-center justify-between border-y border-gray-100">
            <span className="text-[14px] text-gray-600 font-serif">
              Rating Contents ( {orderData?.items.length ?? 0} items )
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Product List */}
          <div className="bg-white px-4 pt-2">
            {(orderData?.items ?? []).map((item, idx) => {
              const isRated = ratedProductIds.has(item.product_id);
              const userReview = userReviews.get(item.product_id);
              const starCount = userReview?.rating ?? 0;
              const isLast = idx === (orderData?.items.length ?? 0) - 1;
              return (
                <div
                  key={item.product_id}
                  className={`flex gap-4 py-6 cursor-pointer active:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
                  onClick={() => openModal(item.product_name, item.product_size_label ?? '', item.image_url ?? '', item.product_id)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-[72px] h-[72px] bg-gray-50 rounded-lg border border-gray-100 shrink-0 overflow-hidden shadow-sm">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.product_name} fill className="object-cover mix-blend-multiply p-1" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg" />
                    )}
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-[15px] font-bold text-gray-800 leading-tight uppercase font-serif tracking-wide mb-1">{item.product_name}</p>
                    <p className="text-[12px] text-gray-500 italic font-serif mb-2">{item.product_size_label}</p>
                    
                    {isRated && (
                      <div>
                        <span className="inline-flex items-center gap-1.5 bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] px-2.5 py-0.5 rounded-full text-[10px] font-bold font-serif uppercase tracking-wider">
                          Rated <CheckCircle2 className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Stars & Action */}
                  <div className="flex flex-col items-end justify-center gap-1.5 shrink-0">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        isRated
                          ? <Star key={s} className={`w-3.5 h-3.5 ${s <= starCount ? 'fill-[#e8a838] text-[#e8a838]' : 'text-gray-300 fill-gray-100'}`} />
                          : <Star key={s} className="w-3.5 h-3.5 text-gray-400 stroke-1" fill="transparent" /> 
                      ))}
                    </div>

                    {/* Label */}
                    {isRated ? (
                      <span className="text-[11px] text-[#e8a838] font-bold font-serif italic">{getRatingLabel(starCount)}</span>
                    ) : (
                      <span className="text-[11px] text-gray-500 font-serif underline decoration-gray-400 underline-offset-2">Rate this item</span>
                    )}
                  </div>
                </div>
              );
            })}
            {!orderData && (
              <p className="text-center text-gray-400 text-[13px] italic font-serif py-12">Loading your order details…</p>
            )}
          </div>

          {/* Continue Shopping Button */}
          <div className="px-5 mt-4 mb-8">
            <Link
              href="/"
              className="block w-full text-center bg-[#4b3d37] text-white py-4 rounded-[4px] font-serif italic text-[15px] hover:bg-[#382d29] transition-colors shadow-sm"
            >
              Continue Shopping ›
            </Link>
          </div>
        </div>
      </div>

      {/* ━━━ DESKTOP LAYOUT ━━━ */}
      <div className="hidden md:block">
        <Header />
        <main className="min-h-screen bg-white">
          <div className="flex flex-col lg:flex-row min-h-screen w-full">

            {/* Left Column */}
            <div className="lg:w-1/2 bg-[#f4ece3] flex flex-col items-center justify-center p-12 relative">
              <div className="relative w-80 h-80 mb-12">
                <div className="absolute inset-0 border-2 border-[#cda873] m-4">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#cda873]"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#cda873]"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#cda873]"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#cda873]"></div>
                </div>
                <div className="absolute inset-8 border-4 border-[#cda873] rounded-full flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm shadow-2xl shadow-[#cda873]/20">
                  <div className="text-center transform -translate-y-2">
                    <span className="block text-6xl font-serif font-bold text-[#cda873] tracking-tight italic leading-none">Bloom</span>
                    <span className="block text-4xl font-serif text-[#cda873] tracking-widest mt-1">Parfums</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-8 h-8 fill-[#cda873] text-[#cda873]" />
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:w-1/2 bg-[#fdfcfb] p-8 md:p-16 flex flex-col justify-center items-center">
              <div className="max-w-md w-full">
                <div className="w-16 h-16 bg-[#fdf8f1] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#f5eedf]">
                  <div className="w-10 h-10 bg-[#fdf8f1] rounded-full flex items-center justify-center shadow-sm">
                    <Star className="w-5 h-5 fill-[#e8c99b] text-[#e8c99b]" />
                  </div>
                </div>
                <div className="text-center mb-10">
                  <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3 tracking-wide">YOUR FEEDBACK</h1>
                  <p className="text-gray-500 font-serif text-sm leading-relaxed">
                    Select a star rating for each product.<br />
                    Your feedback helps others and improves our products.
                  </p>
                </div>
                <div className="bg-[#fdfbf5] border border-[#f5eedf] rounded-sm p-6 mb-10">
                  {(orderData?.items ?? []).map((item, idx) => {
                    const isRated = ratedProductIds.has(item.product_id);
                    const userReview = userReviews.get(item.product_id);
                    const starCount = userReview?.rating ?? 0;
                    const isLast = idx === (orderData?.items.length ?? 0) - 1;
                    return (
                      <div
                        key={item.product_id}
                        className={`flex items-center justify-between py-4 ${isLast ? '' : 'border-b border-[#f5eedf]'} cursor-pointer hover:bg-[#fdf8f1] transition-colors px-2 -mx-2 rounded-sm`}
                        onClick={() => openModal(item.product_name, item.product_size_label ?? '', item.image_url ?? '', item.product_id)}
                      >
                        <div className="flex items-center gap-4">
                          {item.image_url && (
                            <div className="relative w-12 h-12 bg-white rounded-sm border border-gray-100 shrink-0">
                              <Image src={item.image_url} alt={item.product_name} fill className="object-cover mix-blend-multiply p-1" />
                            </div>
                          )}
                          <div>
                            {isRated ? (
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif font-bold text-gray-900 text-sm">{item.product_name}</h4>
                                <span className="text-[10px] text-[#2e7d32] font-serif italic flex items-center gap-1">Rated <CheckCircle2 className="w-3 h-3" /></span>
                              </div>
                            ) : (
                              <h4 className="font-serif font-bold text-gray-900 text-sm">{item.product_name}</h4>
                            )}
                            <p className="font-serif italic text-[10px] text-gray-400 mt-0.5">{item.product_size_label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isRated ? (
                            <>
                              <span className="text-[10px] text-[#e8a838] font-serif font-medium block mb-1">{getRatingLabel(starCount)}</span>
                              <div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= starCount ? 'fill-[#e8a838] text-[#e8a838]' : 'text-gray-200'}`} />)}</div>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] text-gray-400 font-serif italic block mb-1">Rate this item</span>
                              <div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-gray-300 hover:text-[#cda873] transition-colors" />)}</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!orderData && <p className="text-center text-gray-400 font-serif italic py-4 text-sm">Loading your order…</p>}
                </div>
                <div className="text-center mb-8">
                  <h4 className="font-serif font-bold text-[#8b7355] text-sm mb-1">Thank you for rating!</h4>
                  <p className="text-gray-400 font-serif text-xs">Your feedback helps other fragrance lovers.</p>
                </div>
                <Link href="/" className="block w-full text-center bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-sm hover:bg-[#3a322d] transition-colors shadow-lg shadow-gray-200">
                  Continue Shopping ›
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* ━━━ SUCCESS TOAST ━━━ */}
      <div className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 ${successBanner ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-3 bg-[#4a403a] text-white px-6 py-3 rounded-sm shadow-2xl">
          <svg className="w-4 h-4 text-[#da2966] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-serif italic text-sm">Review submitted — thank you!</p>
        </div>
      </div>

      {/* ━━━ REVIEW MODAL ━━━ */}
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