'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Grid, List, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LoadingSpinner } from '@/components/Skeleton';
import { productService, Product } from '@/services/api';
import { getWishlist, removeFromWishlist } from '@/lib/wishlist';
import ProductCard from '@/components/ui/ProductCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getWishlist();
    if (ids.length === 0) { setLoading(false); return; }
    productService.list({ ids })
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
      {loading && <LoadingSpinner />}
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
              return (
                <div key={product.id} className="relative flex flex-col h-full group">
                  <div className="flex-grow">
                    <ProductCard
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      subtitle={product.brand?.name || ''}
                      description={product.subtitle || ''}
                      price={product.min_price ?? 0}
                      originalPrice={product.original_price ?? 0}
                      rating={product.avg_rating ?? 0}
                      reviewCount={product.review_count ?? 0}
                      imageUrl={product.primary_image ?? FALLBACK_IMG}
                    />
                  </div>
                  {/* Remove from Wishlist specific to this page */}
                  <div className="absolute top-3 left-3 z-20">
                    <button onClick={() => handleRemove(product.id)} className="bg-white/80 p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-white transition-all shadow-sm">
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                  {/* Add to Bag Button → goes to product page for size selection */}
                  <button
                    onClick={() => router.push(`/product/${product.slug}`)}
                    className="w-full bg-[#3d342f] text-white py-3 rounded-sm font-serif italic text-sm hover:bg-[#2d2622] transition-colors mt-3 active:scale-[0.98] shadow-sm opacity-0 group-hover:opacity-100"
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
