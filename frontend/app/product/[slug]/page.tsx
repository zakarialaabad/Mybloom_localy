'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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
  const [reviewPage,         setReviewPage]         = useState(0);
  const [ingredientPage,     setIngredientPage]     = useState(0);

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
        } else {
          // No size variants — create a virtual default so buttons are never disabled
          setSelectedSize({
            id: 0,
            volume_ml: 0,
            price: data.min_price ?? 0,
            original_price: data.original_price ?? null,
            stock_quantity: 99,
            sku: '',
          });
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
    // volume_ml === 0 means it's a virtual size (no real size variants)
    const sizeLabel = selectedSize.volume_ml > 0
      ? `${selectedSize.volume_ml}ml`
      : null;
    addItem({
      productId:   product.id,
      productName: product.name,
      slug:        product.slug,
      sizeId:      selectedSize.id,
      sizeLabel,
      quantity,
      unitPrice:   selectedSize.price,
      imageUrl:    mainImage,
    });
  };

  const handleBuyNow = () => {
    if (!product || !selectedSize) return;
    const sizeLabel = selectedSize.volume_ml > 0
      ? `${selectedSize.volume_ml}ml`
      : null;
    addItem({
      productId:   product.id,
      productName: product.name,
      slug:        product.slug,
      sizeId:      selectedSize.id,
      sizeLabel,
      quantity,
      unitPrice:   selectedSize.price,
      imageUrl:    mainImage,
    });
    router.push('/checkout');
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

  const FAQ = (product.faqs && product.faqs.length > 0)
    ? product.faqs.map((f) => ({ q: f.question, a: f.answer }))
    : [
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

        {/* Product Layout */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
          
          {/* ── Product Info Header (Desktop: Left Column Top, Mobile: Full Width Top) ── */}
          <div className="w-full md:hidden flex flex-col">
            {/* Row 1: Product Name <-> Reviews */}
            <div className="flex items-start justify-between">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wider text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.review_count > 0 && (
                <div className="flex items-center gap-1 shrink-0 ml-4 pt-1">
                  <div className="flex text-[#d4af37]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`h-3 w-3 fill-current ${star <= Math.round(product.avg_rating) ? 'text-[#d4af37]' : 'text-gray-200'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-900 font-bold ml-1 italic">{product.avg_rating}</span>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">({product.review_count})</span>
                </div>
              )}
            </div>

            {/* Row 2: Brand Name <-> Price */}
            <div className="flex items-baseline justify-between transition-all">
              {product.brand && (
                <p className="font-serif italic text-gray-600 text-xl leading-none">{product.brand.name}</p>
              )}
              <div className="shrink-0 ml-4">
                <span className="font-serif text-2xl font-bold italic text-gray-900 whitespace-nowrap leading-none">
                  {selectedSize?.price ?? product.min_price} DH
                </span>
              </div>
            </div>

            {/* Row 3: Subtitle (Behind/Below Brand name) */}
            {product.subtitle && (
              <p className="text-xs text-gray-400 uppercase tracking-wider leading-none mt-3">
                {product.subtitle}
              </p>
            )}
          </div>

          {/* ── Images Column ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col w-full md:w-1/2 gap-4 sticky top-24">
            {/* Main Image & Carousel */}
            <div className="group relative w-full aspect-square md:aspect-[4/5] rounded-sm overflow-hidden bg-[#f8f8f8]">
              {/* Badges & Actions */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                  onClick={handleWishlist}
                  className="md:hidden rounded-full bg-white/90 p-2.5 text-gray-500 hover:text-red-500 transition-colors shadow-sm"
                >
                  <Heart className={`h-5 w-5 ${wished ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button className="rounded-full bg-white/90 p-2.5 text-gray-500 hover:bg-white transition-colors shadow-sm">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {product.badges?.includes('Best Seller') && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded bg-[#fdf6e3] px-3 py-1.5 text-xs font-medium text-[#b8860b] shadow-sm">
                    ✨ Best seller
                  </span>
                </div>
              )}

              {/* Image Carousel */}
              <div className="relative w-full h-full">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-contain p-8 mix-blend-multiply transition-opacity duration-300"
                />

                {/* Mobile/Tablet Carousel Arrows (visible on hover or always on touch) */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        const idx = images.indexOf(mainImage);
                        const prev = idx > 0 ? images[idx - 1] : images[images.length - 1];
                        setMainImage(prev);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/40 p-1.5 text-gray-800 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        const idx = images.indexOf(mainImage);
                        const next = idx < images.length - 1 ? images[idx + 1] : images[0];
                        setMainImage(next);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/40 p-1.5 text-gray-800 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Progress Dots (Carousel indicator) */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        mainImage === img ? 'w-6 bg-[#4a403a]' : 'w-1.5 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Thumbnails (Hidden on mobile) */}
            <div className="hidden md:flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-sm border-2 transition-all ${
                    mainImage === img ? 'border-gray-800' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Details Column ─────────────────────────────────────────────────────── */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Header (Desktop Only) */}
            <div className="hidden md:block mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold uppercase tracking-wider text-gray-900 leading-tight">
                      {product.name}
                    </h1>
                    {product.badges?.includes('Best Seller') && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#fdf6e3] px-2.5 py-1 text-xs font-medium text-[#b8860b]">
                        ✨ Best seller
                      </span>
                    )}
                  </div>
                  {product.brand && (
                    <p className="font-serif italic text-gray-600 text-xl">{product.brand.name}</p>
                  )}
                  {product.subtitle && (
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                      {product.subtitle}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="font-serif text-2xl sm:text-3xl font-bold italic text-gray-900 whitespace-nowrap">
                      {selectedSize?.price ?? product.min_price} DH
                    </span>
                    {(selectedSize?.original_price ?? null) && (
                      <span className="font-serif text-lg sm:text-xl text-gray-400 line-through italic whitespace-nowrap">
                        {selectedSize!.original_price} DH
                      </span>
                    )}
                  </div>
                  {product.review_count > 0 && (
                    <div className="mt-2 flex items-center justify-end gap-1">
                      <div className="flex text-[#d4af37]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`h-3 w-3 fill-current ${star <= Math.round(product.avg_rating) ? 'text-[#d4af37]' : 'text-gray-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-900 font-bold ml-1">{product.avg_rating}</span>
                      <span className="text-xs text-gray-400 font-medium">({product.review_count})</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description (Desktop Only) */}
              {product.description && (
                <p className="mt-6 text-gray-500 leading-relaxed text-[15px] font-serif">{product.description}</p>
              )}
            </div>

            <hr className="hidden md:block mb-8 border-gray-200" />

            {/* Actions Section */}
            <div className="mb-8 flex items-center justify-between w-full h-12 gap-2">
              {/* Quantity Selector: Fixed small width */}
              <div className="flex h-full w-20 items-center justify-between rounded-lg border border-gray-200 px-1 shrink-0 bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="text-gray-400 hover:text-gray-900 text-lg font-light w-5 flex justify-center"
                >-</button>
                <span className="font-serif text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => {
                    const max = selectedSize?.stock_quantity ?? 99;
                    setQuantity((q) => Math.min(max, q + 1));
                  }}
                  className="text-gray-400 hover:text-gray-900 text-lg font-light w-5 flex justify-center"
                >+</button>
              </div>

              {/* Buy Now: Centered and dynamic width (fill center) */}
              <button
                disabled={!selectedSize || selectedSize.stock_quantity === 0}
                onClick={handleBuyNow}
                className="flex h-full flex-1 items-center justify-center rounded-lg bg-[#443e3b] px-2 text-white transition-all hover:bg-[#342f2d] active:scale-[0.98] disabled:opacity-40"
              >
                <span className="font-serif italic text-sm tracking-tight">Buy It Now ›</span>
              </button>

              {/* Cart Icon: Fixed small square */}
              <button
                disabled={!selectedSize || selectedSize.stock_quantity === 0}
                onClick={handleAddToCart}
                className="flex h-full w-12 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 shrink-0 active:scale-[0.98] disabled:opacity-40"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>

              {/* Wishlist Link: Only on desktop */}
              <button
                onClick={handleWishlist}
                className="hidden md:flex h-full w-12 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 shrink-0 active:scale-[0.98]"
              >
                <Heart className={`h-5 w-5 transition-colors ${wished ? 'fill-red-500 text-red-500' : ''}`} />
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

            {/* Accordion: Ingrédients — data from backend via ingredient_product pivot */}
            {product.ingredients && product.ingredients.length > 0 && (() => {
              const PER_PAGE   = 5;
              const totalPages = Math.ceil(product.ingredients.length / PER_PAGE);
              const visible    = product.ingredients.slice(
                ingredientPage * PER_PAGE,
                (ingredientPage + 1) * PER_PAGE,
              );
              const canPrevIng = ingredientPage > 0;
              const canNextIng = ingredientPage < totalPages - 1;

              return (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <button
                    onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
                    className="flex w-full items-center justify-between text-left group"
                  >
                    <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">
                      Ingrédients
                    </span>
                    {isIngredientsOpen
                      ? <ChevronUp className="h-6 w-6 text-gray-500" />
                      : <ChevronDown className="h-6 w-6 text-gray-500" />}
                  </button>

                  {isIngredientsOpen && (
                    <div className="mt-8 relative px-8">

                      {/* Left arrow */}
                      <button
                        onClick={() => setIngredientPage((p) => Math.max(0, p - 1))}
                        disabled={!canPrevIng}
                        className="absolute left-0 top-10 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-25 transition-opacity"
                        aria-label="Previous ingredients"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Items row — single row, 5 items max */}
                      <div className="flex justify-center gap-6 sm:gap-8">
                        {visible.map((ing) => (
                          <div key={ing.id} className="flex flex-col items-center gap-3 w-20 sm:w-24 shrink-0">
                            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-[#f5f0eb] border border-gray-100">
                              {ing.image_url ? (
                                <Image
                                  src={ing.image_url}
                                  alt={ing.name}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-2xl">🌿</span>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-center text-gray-600 leading-tight">{ing.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* Right arrow */}
                      <button
                        onClick={() => setIngredientPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={!canNextIng}
                        className="absolute right-0 top-10 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-25 transition-opacity"
                        aria-label="Next ingredients"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {/* Page dots — only shown when more than 1 page */}
                      {totalPages > 1 && (
                        <div className="flex justify-center gap-1.5 mt-6">
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setIngredientPage(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                i === ingredientPage ? 'bg-[#4a403a]' : 'bg-gray-200 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })()}

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
                {/* ── Header ── */}
                <button onClick={() => setIsReviewsOpen(!isReviewsOpen)} className="flex w-full items-center justify-between text-left group">
                  <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Reviews</span>
                  {isReviewsOpen ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
                </button>

                {isReviewsOpen && (
                  <div className="mt-8">

                    {/* ── Quote ── */}
                    <p className="text-center font-serif italic text-gray-500 text-sm mb-8 px-2 leading-relaxed">
                      &ldquo;Nous croyons que l&rsquo;excellence ne se revendique pas, elle se constate.&rdquo;
                    </p>

                    {/* ── Rating summary: big score left + bars right ── */}
                    <div className="flex items-center gap-6 mb-10 px-2">
                      {/* Big score */}
                      <div className="text-center shrink-0 w-28">
                        <div className="font-serif italic leading-none text-gray-900" style={{ fontSize: '4.5rem' }}>
                          {product.avg_rating.toFixed(1)}
                        </div>
                        <div className="flex justify-center gap-0.5 my-2">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} className={`h-4 w-4 fill-current ${s <= Math.round(product.avg_rating) ? 'text-[#d4af37]' : 'text-gray-200'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">{product.review_count} au total</p>
                      </div>

                      {/* Star distribution bars */}
                      <div className="flex-1 space-y-2">
                        {[5,4,3,2,1].map((star) => {
                          const count = product.reviews!.filter((r) => Math.round(r.rating) === star).length;
                          const pct   = product.reviews!.length > 0 ? (count / product.reviews!.length) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-3 shrink-0 text-right">{star}</span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#d4af37] rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Reviews Carousel ── */}
                    {(() => {
                      const CARD_W   = 248;
                      const GAP      = 16;
                      const maxPage  = Math.max(0, product.reviews!.length - 1);
                      return (
                        <div className="relative px-6">
                          {/* Left arrow */}
                          <button
                            onClick={() => setReviewPage((p) => Math.max(0, p - 1))}
                            disabled={reviewPage === 0}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-25 transition-opacity"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          {/* Track */}
                          <div className="overflow-hidden">
                            <div
                              className="flex gap-4 transition-transform duration-300 ease-in-out"
                              style={{ transform: `translateX(-${reviewPage * (CARD_W + GAP)}px)` }}
                            >
                              {product.reviews!.map((review) => (
                                <div
                                  key={review.id}
                                  className="shrink-0 rounded-2xl border border-gray-100 overflow-hidden bg-white flex flex-col"
                                  style={{ width: CARD_W }}
                                >
                                  {/* Image */}
                                  {review.images?.[0] ? (
                                    <div className="relative bg-gray-50" style={{ height: 180 }}>
                                      <Image
                                        src={review.images[0].image_url}
                                        alt="Review"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="bg-gray-50" style={{ height: 48 }} />
                                  )}

                                  {/* Body */}
                                  <div className="p-4 flex flex-col flex-grow">
                                    {review.body && (
                                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3 flex-grow">
                                        {review.body}
                                      </p>
                                    )}
                                    <div className="text-center border-t border-gray-100 pt-3 mt-auto">
                                      <h5 className="font-serif font-bold text-gray-900 text-sm">{review.reviewer_name}</h5>
                                      <div className="flex justify-center gap-0.5 my-1.5">
                                        {[1,2,3,4,5].map((s) => (
                                          <svg key={s} className={`h-3 w-3 fill-current ${s <= review.rating ? 'text-[#d4af37]' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                      <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('fr-MA')}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right arrow */}
                          <button
                            onClick={() => setReviewPage((p) => Math.min(maxPage, p + 1))}
                            disabled={reviewPage >= maxPage}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-25 transition-opacity"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })()}

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
