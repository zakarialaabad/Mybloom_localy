'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, Grid, List, Heart, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CollectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Banner */}
      <div className="w-full relative h-[200px] md:h-[300px] bg-[#5a1818]">
        <Image 
          src="/Valentines-image.png" 
          alt="Special Valentines Offer" 
          fill 
          className="object-cover" 
          priority
        />
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-400 mb-8 font-serif italic">
          <span>Home</span> / <span>Women</span> / <span>Cream</span> / <span className="text-gray-900">SugarPop</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-[#fcfcfc] p-6 rounded-sm">
              <h2 className="font-serif text-gray-500 mb-6">Filter</h2>
              
              {/* Brand Filter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Brand</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search brand..." 
                    className="w-full bg-white border border-gray-200 rounded-sm py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-gray-300" 
                  />
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Boss', count: 12, checked: true },
                    { name: 'Prada', count: 58 },
                    { name: 'Lancome', count: 10 },
                    { name: 'Dior', count: 28 },
                    { name: 'Chanel', count: 20 },
                    { name: 'Balenciaga', count: 86 },
                    { name: 'Versace', count: 22 },
                    { name: 'Sauvage', count: 17 },
                  ].map(brand => (
                    <label key={brand.name} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${brand.checked ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`}>
                        {brand.checked && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${brand.checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {brand.name} <span className="text-gray-400">({brand.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Price</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                {/* Histogram mockup */}
                <div className="h-16 flex items-end gap-[1px] mb-2 px-2">
                  {Array.from({length: 30}).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-[#d4af37] opacity-50" 
                      style={{ height: `${Math.max(10, Math.random() * 100)}%` }} 
                    />
                  ))}
                </div>
                {/* Slider mockup */}
                <div className="relative h-1 bg-gray-200 rounded-full mb-6 mx-2">
                  <div className="absolute left-1/4 right-1/4 h-full bg-[#d4af37]" />
                  <div className="absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-gray-300 rounded-full shadow-sm cursor-pointer" />
                  <div className="absolute right-1/4 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white border border-gray-300 rounded-full shadow-sm cursor-pointer" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 mb-1 text-center">Minimum</div>
                    <div className="border border-gray-200 rounded-sm py-1 text-center text-xs text-gray-600">80 MAD</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 mb-1 text-center">Maximum</div>
                    <div className="border border-gray-200 rounded-sm py-1 text-center text-xs text-gray-600">400 MAD</div>
                  </div>
                </div>
              </div>

              {/* Gender Filter */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Gender</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Woman', count: 110, checked: true },
                    { name: 'Man', count: 84 },
                    { name: 'Child', count: 20 },
                  ].map(gender => (
                    <label key={gender.name} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${gender.checked ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`}>
                        {gender.checked && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${gender.checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {gender.name} <span className="text-gray-400">({gender.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Category</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Nouveautes', count: 119, checked: true },
                    { name: 'Visage', count: 40 },
                    { name: 'Corps', count: 28 },
                    { name: 'Parfums', count: 28 },
                    { name: 'Skincare', count: 21 },
                    { name: 'Marques', count: 28 },
                  ].map(cat => (
                    <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${cat.checked ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`}>
                        {cat.checked && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${cat.checked ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {cat.name} <span className="text-gray-400">({cat.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes Filter */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Notes</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-[#fdf6e3] text-[#b8860b] px-3 py-1 rounded-sm text-xs font-medium">Tout</button>
                  <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-sm text-xs flex items-center gap-1 hover:bg-gray-200">
                    <span className="text-[10px]">★</span> 5.0
                  </button>
                  <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-sm text-xs flex items-center gap-1 hover:bg-gray-200">
                    <span className="text-[10px]">★</span> 4.0
                  </button>
                </div>
              </div>

              {/* Promotions Filter */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Promotions</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-gray-400"></div>
                    <span className="text-xs text-gray-500">Offre Speciales <span className="text-gray-400">(92)</span></span>
                  </label>
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-xs text-gray-400 font-serif italic">140 Produits</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <button className="text-gray-900 hover:text-gray-900 transition-colors"><Grid className="h-4 w-4" /></button>
                  <button className="hover:text-gray-900 transition-colors"><List className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-serif italic cursor-pointer group">
                  <span>Sort by: <span className="text-gray-900">Relevance (Default)</span></span>
                  <ChevronDown className="h-3 w-3 group-hover:text-gray-900 transition-colors" />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="group flex flex-col">
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] w-full bg-[#f8f8f8] mb-4 overflow-hidden rounded-sm">
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10">
                      <button className="text-red-500 hover:scale-110 transition-transform">
                        <Heart className={`h-4 w-4 ${i === 0 || i === 1 ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    {i !== 0 && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-[#fdf6e3] text-[#b8860b] text-[10px] font-medium px-2 py-1 rounded-sm">
                          - 30 %
                        </span>
                      </div>
                    )}
                    {/* Image */}
                    <Image 
                      src={i === 1 ? "https://images.unsplash.com/photo-1615397323744-8d2111111111?auto=format&fit=crop&q=80&w=400" : "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400"} 
                      alt="Product" 
                      fill 
                      className="object-contain p-4 mix-blend-multiply" 
                    />
                    
                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <div className="bg-white rounded-full px-4 py-2 flex items-center gap-4 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <button className="text-gray-600 hover:text-gray-900"><ShoppingCart className="h-4 w-4" /></button>
                        <button className="text-gray-600 hover:text-gray-900"><Search className="h-4 w-4" /></button>
                        <button className="text-gray-600 hover:text-gray-900"><ArrowLeftRight className="h-4 w-4" /></button>
                        <button className="text-gray-600 hover:text-gray-900"><Heart className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 flex-grow">
                    <h3 className="font-serif font-bold text-sm text-gray-900">Over Dose</h3>
                    <p className="text-[11px] text-gray-400">Bold Body Mist</p>
                    <p className="text-xs text-gray-500 mt-2">Warm & Sensual Fragrance</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-sm text-gray-900">140 DH</span>
                      {i !== 0 && <span className="text-[11px] text-gray-400 line-through">200 DH</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex text-[#d4af37]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">4.4 (180)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
