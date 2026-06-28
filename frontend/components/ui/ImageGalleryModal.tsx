'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { sanitizeImageUrl } from '@/lib/utils';
import useMouseDragScroll from '@/hooks/useMouseDragScroll';

export interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentImage: string;
  onImageChange: (image: string) => void;
  altText?: string;
}

export default function ImageGalleryModal({
  isOpen,
  onClose,
  images,
  currentImage,
  onImageChange,
  altText = "Gallery image"
}: ImageGalleryModalProps) {
  const thumbsRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const [canScrollThumbsLeft, setCanScrollThumbsLeft] = useState(false);
  const [canScrollThumbsRight, setCanScrollThumbsRight] = useState(false);
  useMouseDragScroll(thumbsRef, { ignoreInteractiveElements: false });
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const currentIndex = images.indexOf(currentImage);
  const hasMultipleImages = images.length > 1;

  const showPreviousImage = () => {
    if (!hasMultipleImages) return;
    const prev = currentIndex > 0 ? images[currentIndex - 1] : images[images.length - 1];
    onImageChange(prev);
  };

  const showNextImage = () => {
    if (!hasMultipleImages) return;
    const next = currentIndex < images.length - 1 ? images[currentIndex + 1] : images[0];
    onImageChange(next);
  };

  const updateThumbArrows = () => {
    const el = thumbsRef.current;
    if (!el) return;
    setCanScrollThumbsLeft(el.scrollLeft > 4);
    setCanScrollThumbsRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollThumbs = (dir: 'left' | 'right') => {
    const el = thumbsRef.current;
    if (!el) return;
    const thumb = el.querySelector('button');
    const thumbWidth = thumb instanceof HTMLElement ? thumb.clientWidth : 80;
    const style = window.getComputedStyle(el);
    const gap = Number.parseFloat(style.columnGap || style.gap || '0') || 0;
    const step = (thumbWidth + gap) * 3;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  const handlePointerStart = (clientX: number) => {
    setDragStartX(clientX);
  };

  const handlePointerEnd = (clientX: number) => {
    if (dragStartX === null || !hasMultipleImages) return;

    const deltaX = clientX - dragStartX;
    if (Math.abs(deltaX) < 40) {
      setDragStartX(null);
      return;
    }

    if (deltaX > 0) {
      showPreviousImage();
    } else {
      showNextImage();
    }

    setDragStartX(null);
  };

  // Lock body scroll when gallery is open & hide mobile nav bar
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (window.innerWidth < 768) {
        window.dispatchEvent(new CustomEvent('image-gallery-change', { detail: { isOpen: true } }));
      }
    } else {
      document.body.style.overflow = 'unset';
      if (window.innerWidth < 768) {
        window.dispatchEvent(new CustomEvent('image-gallery-change', { detail: { isOpen: false } }));
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (window.innerWidth < 768) {
        window.dispatchEvent(new CustomEvent('image-gallery-change', { detail: { isOpen: false } }));
      }
    };
  }, [isOpen]);

  // Keyboard support: Esc to close, left/right to navigate
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      const currentIndex = images.indexOf(currentImage);
      if (e.key === 'ArrowLeft') {
        showPreviousImage();
      }
      if (e.key === 'ArrowRight') {
        showNextImage();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentImage, hasMultipleImages, images, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || images.length <= 1) return;

    const syncTimer = window.setTimeout(() => {
      updateThumbArrows();
      const activeThumb = thumbsRef.current?.querySelector('[data-active-thumbnail="true"]');
      if (activeThumb instanceof HTMLElement) {
        activeThumb.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
    }, 50);

    return () => window.clearTimeout(syncTimer);
  }, [currentImage, images.length, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setDragStartX(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    showPreviousImage();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    showNextImage();
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* Top bar with Close & Counter */}
      <div className="flex items-center justify-between p-4 sm:p-6 text-white/70 absolute top-0 w-full z-10 pointer-events-none">
        {images.length > 0 ? (
          <span className="text-sm font-medium tracking-widest bg-black/50 px-3 py-1 rounded-full pointer-events-auto">
            {currentIndex >= 0 ? currentIndex + 1 : 1} / {images.length}
          </span>
        ) : <span />}
        <button
          onClick={onClose}
          className="p-2.5 bg-black/50 hover:text-white hover:bg-white/20 rounded-full transition-all active:scale-95 pointer-events-auto"
          aria-label="Close gallery"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 relative w-full mt-16 overflow-hidden p-4 sm:mt-0 sm:p-12">
        <div
          ref={mainImageRef}
          className="relative mx-auto flex h-full w-full max-w-5xl items-center justify-center touch-pan-x cursor-grab select-none"
          onMouseDown={(e) => handlePointerStart(e.clientX)}
          onMouseUp={(e) => handlePointerEnd(e.clientX)}
          onMouseLeave={(e) => {
            if (dragStartX !== null) {
              handlePointerEnd(e.clientX);
            }
          }}
          onTouchStart={(e) => handlePointerStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const touch = e.changedTouches[0];
            if (touch) {
              handlePointerEnd(touch.clientX);
            }
          }}
        >
          {currentImage && (
            <Image
              src={sanitizeImageUrl(currentImage)}
              alt={altText}
              fill
              unoptimized
              className="object-contain"
              quality={100}
              priority
            />
          )}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 z-10 flex -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 pointer-events-auto sm:left-6 sm:p-3"
                aria-label="Show previous review image"
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 pointer-events-auto sm:right-6 sm:p-3"
                aria-label="Show next review image"
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnails Slider */}
      {images.length > 1 && (
        <div className="relative z-10 h-28 w-full flex-shrink-0 pointer-events-auto sm:h-32">
          <div className="flex h-full items-center justify-center pb-4 sm:pb-6">
          <button
            onClick={() => scrollThumbs('left')}
            disabled={!canScrollThumbsLeft}
            className="absolute left-2 top-1/2 z-10 -translate-y-[calc(50%+0.375rem)] rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 disabled:pointer-events-none disabled:opacity-0 sm:left-6 sm:-translate-y-1/2"
            aria-label="Scroll gallery thumbnails left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div
            ref={thumbsRef}
            onScroll={updateThumbArrows}
            className="flex max-w-full gap-3 overflow-x-auto px-10 py-2 scrollbar-hide snap-x snap-mandatory touch-pan-x cursor-grab select-none sm:gap-4 sm:px-16"
          >
            {images.map((img, idx) => {
              const isActive = currentImage === img;
              return (
                <button
                  key={idx}
                  data-active-thumbnail={isActive ? 'true' : 'false'}
                  onClick={() => onImageChange(img)}
                  className={`relative h-20 w-16 shrink-0 cursor-inherit snap-center overflow-hidden rounded-md transition-all duration-300 sm:h-24 sm:w-20 ${
                    isActive
                      ? 'ring-2 ring-white scale-105 opacity-100 shadow-xl'
                      : 'opacity-40 hover:opacity-100 ring-1 ring-white/20 hover:scale-100'
                  }`}
                >
                  <Image src={sanitizeImageUrl(img)} alt={`Gallery thumbnail ${idx + 1}`} fill unoptimized className="object-cover" />
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scrollThumbs('right')}
            disabled={!canScrollThumbsRight}
            className="absolute right-2 top-1/2 z-10 -translate-y-[calc(50%+0.375rem)] rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 disabled:pointer-events-none disabled:opacity-0 sm:right-6 sm:-translate-y-1/2"
            aria-label="Scroll gallery thumbnails right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
