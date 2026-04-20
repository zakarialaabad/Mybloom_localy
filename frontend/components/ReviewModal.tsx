'use client';

import { X, Star, Plus } from 'lucide-react';
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
  initialRating?: number;
  initialReviewText?: string;
  initialImages?: File[];
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
  initialRating = 0,
  initialReviewText = '',
  initialImages = [],
}: ReviewModalProps) {
  const [isMounted, setIsMounted]         = useState(false);
  const [rating, setRating]               = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText]       = useState('');
  const [images, setImages]               = useState<File[]>([]);
  const [previews, setPreviews]           = useState<string[]>([]);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setReviewText(initialReviewText);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setImages(initialImages);
      const newPreviews = initialImages.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
      setHoveredRating(0);
    } else {
      setRating(0);
      setReviewText('');
      setImages([]);
      setPreviews([]);
    }
  }, [isOpen, initialRating, initialReviewText, initialImages]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (rating === 0) return;
    if (!onSubmit) return;
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
      <div className={`fixed inset-0 z-[101] flex items-center justify-center p-4 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`bg-white w-full max-w-[340px] md:max-w-[420px] shadow-xl flex flex-col transform transition-all duration-300 relative max-h-[90vh] ${
            isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Contenu scrollable */}
          <div className="overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-7">

            {/* En-tête */}
            <div className="text-left border-b border-gray-200 pb-5">
              <p className="text-[9px] font-bold tracking-[0.2em] font-serif uppercase text-gray-500 mb-1.5">
                PARTAGEZ VOTRE AVIS
              </p>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1 leading-tight">{productName}</h2>
              <p className="font-serif italic text-[11px] text-gray-500">{productDesc}</p>
            </div>

            {/* Section note */}
            <div className="flex gap-5 items-start">
              {productImage && (
                <div className="relative w-20 h-20 bg-gray-50 shrink-0">
                  <Image src={productImage} alt={productName} fill className="object-cover mix-blend-multiply p-2" />
                </div>
              )}
              <div className="pt-0.5">
                <p className="text-[9px] font-bold tracking-[0.2em] font-serif uppercase text-gray-800 mb-2.5">
                  ÉVALUEZ L&apos;EXPÉRIENCE
                </p>
                <div className="flex gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 cursor-pointer transition-colors ${
                        star <= (hoveredRating || rating) ? 'fill-[#e8c99b] text-[#e8c99b]' : 'fill-[#f3f4f6] text-[#e5e7eb]'
                      }`}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <p className="font-serif italic text-[10px] text-gray-400">
                  {rating > 0 ? 'Merci pour votre note !' : 'Appuyez sur une étoile pour noter'}
                </p>
              </div>
            </div>

            {/* Section détails */}
            <div className="border-b border-gray-100 pb-6">
              <p className="text-[9px] font-bold tracking-[0.2em] font-serif uppercase text-gray-800 mb-3">
                LES DÉTAILS
              </p>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Décrivez les notes, la longévité, le ressenti…"
                className="w-full font-serif italic text-[13px] text-gray-700 placeholder:text-gray-300 resize-none outline-none min-h-[40px] bg-transparent"
                rows={2}
              />
            </div>

            {/* Section photos */}
            <div>
              <p className="text-[9px] font-bold tracking-[0.2em] font-serif uppercase text-gray-800 mb-4">
                PHOTOGRAPHIES
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex flex-wrap items-center gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-12 h-12 border border-gray-200 overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="aperçu" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}

                {images.length < 4 && (
                  <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-gray-300 group-hover:text-gray-400 transition-colors">
                      <Plus className="w-5 h-5 stroke-[1px]" />
                    </div>
                    <span className="font-serif italic text-[13px] text-gray-500 group-hover:text-gray-700">
                      Ajouter une image
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Message d'erreur */}
            {errorMsg && (
              <p className="text-xs text-red-500 font-serif italic text-center">{errorMsg}</p>
            )}

            {/* Bouton publier */}
            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-[#4a403a] text-white py-3.5 rounded-[4px] font-serif italic text-[13px] hover:bg-[#3a322d] transition-colors flex justify-center items-center gap-1 disabled:opacity-70"
              >
                {isSubmitting ? 'Publication en cours…' : 'Publier mon avis ›'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}