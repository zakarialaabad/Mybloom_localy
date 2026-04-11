'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { sanitizeImageUrl } from '@/lib/utils';

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
  // Lock body scroll when gallery is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentIndex = images.indexOf(currentImage);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = currentIndex > 0 ? images[currentIndex - 1] : images[images.length - 1];
    onImageChange(prev);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = currentIndex < images.length - 1 ? images[currentIndex + 1] : images[0];
    onImageChange(next);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
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
      <div className="flex-1 relative w-full flex items-center justify-center mt-16 sm:mt-0 p-4 sm:p-12 overflow-hidden touch-pan-x">
        <div className="relative w-full h-full max-w-5xl mx-auto">
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
        </div>
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev} 
              className="absolute left-2 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all active:scale-95 hidden sm:flex pointer-events-auto"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-2 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all active:scale-95 hidden sm:flex pointer-events-auto"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Slider */}
      {images.length > 1 && (
        <div className="h-28 sm:h-32 w-full flex-shrink-0 flex items-center justify-center pb-4 sm:pb-6 relative z-10 pointer-events-auto">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto px-4 max-w-full scrollbar-hide py-2 snap-x snap-mandatory">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onImageChange(img)}
                className={`relative shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-md overflow-hidden transition-all duration-300 snap-center ${
                  currentImage === img 
                    ? 'ring-2 ring-white scale-105 opacity-100 shadow-xl' 
                    : 'opacity-40 hover:opacity-100 ring-1 ring-white/20 hover:scale-100'
                }`}
              >
                <Image src={sanitizeImageUrl(img)} alt={`Gallery thumbnail ${idx + 1}`} fill unoptimized className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}