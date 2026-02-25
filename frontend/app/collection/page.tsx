'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, Grid, List, ArrowLeftRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { productService, brandService, categoryService, Brand, Category, Product } from '@/services/api';
import ProductCard from '@/components/ui/ProductCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

function productToCard(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.brand?.name ?? '',
    description: p.subtitle ?? '',
    price: p.min_price ?? 0,
    originalPrice: p.min_price ?? 0,
    rating: p.avg_rating ?? 0,
    reviewCount: p.review_count ?? 0,
    imageUrl: p.primary_image ?? FALLBACK_IMG,
  };
}

export default function CollectionPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Fetch sidebar options on mount
  useEffect(() => {
    brandService.list().then(data => setBrands(data)).catch(() => {});
    categoryService.list().then(data => setCategories(data)).catch(() => {});
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    setLoadingProducts(true);
    const params: Record<string, unknown> = {};
    if (selectedBrands.length > 0) params['brand_ids[]'] = selectedBrands;
    if (selectedCategories.length > 0) params['category_ids[]'] = selectedCategories;
    productService.list(params)
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [selectedBrands, selectedCategories]);

  const toggleBrand = (id: number) =>
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  const toggleCategory = (id: number) =>
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

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
          <Link href="/">Home</Link> / <span className="text-gray-900">Collection</span>
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
                  {brands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedBrands.includes(brand.id) ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`}
                        onClick={() => toggleBrand(brand.id)}
                      >
                        {selectedBrands.includes(brand.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${selectedBrands.includes(brand.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {brand.name}
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
                {(() => {
                  const bars = [22,35,48,60,75,90,85,70,55,42,30,22,18,28,40,58,72,88,80,65,50,38,28,20,32,45,62,78,68,52];
                  return (
                    <div className="h-16 flex items-end gap-[1px] mb-2 px-2">
                      {bars.map((h, i) => (
                        <div key={i} className="flex-1 bg-[#d4af37] opacity-50" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  );
                })()}
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

              {/* Category Filter */}
              <div className="mb-6 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-4 cursor-pointer">
                  <h3 className="font-serif text-gray-700">Category</h3>
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedCategories.includes(cat.id) ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`}
                        onClick={() => toggleCategory(cat.id)}
                      >
                        {selectedCategories.includes(cat.id) && <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />}
                      </div>
                      <span className={`text-xs ${selectedCategories.includes(cat.id) ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {cat.name}
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
                    <span className="text-xs text-gray-500">Offre Speciales</span>
                  </label>
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-xs text-gray-400 font-serif italic">{products.length} Produits</div>
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
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-gray-100 rounded-sm animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-serif italic">No products found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                {products.map(p => (
                  <ProductCard key={p.id} {...productToCard(p)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}