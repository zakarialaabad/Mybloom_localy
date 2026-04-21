"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Banner } from '@/services/api';
import { sanitizeImageUrl, FALLBACK_IMG } from '@/lib/utils';
import useReferenceStore from '@/store/reference';
import ImageGalleryModal from '@/components/ui/ImageGalleryModal';
import { Eye } from 'lucide-react';

// ── Skeleton placeholder shown while banners are loading ──────────────────────
function BannerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gray-100 animate-pulse ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

// ── Single banner tile — lazy-loaded, optional link wrapper ───────────────────
function BannerTile({
  banner,
  fill = true,
  priority = false,
  className = '',
  onOpen,
}: {
  banner: Banner;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  onOpen?: (img: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  
  const safeImageUrl = sanitizeImageUrl(banner.image_path);
  const finalImageUrl = imgError ? FALLBACK_IMG : safeImageUrl;

  const img = (
    <Image
      src={finalImageUrl}
      alt={banner.title ?? 'Promotional banner'}
      fill={fill}
      sizes="(max-width: 1024px) 100vw, 50vw"
      className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${className}`}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      onError={() => setImgError(true)}
    />
  );

  if (banner.link) {
    return (
      <div className="absolute inset-0 z-0">
        <Link href={banner.link} className="absolute inset-0 z-10" aria-label={banner.title ?? 'View offer'}>
          {img}
        </Link>
        {onOpen && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(banner.image_path); }}
            className="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all pointer-events-auto"
            aria-label="Voir l'image en grand"
          >
            <Eye className="h-5 w-5 text-gray-800" />
          </button>
        )}
      </div>
    );
  }

  // No link — make the whole tile clickable to open the lightbox when provided
  if (onOpen) {
    return (
      <button
        onClick={() => onOpen(banner.image_path)}
        className="absolute inset-0 z-10 text-left"
        aria-label={banner.title ?? 'View banner'}
      >
        {img}
      </button>
    );
  }

  return <>{img}</>;
}

export default function ValentinesSection() {
  const banners       = useReferenceStore((s) => s.banners);
  const bannersReady  = useReferenceStore((s) => s.bannersReady);
  const ensureBanners = useReferenceStore((s) => s.ensureBanners);

  useEffect(() => { ensureBanners(); }, [ensureBanners]);

  const loading = !bannersReady;

  // Lightbox / gallery state for viewing banners full-size
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');

  const openGallery = (img: string) => {
    const safe = sanitizeImageUrl(img);
    setGalleryImages([safe]);
    setCurrentImage(safe);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setGalleryImages([]);
    setCurrentImage('');
  };

  // Slots indexed by position (1-based). Pad to 4 with undefined.
  const slots: (Banner | undefined)[] = [1, 2, 3, 4].map(
    (pos) => banners.find((b) => b.position === pos),
  );

  return (
    <section className="pt-8 pb-16 md:pt-24 md:pb-24 w-full" data-purpose="valentines-promotion">
      {/* 
        Full width container instead of constrained SectionContainer 
        to perfectly match the edge-to-edge reference layout
      */}
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 max-w-[2560px] mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 lg:gap-6 items-stretch">
          
          {/* ── Slot 1 — large main banner (Left Column) ──────────────────────────────── */}
          <div className="relative w-full aspect-square lg:aspect-[1.12/1] overflow-hidden group">
            {loading ? (
              <BannerSkeleton className="absolute inset-0" />
            ) : slots[0] ? (
                <BannerTile banner={slots[0]} priority onOpen={openGallery} />
            ) : (
              <div className="absolute inset-0 bg-gray-50" />
            )}
            {/* Subtle overlay for interaction cue */}
            <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-500 z-20" />
          </div>

          {/* ── Right column — Slot 2 (top) + Slots 3 & 4 (bottom row) ──────── */}
          <div className="flex flex-col lg:grid lg:grid-rows-[1fr_1fr] gap-2 sm:gap-4 lg:gap-6">
            
            {/* Slot 2 (Top Row) */}
            <div className="relative overflow-hidden group w-full h-[250px] lg:h-full lg:min-h-0">
              {loading ? (
                <BannerSkeleton className="absolute inset-0" />
              ) : slots[1] ? (
                <BannerTile banner={slots[1]} onOpen={openGallery} />
              ) : (
                <div className="absolute inset-0 bg-gray-50" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-500 z-20" />
            </div>

            {/* Slots 3 & 4 (Bottom Row) */}
            {/* 3:2 width ratio (60% / 40%) handled implicitly by grid-cols-5 (col-span-3 vs col-span-2) */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4 lg:gap-6 w-full h-[200px] lg:h-full lg:min-h-0">
              
              {/* Slot 3 (Wider, Col-span 3) */}
              <div className="relative col-span-3 overflow-hidden group w-full h-full">
                {loading ? (
                  <BannerSkeleton className="absolute inset-0" />
                ) : slots[2] ? (
                  <BannerTile banner={slots[2]} onOpen={openGallery} />
                ) : (
                  <div className="absolute inset-0 bg-gray-50" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-500 z-20" />
              </div>
              
              {/* Slot 4 (Narrower, Col-span 2) */}
              <div className="relative col-span-2 overflow-hidden group w-full h-full">
                {loading ? (
                  <BannerSkeleton className="absolute inset-0" />
                ) : slots[3] ? (
                  <BannerTile banner={slots[3]} onOpen={openGallery} />
                ) : (
                  <div className="absolute inset-0 bg-gray-50" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-500 z-20" />
              </div>
              
            </div>

          </div>
        </div>

      </div>
      {/* Image gallery modal for viewing banners full-size */}
      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={closeGallery}
        images={galleryImages}
        currentImage={currentImage}
        onImageChange={(img) => setCurrentImage(img)}
        altText="Bannière"
      />
    </section>
  );
}

