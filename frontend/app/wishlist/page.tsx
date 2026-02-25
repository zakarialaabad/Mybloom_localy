'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Grid, List, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function WishlistPage() {
  const wishlistItems = Array(8).fill({
    id: 1,
    name: 'Over Dose',
    subtitle: 'Bold Body Mist',
    desc: 'Warm & Sensual Fragrance',
    price: 140,
    oldPrice: 200,
    rating: 4.4,
    reviews: 180,
    discount: '- 30 %',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400'
  }).map((item, index) => ({ ...item, id: index + 1 }));
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-500 font-serif italic">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link> /{' '}
          <span className="text-gray-900">Wishlist</span>
        </nav>
        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div className="text-sm font-serif italic text-gray-500">
            08 Produits
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <button className="text-gray-900 hover:text-gray-900 transition-colors">
                <Grid className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-900 transition-colors">
                <List className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 font-serif italic cursor-pointer group hover:text-gray-900 transition-colors">
              <span>Sort by: <span className="text-gray-900 font-bold not-italic">Relevance (Default)</span></span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group flex flex-col">
              {/* Image Container */}
              <div className="relative aspect-[4/5] w-full bg-[#f8f8f8] mb-4 overflow-hidden rounded-sm cursor-pointer">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10">
                  <button className="text-red-500 hover:scale-110 transition-transform active:scale-95">
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-[#fdf6e3] text-[#b8860b] text-[10px] font-bold px-2 py-1 rounded-sm">
                    {item.discount}
                  </span>
                </div>
                {/* Image */}
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  fill 
                  className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Details */}
              <div className="space-y-1 flex-grow">
                <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight">{item.name}</h3>
                <p className="text-xs text-gray-400 font-serif">{item.subtitle}</p>
                <div className="pt-2">
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">{item.desc}</p>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-bold text-gray-900">{item.price} DH</span>
                  <span className="text-sm text-gray-400 line-through decoration-gray-300">{item.oldPrice} DH</span>
                </div>
                <div className="flex items-center gap-1 mt-2 mb-4">
                  <div className="flex text-[#d4af37]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium ml-0.5">{item.rating} ({item.reviews})</span>
                </div>
              </div>

              {/* Add to Bag Button */}
              <button className="w-full bg-[#3d342f] text-white py-3.5 rounded-sm font-serif italic text-sm hover:bg-[#2d2622] transition-colors mt-auto active:scale-[0.98] shadow-sm">
                Add to Bag ›
              </button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
