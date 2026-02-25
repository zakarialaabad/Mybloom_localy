'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Grid, List, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { productService, Product } from '@/services/api';
import { getWishlist, removeFromWishlist } from '@/lib/wishlist';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getWishlist();
    if (ids.length === 0) { setLoading(false); return; }
    productService.list({ 'ids[]': ids })
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const handleRemove = (productId: number) => {
    removeFromWishlist(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

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
            {products.length} Produit{products.length !== 1 ? 's' : ''}
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

        {loading && (
          <p className="text-center text-gray-400 font-serif italic py-20">Loading wishlist…</p>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-serif italic">Your wishlist is empty.</p>
            <Link href="/collection" className="mt-4 inline-block text-sm text-gray-800 underline hover:text-aura-gold transition-colors font-serif italic">
              Browse products
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
            {products.map((product) => {
              const price = product.min_price ?? 0;
              const imageUrl = product.primary_image ?? FALLBACK_IMG;
              return (
                <div key={product.id} className="group flex flex-col">
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] w-full bg-[#f8f8f8] mb-4 overflow-hidden rounded-sm cursor-pointer">
                    {/* Remove from Wishlist */}
                    <div className="absolute top-3 left-3 z-10">
                      <button onClick={() => handleRemove(product.id)} className="text-red-500 hover:scale-110 transition-transform active:scale-95">
                        <Heart className="h-5 w-5 fill-current" />
                      </button>
                    </div>
                    {/* Image */}
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1 flex-grow">
                    <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-serif">{product.brand?.name}</p>
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">{product.subtitle}</p>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-bold text-gray-900">{price} DH</span>
                    </div>
                  </div>

                  {/* Add to Bag Button → goes to product page for size selection */}
                  <button
                    onClick={() => router.push(`/product/${product.slug}`)}
                    className="w-full bg-[#3d342f] text-white py-3.5 rounded-sm font-serif italic text-sm hover:bg-[#2d2622] transition-colors mt-auto active:scale-[0.98] shadow-sm"
                  >
                    Add to Bag ›
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
