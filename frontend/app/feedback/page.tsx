'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Star, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import ReviewModal from '@/components/ReviewModal';

export default function FeedbackPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    name: '',
    desc: '',
    image: ''
  });

  const openModal = (name: string, desc: string, image: string) => {
    setSelectedProduct({ name, desc, image });
    setIsModalOpen(true);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="flex flex-col lg:flex-row min-h-[800px]">
          
          {/* Left Column - Logo & Stars */}
          <div className="lg:w-1/2 bg-[#f4ece3] flex flex-col items-center justify-center p-12 relative">
            {/* Decorative Logo Frame */}
            <div className="relative w-80 h-80 mb-12">
              {/* Outer Frame */}
              <div className="absolute inset-0 border-2 border-[#cda873] m-4">
                {/* Corner Ornaments (Simplified CSS representation) */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#cda873]"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#cda873]"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#cda873]"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#cda873]"></div>
              </div>
              
              {/* Inner Circle & Logo */}
              <div className="absolute inset-8 border-4 border-[#cda873] rounded-full flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm shadow-2xl shadow-[#cda873]/20">
                <div className="text-center transform -translate-y-2">
                  <span className="block text-6xl font-serif font-bold text-[#cda873] tracking-tight italic leading-none">Bloom</span>
                  <span className="block text-4xl font-serif text-[#cda873] tracking-widest mt-1">Parfums</span>
                </div>
              </div>
            </div>

            {/* 5 Stars */}
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-8 h-8 fill-[#cda873] text-[#cda873]" />
              ))}
            </div>
          </div>

          {/* Right Column - Feedback Form */}
          <div className="lg:w-1/2 bg-[#fdfcfb] p-8 md:p-16 flex flex-col justify-center items-center">
            <div className="max-w-md w-full">
              
              {/* Star Icon Header */}
              <div className="w-16 h-16 bg-[#fdf8f1] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#f5eedf]">
                <div className="w-10 h-10 bg-[#fdf8f1] rounded-full flex items-center justify-center shadow-sm">
                  <Star className="w-5 h-5 fill-[#e8c99b] text-[#e8c99b]" />
                </div>
              </div>

              {/* Headings */}
              <div className="text-center mb-10">
                <h1 className="text-2xl font-serif font-bold text-gray-800 mb-3 tracking-wide">YOUR FEEDBACK</h1>
                <p className="text-gray-500 font-serif text-sm leading-relaxed">
                  Select a star rating for each product.<br />
                  Your feedback helps others and improves our products.
                </p>
              </div>

              {/* Products List */}
              <div className="bg-[#fdfbf5] border border-[#f5eedf] rounded-sm p-6 mb-10">
                
                {/* Product 1 (Rated) */}
                <div 
                  className="flex items-center justify-between py-4 border-b border-[#f5eedf] cursor-pointer hover:bg-[#fdf8f1] transition-colors px-2 -mx-2 rounded-sm"
                  onClick={() => openModal('SUGAR POP', 'Body Butter / Size 50ml', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=100')}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-white rounded-sm border border-gray-100 shrink-0">
                      <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=100" alt="Sugar Pop" fill className="object-cover mix-blend-multiply p-1" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-gray-900 text-sm">SUGAR POP</h4>
                        <span className="text-[10px] text-[#2e7d32] font-serif italic flex items-center gap-1">
                          Rated <CheckCircle2 className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="font-serif italic text-[10px] text-gray-400 mt-0.5">Body Butter / Size 50ml</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#cda873] font-serif italic block mb-1">Excellent</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-[#cda873] text-[#cda873]" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Product 2 (Rated) */}
                <div 
                  className="flex items-center justify-between py-4 border-b border-[#f5eedf] cursor-pointer hover:bg-[#fdf8f1] transition-colors px-2 -mx-2 rounded-sm"
                  onClick={() => openModal('OVER DOSE', 'Bold Body Mist / Size 50ml', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=100')}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-white rounded-sm border border-gray-100 shrink-0">
                      <Image src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=100" alt="Over Dose" fill className="object-cover mix-blend-multiply p-1" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-gray-900 text-sm">OVER DOSE</h4>
                        <span className="text-[10px] text-[#2e7d32] font-serif italic flex items-center gap-1">
                          Rated <CheckCircle2 className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="font-serif italic text-[10px] text-gray-400 mt-0.5">Bold Body Mist / Size 50ml</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#cda873] font-serif italic block mb-1">Good</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-[#cda873] text-[#cda873]" />
                      ))}
                      <Star className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  </div>
                </div>

                {/* Product 3 (Unrated) */}
                <div 
                  className="flex items-center justify-between py-4 cursor-pointer hover:bg-[#fdf8f1] transition-colors px-2 -mx-2 rounded-sm"
                  onClick={() => openModal('SUGAR POP', 'Body Butter / Size 50ml', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=100')}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-white rounded-sm border border-gray-100 shrink-0">
                      <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=100" alt="Sugar Pop" fill className="object-cover mix-blend-multiply p-1" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-gray-900 text-sm">SUGAR POP</h4>
                      <p className="font-serif italic text-[10px] text-gray-400 mt-0.5">Body Butter / Size 50ml</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-serif italic block mb-1">Rate this item</span>
                    <div className="flex gap-1 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 text-gray-300 hover:text-[#cda873] transition-colors" />
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Thank You Message */}
              <div className="text-center mb-8">
                <h4 className="font-serif font-bold text-[#8b7355] text-sm mb-1">Thank you for rating!</h4>
                <p className="text-gray-400 font-serif text-xs">Your feedback helps other fragrance lovers.</p>
              </div>

              {/* Action Button */}
              <Link 
                href="/"
                className="block w-full text-center bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-sm hover:bg-[#3a322d] transition-colors shadow-lg shadow-gray-200"
              >
                Continue Shopping ›
              </Link>

            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Review Modal */}
      <ReviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={selectedProduct.name}
        productDesc={selectedProduct.desc}
        productImage={selectedProduct.image}
      />
    </>
  );
}