"use client";
import { useEffect, useRef, useState } from 'react';
import SectionContainer from '@/components/SectionContainer';
import ImageGalleryModal from '@/components/ui/ImageGalleryModal';
import { ReviewItem, RatingSummary } from '@/services/api';
import useReferenceStore from '@/store/reference';
import useMouseDragScroll from '@/hooks/useMouseDragScroll';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex text-aura-gold scale-75">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-4 h-4 fill-current ${s > rating ? 'opacity-30' : ''}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CustomerReviewsSection() {
  const reviews       = useReferenceStore((s) => s.reviews);
  const summary       = useReferenceStore((s) => s.reviewSummary);
  const ensureReviews = useReferenceStore((s) => s.ensureReviews);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Gallery State
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState('');

  // Fetch once per session — idempotent
  useEffect(() => { ensureReviews(); }, [ensureReviews]);
  useMouseDragScroll(trackRef);

  const openGallery = (clickedImageUrl: string) => {
    const allImages = reviews.flatMap(r => r.images.map(img => img.image_url));
    if (allImages.length > 0) {
      setGalleryImages(allImages);
      setCurrentImage(clickedImageUrl);
      setGalleryOpen(true);
    }
  };

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(':first-child')?.clientWidth ?? 300;
    // Advance 2 cards at a time (card width × 2 + gap × 2)
    const step = (cardWidth + 24) * 2;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  // Sync scroll arrows whenever reviews load
  useEffect(() => {
    if (reviews.length > 0) setTimeout(updateArrows, 50);
  }, [reviews.length]);

  // Format average to French locale (4,5 instead of 4.5)
  const displayAverage = summary.average > 0
    ? summary.average.toFixed(1).replace('.', ',')
    : 'â€”';

  // Round average for star display
  const starAverage = Math.round(summary.average);

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <section className="relative min-h-[502px] flex flex-col justify-center items-center py-16 md:py-24 overflow-hidden" id="customer-reviews">
      {/* Background - Identical to CategoriesSection */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Mobile version (Rotated) */}
        <div 
          className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vh] h-[100vw] min-w-[1200px] bg-cover bg-center bg-no-repeat rotate-90 opacity-90"
          style={{ backgroundImage: "url('/background.jpeg')" }}
        />
        {/* Desktop version (Normal) */}
        <div 
          className="hidden md:block absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/background.jpeg')" }}
        />
      </div>

      <SectionContainer className="relative z-10 w-full px-4 md:px-[69px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:items-center items-start justify-center">
          {/* Left Column: Rating Summary - Premium Centered Design */}
          <div className="lg:col-span-4 space-y-10 flex flex-col items-center text-center">
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#4a403a] font-serif">
              Nos Clients, Notre <span className="text-[#e63a6c] italic font-light ml-1 text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>Fierté</span>
            </h2>
            
            {/* Rating Score + Distribution - Horizontal Layout */}
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 w-full justify-center">
              {/* Left: Rating Score */}
              <div className="flex flex-col items-center space-y-3">
                <div className="text-7xl font-serif font-light text-[#2c2c2c] tracking-tight">{displayAverage}</div>
                <div className="flex justify-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className={`w-5 h-5 fill-current ${s > starAverage ? 'text-gray-300' : 'text-[#d4af37]'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-light">{summary.total.toLocaleString('fr-MA')} Avis</div>
              </div>

              {/* Right: Rating Distribution Bars */}
              <div className="w-full sm:w-auto sm:min-w-[200px] space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = summary.distribution?.[star]?.percentage ?? 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs font-serif text-gray-600 w-3">{star}</span>
                      <div className="flex-1 bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-[#d4af37] h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quote - Elegant & Separated */}
            <div className="w-full max-w-lg">
              <p className="italic text-[#4a403a] text-sm leading-loose font-serif">
                "Nous croyons que l'excellence ne se revendique pas, elle se constate."
              </p>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Chaque produit présenté sur notre boutique est accompagné de notations attribuées par des clients réels.
              </p>
            </div>
          </div>

          {/* Right Column: Testimonials Carousel */}
          <div className="lg:col-span-8 relative h-full">
            <div
              ref={trackRef}
              onScroll={updateArrows}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden h-full items-stretch pb-4 touch-pan-x cursor-grab select-none"
            >
              {reviews.map((review) => (
                <div key={review.id} className="flex-none w-[calc(100%-16px)] sm:w-[calc(50%-12px)] lg:w-[calc(50%-12px)] snap-start bg-white rounded-[16px] border-[0.5px] border-black/10 shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col p-4 text-left">
                  {/* Card Header: Avatar + Info */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#f5e6ea] text-[#C9527A] flex items-center justify-center text-[13px] font-medium shrink-0">
                      {getInitials(review.reviewer_name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 flex-wrap">
                        <span className="text-[13px] font-medium text-gray-900">{review.reviewer_name}</span>
                        {review.customer_phone && (
                          <span className="text-[11px] text-gray-500 font-normal">{review.customer_phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400">{new Date(review.created_at).toLocaleDateString('fr-MA')}</span>
                        <span className="text-[10px] font-medium text-[#2ecc71] flex items-center gap-0.5">
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Vérifié
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-2 text-[#D4A847]">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} className={`w-3.5 h-3.5 fill-current ${s <= review.rating ? 'text-[#D4A847]' : 'text-gray-200'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Body Content */}
                  {review.body && (
                    <p className="text-[12px] text-gray-600 leading-relaxed mb-4 line-clamp-3 italic opacity-90">{review.body}</p>
                  )}

                  {/* Product Image */}
                  {review.images.length > 0 ? (
                    <div
                      className="relative w-full h-[200px] bg-gray-50 cursor-pointer group overflow-hidden mt-auto rounded-[10px]"
                      onClick={() => openGallery(review.images[0].image_url)}
                    >
                      <img
                        alt="Product Review"
                        src={review.images[0].image_url}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 w-full h-[200px] mt-auto rounded-[10px]" />
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => scroll('left')}
              disabled={!canLeft}
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-gray-400 transition-all duration-200 disabled:opacity-0 hover:text-[#e63a6c] z-30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-white/90 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-gray-800 transition-all duration-200 disabled:opacity-0 hover:text-[#e63a6c] z-30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
          </div>
          
        </div>
      </SectionContainer>
      
      {/* Shared Fullscreen Image Modal */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        currentImage={currentImage}
        onImageChange={setCurrentImage}
        altText="Customer Review Image"
      />
    </section>
  );
}
