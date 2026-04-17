"use client";
import { useEffect, useRef, useState } from 'react';
import SectionContainer from '@/components/SectionContainer';
import ImageGalleryModal from '@/components/ui/ImageGalleryModal';
import { ReviewItem, RatingSummary } from '@/services/api';
import useReferenceStore from '@/store/reference';

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

  return (
    <section className="mt-12 py-20 bg-white border-t border-gray-100" id="customer-reviews">
      <SectionContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:items-stretch items-start">
          {/* Left Column: Rating Summary */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-4xl font-serif text-gray-800">
 Nos Clients,  <span className="text-[#e63a6c] italic font-light ml-1 text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>Notre Fierté</span>       </h2>
            <div className="flex items-start gap-8">
              <div className="text-center">
                <div className="text-7xl font-serif text-gray-800">{displayAverage}</div>
                <div className="flex justify-center text-aura-gold my-2">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} className={`w-4 h-4 fill-current ${s > starAverage ? 'opacity-30' : ''}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-tighter">{summary.total.toLocaleString('fr-MA')} au total</div>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = summary.distribution?.[star]?.percentage ?? 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] w-2">{star}</span>
                      <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
                        <div
                          className="bg-aura-gold h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-8 italic text-gray-500 text-sm leading-relaxed border-t border-gray-50">
              "Nous croyons que l'excellence ne se revendique pas, elle se constate."
              Chaque produit présenté sur notre boutique est accompagné de notations attribuées par des clients réels, après réception et utilisation.            </div>
          </div>

          {/* Right Column: Testimonials Carousel */}
          <div className="lg:col-span-8 relative h-full">
            <div
              ref={trackRef}
              onScroll={updateArrows}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden h-full items-stretch pb-4"
            >
              {reviews.map((review) => (
                <div key={review.id} className="flex-none w-[calc(80%-16px)] sm:w-[calc(40%-16px)] snap-start bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                  {/* Image — full bleed, object-cover, dynamic height based on flex-grow */}
                  {review.images.length > 0 ? (
                    <div
                      className="relative w-full bg-gray-50 cursor-pointer group overflow-hidden flex-1 min-h-[150px]"
                      onClick={() => openGallery(review.images[0].image_url)}
                    >
                      <img
                        alt="Review"
                        src={review.images[0].image_url}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 flex-1 min-h-[150px]" />
                  )}
                  {/* Body */}
                  <div className="p-4 flex flex-col shrink-0 bg-white z-10">
                    {review.body && (
                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">{review.body}</p>
                    )}
                    <div className="text-center border-t border-gray-100 pt-3 mt-auto">
                      <h5 className="font-serif font-bold text-gray-900 text-sm mb-1.5">{review.reviewer_name}</h5>
                      <div className="flex justify-center gap-0.5 my-1.5">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} className={`h-3 w-3 fill-current ${s <= review.rating ? 'text-[#d4af37]' : 'text-gray-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-1.5">{new Date(review.created_at).toLocaleDateString('fr-MA')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => scroll('left')}
              disabled={!canLeft}
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-md text-gray-400 transition-opacity duration-200 disabled:opacity-30"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-white/80 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-md text-gray-800 transition-opacity duration-200 disabled:opacity-30"
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
