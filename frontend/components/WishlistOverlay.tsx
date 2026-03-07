'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Heart, Grid, List, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

interface WishlistOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistOverlay({ isOpen, onClose }: WishlistOverlayProps) {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {/* Header / Close Button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 flex justify-end">
        <button 
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-400 mb-6 font-serif italic">
          <span>Home</span> / <span className="text-gray-900">Wishlist</span>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="text-sm text-gray-500 font-serif italic">
            08 Produits
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <button className="text-gray-900 hover:text-gray-900 transition-colors">
                <Grid className="h-5 w-5" />
              </button>
              <button className="hover:text-gray-900 transition-colors">
                <List className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 font-serif italic cursor-pointer group">
              <span>Sort by: <span className="text-gray-900">Relevance (Default)</span></span>
              <ChevronDown className="h-4 w-4 group-hover:text-gray-900 transition-colors" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
          {wishlistItems.map((item) => (
            <div key={item.id} className="relative group flex flex-col h-full">
              <div className="flex-grow">
                <ProductCard
                  id={item.id}
                  slug={`product-${item.id}`}
                  name={item.name}
                  subtitle={item.subtitle}
                  description={item.desc}
                  price={item.price}
                  originalPrice={item.oldPrice}
                  rating={item.rating}
                  reviewCount={item.reviews}
                  imageUrl={item.image}
                  badge={item.discount}
                />
              </div>
              <button className="w-full bg-[#4a403a] text-white py-3 rounded-sm font-serif italic text-sm hover:bg-[#3a322d] transition-colors mt-3 opacity-0 group-hover:opacity-100">
                Add to Bag ›
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
