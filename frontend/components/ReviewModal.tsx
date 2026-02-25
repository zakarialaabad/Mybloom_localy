'use client';

import { X, Star, Plus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productDesc: string;
  productImage: string;
  onSubmit?: (rating: number, body: string) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ReviewModal({ isOpen, onClose, productName, productDesc, productImage, onSubmit, isSubmitting }: ReviewModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none`}>
        <div 
          className={`bg-white w-full max-w-[480px] shadow-2xl flex flex-col transform transition-all duration-300 pointer-events-auto ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
        >
          {/* Header */}
          <div className="p-8 pb-6 relative border-b border-gray-200">
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
              <div className="relative w-20 h-20 bg-gray-50 rounded-sm border border-gray-100 shrink-0">
                <Image src={productImage} alt={productName} fill className="object-cover mix-blend-multiply p-2" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-gray-800 tracking-[0.2em] font-serif uppercase mb-3">RATE THE EXERIENCE</h3>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-6 h-6 cursor-pointer transition-colors ${
                        star <= (hoveredRating || rating) 
                          ? 'fill-[#e8c99b] text-[#e8c99b]' 
                          : 'fill-gray-100 text-gray-200'
                      }`}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <p className="font-serif italic text-xs text-gray-400">Tap a star to rate</p>
              </div>
            </div>

            {/* Details Input */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-800 tracking-[0.2em] font-serif uppercase mb-4">THE DETAILS</h3>
              <textarea 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe the notes, the longevity, the feeling ..."
                className="w-full border-none focus:outline-none resize-none font-serif italic text-sm text-gray-700 placeholder:text-gray-300 min-h-[80px]"
              />
            </div>

            {/* Photography */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-800 tracking-[0.2em] font-serif uppercase mb-4">PHOTOGRAPHY</h3>
              <div className="flex items-center gap-4">
                <button className="w-12 h-12 border border-gray-200 flex items-center justify-center text-gray-300 hover:border-gray-400 hover:text-gray-500 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <span className="font-serif italic text-sm text-gray-400">Upload Image</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => onSubmit && rating > 0 && onSubmit(rating, reviewText)}
              disabled={!rating || isSubmitting}
              className="w-full bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-sm hover:bg-[#3a322d] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publication…' : 'Publish review ›'}
            </button>

          </div>
        </div>
      </div>
    </>
  );
}