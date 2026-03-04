'use client';

import { X, Star, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productDesc: string;
  productImage: string;
  onSubmit?: (rating: number, body: string, images: File[]) => Promise<void>;
  isSubmitting?: boolean;
  errorMsg?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productName,
  productDesc,
  productImage,
  onSubmit,
  isSubmitting,
  errorMsg,
}: ReviewModalProps) {
  const [isMounted, setIsMounted]         = useState(false);
  const [rating, setRating]               = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText]       = useState('');
  const [images, setImages]               = useState<File[]>([]);
  const [previews, setPreviews]           = useState<string[]>([]);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  // Reset all state every time the modal closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoveredRating(0);
      setReviewText('');
      previews.forEach((url) => URL.revokeObjectURL(url));
      setImages([]);
      setPreviews([]);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const next = [...images, ...files].slice(0, 4);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    console.log('[ReviewModal] Submit clicked — rating:', rating, 'images:', images.length);
    if (rating === 0) {
      console.warn('[ReviewModal] Submit blocked: no star rating selected');
      return;
    }
    if (!onSubmit) {
      console.warn('[ReviewModal] Submit blocked: onSubmit prop is not provided');
      return;
    }
    console.log('[ReviewModal] Calling onSubmit...');
    onSubmit(rating, reviewText, images);
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-white w-full max-w-[480px] shadow-2xl flex flex-col transform transition-all duration-300 pointer-events-auto max-h-[90vh] overflow-y-auto ${
            isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="p-8 pb-6 relative border-b border-gray-200 shrink-0">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] font-serif uppercase mb-2">SHARE YOUR THOUGHTS</p>
            <h2 className="text-2xl font-serif font-bold text-gray-800">{productName}</h2>
            <p className="font-serif italic text-sm text-gray-400 mt-1">{productDesc}</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-10">

            {/* Rate Experience */}
            <div className="flex gap-6 items-center">
              {productImage && (
                <div className="relative w-20 h-20 bg-gray-50 rounded-sm border border-gray-100 shrink-0">
                  <Image src={productImage} alt={productName} fill className="object-cover mix-blend-multiply p-2" />
                </div>
              )}
              <div>
                <h3 className="text-[10px] font-bold text-gray-800 tracking-[0.2em] font-serif uppercase mb-3">RATE THE EXPERIENCE</h3>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        star <= (hoveredRating || rating) ? 'fill-[#e8c99b] text-[#e8c99b]' : 'fill-gray-100 text-gray-200'
                      }`}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <p className="font-serif italic text-xs text-gray-400">
                  {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''} selected` : 'Tap a star to rate'}
                </p>
              </div>
            </div>

            {/* Details Input */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-800 tracking-[0.2em] font-serif uppercase mb-4">THE DETAILS</h3>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe the notes, the longevity, the feeling…"
                className="w-full border border-gray-200 focus:border-gray-400 focus:outline-none resize-none font-serif italic text-sm text-gray-700 placeholder:text-gray-300 min-h-[100px] p-3 rounded-sm transition-colors"
              />
            </div>

            {/* Photography */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-800 tracking-[0.2em] font-serif uppercase mb-4">PHOTOGRAPHY</h3>

              {/* Hidden real file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-wrap items-center gap-3">
                {/* Image previews */}
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-sm border border-gray-200 overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}

                {/* Add button — hidden once 4 images selected */}
                {images.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#cda873] hover:text-[#cda873] transition-colors rounded-sm"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[9px] font-serif mt-0.5">Add</span>
                  </button>
                )}
              </div>

              {images.length > 0 && (
                <p className="text-[10px] text-gray-400 font-serif italic mt-2">
                  {images.length}/4 photo{images.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Error message */}
            {errorMsg && (
              <p className="text-sm text-red-500 font-serif italic text-center bg-red-50 border border-red-200 rounded-sm py-2 px-3">
                {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="w-full bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-sm hover:bg-[#3a322d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publication…' : 'Publish review ›'}
            </button>

            {rating === 0 && (
              <p className="text-center text-[10px] text-gray-400 font-serif italic -mt-6">
                Select a star rating to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
