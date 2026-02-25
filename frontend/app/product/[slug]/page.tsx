'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart, ShoppingCart, Share2, ChevronUp, ChevronDown,
  Truck, Clock, Banknote, Package, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { productService, Product, ProductSize } from '@/services/api';
import useCartStore from '@/store/cart';
import { isInWishlist, toggleWishlist } from '@/lib/wishlist';

// ─── Status labels for order status histories ─────────────────────────────────
const STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'shipped', 'delivered'];

export default function ProductPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const [product, setProduct]           = useState<Product | null>(null);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(false);
  const [mainImage, setMainImage]       = useState('');
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [wished, setWished]             = useState(false);
  const [quantity, setQuantity]         = useState(1);

  // Accordion states
  const [isDescriptionOpen,  setIsDescriptionOpen]  = useState(true);
  const [isIngredientsOpen,  setIsIngredientsOpen]  = useState(true);
  const [isDeliveryOpen,     setIsDeliveryOpen]     = useState(true);
  const [isReviewsOpen,      setIsReviewsOpen]      = useState(true);
  const [isFaqOpen,          setIsFaqOpen]          = useState(true);
  const [openFaqIndex,       setOpenFaqIndex]       = useState<number | null>(0);

  const addItem = useCartStore((s) => s.addItem);

  // ─── Fetch product ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setFetchError(false);

    productService.show(slug)
      .then((data) => {
        if (!mounted) return;
        setProduct(data);
        const primary = data.images?.find((i) => i.is_primary)?.image_url ?? data.images?.[0]?.image_url ?? data.primary_image;
        setMainImage(primary);
        if (data.sizes && data.sizes.length > 0) {
          const inStock = data.sizes.find((s) => s.stock_quantity > 0) ?? data.sizes[0];
          setSelectedSize(inStock);
        }
        setWished(isInWishlist(data.id));
      })
      .catch(() => { if (mounted) setFetchError(true); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [slug]);

  // ─── Wishlist toggle ────────────────────────────────────────────────────────
  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
    setWished((w) => !w);
  };

  // ─── Add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addItem({
      productId:   product.id,
      productName: product.name,
      slug:        product.slug,
      sizeId:      selectedSize.id,
      sizeLabel:   `${selectedSize.volume_ml}ml`,
      quantity,
      unitPrice:   selectedSize.price,
      imageUrl:    mainImage,
    });
  };

  // ─── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="font-serif italic text-gray-400 text-lg animate-pulse">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="font-serif italic text-gray-500 text-lg">Product not found.</p>
          <Link href="/collection" className="text-sm underline text-[#cda873]">Back to Collection</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images?.length
    ? product.images.map((i) => i.image_url)
    : [product.primary_image];

  const FAQ = [
    { q: 'Is this product suitable for all skin types?',   a: 'Yes, suitable for all skin types including sensitive skin.' },
    { q: 'How do I apply this fragrance?',                  a: 'Apply to pulse points: wrists, neck, and behind the ears.' },
    { q: 'How long does the scent last?',                   a: 'Typically 6–12 hours depending on skin type and conditions.' },
    { q: 'Does it leave a greasy feeling?',                 a: 'No, our formula absorbs cleanly without residue.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 sm:py-16 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link> /{' '}
          <Link href="/collection" className="hover:text-gray-900 transition-colors">{product.category?.name ?? 'Collection'}</Link> /{' '}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
          {/* ── Images ──────────────────────────────────────────────────────── */}
          <div className="flex w-full md:w-1/2 gap-4 sticky top-24">
            {/* Thumbnails */}
            <div className="hidden md:flex flex-col gap-4 w-24">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative aspect-square w-full overflow-hidden rounded-sm border-2 transition-all ${
                    mainImage === img ? 'border-gray-800' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1 aspect-square md:aspect-[4/5] rounded-sm overflow-hidden bg-[#f8f8f8]">
              <button className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-500 hover:bg-white transition-colors shadow-sm">
                <Share2 className="h-5 w-5" />
              </button>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-contain p-8 mix-blend-multiply"
              />
            </div>
          </div>

          {/* ── Details ─────────────────────────────────────────────────────── */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold uppercase tracking-wider text-gray-900">
                    {product.name}
                  </h1>
                  {product.badges?.includes('Best Seller') && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#fdf6e3] px-2.5 py-1 text-xs font-medium text-[#b8860b]">
                      ✨ Best seller
                    </span>
                  )}
                </div>
                <p className="font-serif italic text-gray-600 text-xl">{product.subtitle}</p>
                {product.brand && (
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{product.brand.name}</p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="font-serif text-2xl sm:text-3xl font-bold italic text-gray-900">
                    {selectedSize?.price ?? product.min_price} DH
                  </span>
                  {(selectedSize?.original_price ?? null) && (
                    <span className="font-serif text-lg sm:text-xl text-gray-400 line-through italic">
                      {selectedSize!.original_price} DH
                    </span>
                  )}
                </div>
                {product.review_count > 0 && (
                  <div className="mt-2 flex items-center justify-end gap-1">
                    <div className="flex text-[#d4af37]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`h-4 w-4 fill-current ${star <= Math.round(product.avg_rating) ? 'text-[#d4af37]' : 'text-gray-200'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium ml-1">
                      {product.avg_rating} ({product.review_count})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="mb-8 text-gray-600 leading-relaxed text-lg">{product.description}</p>
            )}

            <hr className="mb-8 border-gray-200" />

            {/* Actions */}
            <div className="mb-8 flex flex-wrap sm:flex-nowrap items-center gap-4">
              {/* Quantity */}
              <div className="flex h-14 w-32 items-center justify-between rounded-sm border border-gray-300 px-4 shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 hover:text-gray-900 text-2xl font-medium transition-colors">-</button>
                <span className="font-serif text-xl font-medium">{quantity}</span>
                <button
                  onClick={() => {
                    const max = selectedSize?.stock_quantity ?? 99;
                    setQuantity((q) => Math.min(max, q + 1));
                  }}
                  className="text-gray-500 hover:text-gray-900 text-2xl font-medium transition-colors"
                >+</button>
              </div>

              {/* Buy Now */}
              <button
                disabled={!selectedSize || selectedSize.stock_quantity === 0}
                onClick={handleAddToCart}
                className="flex h-14 flex-1 items-center justify-center rounded-sm bg-[#4a403a] px-8 text-white transition-colors hover:bg-[#3a322d] disabled:opacity-40 disabled:cursor-not-allowed min-w-[200px]"
              >
                <span className="font-serif italic text-xl">Buy It Now ›</span>
              </button>

              {/* Cart */}
              <button
                disabled={!selectedSize || selectedSize.stock_quantity === 0}
                onClick={handleAddToCart}
                className="flex h-14 w-14 items-center justify-center rounded-sm border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-6 w-6" />
              </button>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className="flex h-14 w-14 items-center justify-center rounded-sm border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 shrink-0"
              >
                <Heart className={`h-6 w-6 transition-colors ${wished ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            {/* Size Variants */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-12 grid grid-cols-3 gap-4">
                {product.sizes.map((size) => {
                  const outOfStock = size.stock_quantity === 0;
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      disabled={outOfStock}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      className={`relative flex flex-col items-center justify-center rounded-sm border-2 py-4 transition-colors ${
                        outOfStock
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                          : isSelected
                          ? 'border-[#4a403a] bg-white'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {outOfStock && (
                        <div className="absolute -top-3 bg-gray-200 px-3 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 rounded-sm">
                          ÉPUISÉ
                        </div>
                      )}
                      <span className={`font-serif text-xl font-bold italic ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        {size.volume_ml}ml
                      </span>
                      <span className={`font-serif text-base italic ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                        {size.price} DH
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Accordion: Description */}
            <div className="border-t border-gray-200 pt-6 mt-12">
              <button onClick={() => setIsDescriptionOpen(!isDescriptionOpen)} className="flex w-full items-center justify-between text-left group">
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Description</span>
                {isDescriptionOpen ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
              </button>
              {isDescriptionOpen && (
                <div className="mt-6 text-base leading-relaxed text-gray-600">
                  {product.description || 'No description available.'}
                </div>
              )}
            </div>

            {/* Accordion: Delivery & Returns (static) */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button onClick={() => setIsDeliveryOpen(!isDeliveryOpen)} className="flex w-full items-center justify-between text-left group">
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Delivery & Returns</span>
                {isDeliveryOpen ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
              </button>
              {isDeliveryOpen && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    { icon: <Truck className="h-6 w-6" />,    title: 'Fast Dispatch',      desc: 'Orders dispatched within 24 hours.' },
                    { icon: <Clock className="h-6 w-6" />,    title: 'Delivery Time',      desc: 'Delivered within 1–3 business days.' },
                    { icon: <Banknote className="h-6 w-6" />, title: 'Cash on Delivery',   desc: 'Pay conveniently upon delivery.' },
                    { icon: <Package className="h-6 w-6" />,  title: 'Returns & Refunds',  desc: 'Refund or replacement if damaged.' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-700">{icon}</div>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-gray-900">{title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion: Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <button onClick={() => setIsReviewsOpen(!isReviewsOpen)} className="flex w-full items-center justify-between text-left group">
                  <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">
                    Reviews ({product.review_count})
                  </span>
                  {isReviewsOpen ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
                </button>
                {isReviewsOpen && (
                  <div className="mt-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12">
                      <div className="text-center">
                        <div className="text-6xl font-serif italic text-gray-900 mb-2">{product.avg_rating.toFixed(1)}</div>
                        <div className="flex text-[#d4af37] justify-center mb-1">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} className={`h-5 w-5 fill-current ${s <= Math.round(product.avg_rating) ? '' : 'text-gray-200'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">{product.review_count} au total</div>
                      </div>
                    </div>
                    <div className="relative flex gap-4 overflow-x-auto pb-4 snap-x">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="min-w-[260px] snap-center rounded-xl border border-gray-200 p-4 flex flex-col">
                          {review.images?.[0] && (
                            <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4 bg-gray-100">
                              <Image src={review.images[0].image_url} alt="Review" fill className="object-cover" />
                            </div>
                          )}
                          <p className="text-sm text-gray-600 flex-grow mb-3 line-clamp-3">{review.body}</p>
                          <div className="text-center border-t pt-3">
                            <h5 className="font-serif font-bold text-gray-900 text-sm">{review.reviewer_name}</h5>
                            <div className="flex text-[#d4af37] justify-center my-1">
                              {[1,2,3,4,5].map((s) => (
                                <svg key={s} className={`h-3 w-3 fill-current ${s <= review.rating ? '' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('fr-MA')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: FAQ (static) */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button onClick={() => setIsFaqOpen(!isFaqOpen)} className="flex w-full items-center justify-between text-left group">
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">FAQ</span>
                {isFaqOpen ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
              </button>
              {isFaqOpen && (
                <div className="mt-6 space-y-4">
                  {FAQ.map((faq, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                      <button onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)} className="flex w-full items-center justify-between text-left">
                        <span className="font-serif text-lg font-bold italic text-gray-900">{faq.q}</span>
                        {openFaqIndex === idx ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </button>
                      {openFaqIndex === idx && (
                        <p className="mt-3 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
