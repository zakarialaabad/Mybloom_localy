'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart, ShoppingCart, Share2, ChevronUp, ChevronDown,
  Truck, Clock, Banknote, Package, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard, { type ProductCardProps } from '@/components/ui/ProductCard';
import ImageGalleryModal from '@/components/ui/ImageGalleryModal';
import { LoadingSpinner } from '@/components/Skeleton';
import { productService, Product, ProductVariant } from '@/services/api';
import useCartStore from '@/store/cart';
import useCatalogStore from '@/store/catalog';
import { isInWishlist, toggleWishlist } from '@/lib/wishlist';
import { sanitizeImageUrl } from '@/lib/utils';
import { testRecommendationCount } from '@/lib/testRecommendationCount';
import useMouseDragScroll from '@/hooks/useMouseDragScroll';

// ─── Status labels for order status histories ─────────────────────────────────
const STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'shipped', 'delivered'];
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400';

/**
 * Transform Product API response to ProductCard props
 * Matches UniversSection transformation for consistent styling
 */
function productToCard(p: Product): ProductCardProps {
  const imageUrl = p.primary_image || p.images?.[0]?.image_url || FALLBACK_IMG;
  const secondaryImageUrl = p.images?.[1]?.image_url || undefined;
  const defaultVariant = p.variants?.find(v => v.is_default) ?? p.variants?.[0];
  const defaultSizeLabel = defaultVariant ? `${defaultVariant.size}${defaultVariant.unit ?? 'ml'}` : undefined;
  const defaultSizeId = defaultVariant?.id;
  const defaultVariantPrice = defaultVariant?.final_price;
  const defaultVariantOriginalPrice = defaultVariant?.original_price ?? undefined;
  
  return {
    id:            p.id,
    slug:          p.slug,
    name:          p.name,
    subtitle:      p.brand?.name ?? '',
    description:   p.subtitle ?? '',
    price:         defaultVariantPrice ?? p.min_price ?? 0,
    originalPrice: defaultVariantOriginalPrice ?? defaultVariantPrice ?? p.max_price ?? p.min_price ?? 0,
    rating:        p.avg_rating ?? 0,
    reviewCount:   p.review_count ?? 0,
    imageUrl,
    secondaryImageUrl,
    isBestSeller:  p.is_featured,
    badge:         p.badges?.[0],
    category:      p.category?.name,
    productType:   p.product_type?.name ?? '',
    defaultSizeLabel,
    defaultSizeId,
    defaultVariantPrice,
    defaultVariantOriginalPrice,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const router = useRouter();

  console.log('[ProductPage] Component mounted with slug:', slug, 'params:', params);

  const [product, setProduct]           = useState<Product | null>(null);
  const [images, setImages]             = useState<string[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(false);
  const [mainImage, setMainImage]       = useState('');
  const [selectedSize, setSelectedSize] = useState<ProductVariant | null>(null);
  const [wished, setWished]             = useState(false);
  const [quantity, setQuantity]         = useState(1);

  // Accordion states
  const [isDescriptionOpen,  setIsDescriptionOpen]  = useState(true);
  const [isIngredientsOpen,  setIsIngredientsOpen]  = useState(true);
  const [isDeliveryOpen,     setIsDeliveryOpen]     = useState(true);
  const [isReviewsOpen,      setIsReviewsOpen]      = useState(true);
  const [isFaqOpen,          setIsFaqOpen]          = useState(true);
  const [openFaqIndex,       setOpenFaqIndex]       = useState<number | null>(0);
  const [ingredientPage,     setIngredientPage]     = useState(0);
  const [recommendations,    setRecommendations]    = useState<ProductCardProps[]>([]);
  const [recommendationPage, setRecommendationPage] = useState(0);
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartImage, setGalleryStartImage] = useState('');
  const [mobileBarReady, setMobileBarReady] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'favorite' }>({ show: false, message: '', type: 'success' });
  const carouselRef = useRef<HTMLDivElement>(null);
  const reviewsCarouselRef = useRef<HTMLDivElement>(null);
  useMouseDragScroll(reviewsCarouselRef);

  const addItem = useCartStore((s) => s.addItem);
  
  const findProductBySlug = useCatalogStore((s) => s.findProductBySlug);
  const getProductDetailBySlug = useCatalogStore((s) => s.getProductDetailBySlug);
  const cacheProductDetail = useCatalogStore((s) => s.cacheProductDetail);
  const getAllCachedProducts = useCatalogStore((s) => s.getAllCachedProducts);

  // Slide-up animation for mobile action bar
  useEffect(() => {
    const timer = setTimeout(() => setMobileBarReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string, type: 'success' | 'error' | 'favorite') => {
    setToast({ show: true, message, type });
  };

  // ─── Fetch product ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setFetchError(false);

    console.log('[ProductPage] Loading product with slug:', slug);

    // ── Phase 1: Check detail cache first (full payload, no API call) ──
    const cachedDetailProduct = getProductDetailBySlug(slug);

    if (cachedDetailProduct) {
      if (!mounted) return;

      setProduct(cachedDetailProduct);

      const allImages: string[] = cachedDetailProduct.images?.length
        ? cachedDetailProduct.images.map((i) => i.image_url).filter((u): u is string => !!u)
        : cachedDetailProduct.primary_image ? [cachedDetailProduct.primary_image] : [];

      const primary = cachedDetailProduct.images?.find((i) => i.is_primary)?.image_url
        ?? allImages[0]
        ?? 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800';

      setMainImage(primary);
      setImages(allImages.length > 0 ? allImages : [primary]);
      selectVariantFromProduct(cachedDetailProduct);
      setWished(isInWishlist(cachedDetailProduct.id));
      handleRecommendations(cachedDetailProduct, getAllCachedProducts());
      setLoading(false);

      return () => { mounted = false; };
    }

    // ── Phase 2: Check catalog list cache (from collection page navigation) ──
    // The catalog cache comes from ProductResource (list API) which does NOT include
    // ingredientItems, reviews, faqs, or recommendations. We use it only for the
    // instant initial render, then always fire a background fetch for the full detail.
    const cachedProduct = findProductBySlug(slug);

    if (cachedProduct) {
      if (!mounted) return;

      // Stage all data from cache into state (skeleton is still visible).
      setProduct(cachedProduct);

      const cachedImages: string[] = cachedProduct.images?.length
        ? cachedProduct.images.map((i) => i.image_url).filter((u): u is string => !!u)
        : [];

      const primary = cachedProduct.primary_image
        ?? cachedImages[0]
        ?? 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800';

      setMainImage(primary);
      // The list API returns ALL images per product (no limit on images relation),
      // so the cache already holds the full image set. Show all thumbnails instantly.
      setImages(cachedImages.length > 0 ? cachedImages : [primary]);
      selectVariantFromProduct(cachedProduct);
      setWished(isInWishlist(cachedProduct.id));
      handleRecommendations(cachedProduct, getAllCachedProducts());

      // Page visible immediately with all images — no waiting.
      setLoading(false);

      // Background enrich: detail API confirms definitive image order and adds
      // ingredients, reviews, faqs. Updates silently without blocking.
      productService.show(slug)
        .then((fullData) => {
          if (!mounted) return;
          setProduct(fullData);
          cacheProductDetail(fullData);

          const allImages: string[] = fullData.images?.length
            ? fullData.images.map((i) => i.image_url).filter((u): u is string => !!u)
            : fullData.primary_image ? [fullData.primary_image] : [];

          if (allImages.length > 0) {
            const freshPrimary = fullData.images?.find((i) => i.is_primary)?.image_url
              ?? allImages[0];
            setMainImage(freshPrimary);
            setImages(allImages);
          }

          handleRecommendations(fullData, []);
        })
        .catch(() => {
          console.warn('[ProductPage] Detail API failed — using cached data');
        });

      return () => { mounted = false; };
    }

    console.log('[ProductPage] Product not in cache, fetching from API...');
    productService.show(slug)
      .then((data) => {
        console.log('[ProductPage] Product fetched successfully:', data);
        if (!mounted) return;
        cacheProductDetail(data);
        setProduct(data);
        const allImages: string[] = data.images?.length
          ? data.images.map((i) => i.image_url).filter((u): u is string => !!u)
          : data.primary_image ? [data.primary_image] : [];
        setImages(allImages);
        const primary = data.images?.find((i) => i.is_primary)?.image_url ?? data.images?.[0]?.image_url ?? data.primary_image ?? 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800';
        setMainImage(primary);

        selectVariantFromProduct(data);
        setWished(isInWishlist(data.id));
        handleRecommendations(data, []);
      })
      .catch((err) => {
        console.error('[ProductPage] Error fetching product:', err);
        if (mounted) setFetchError(true);
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [slug, findProductBySlug, getProductDetailBySlug, cacheProductDetail, getAllCachedProducts]);

  const selectVariantFromProduct = (data: Product) => {
    if (data.variants && data.variants.length > 0) {
      const firstAvailable = data.variants.find((v) => v.stock_quantity && v.stock_quantity > 0);
      const selected = firstAvailable ?? data.variants[0];
      setSelectedSize(selected);
    } else if (data.sizes && data.sizes.length > 0) {
      const firstAvailable = data.sizes.find((s) => s.stock_quantity && s.stock_quantity > 0);
      const inStock = firstAvailable ?? data.sizes[0];
      setSelectedSize({
        id:                inStock.id,
        size:              inStock.volume_ml,
        price:             inStock.original_price ?? inStock.price,
        final_price:       inStock.price,
        original_price:    inStock.original_price,
        promotion_percent: 0,
        is_default:        true,
        stock_quantity:    inStock.stock_quantity ?? 0,
      });
    } else {
      setSelectedSize({
        id:                0,
        size:              0,
        price:             data.min_price ?? 0,
        final_price:       data.min_price ?? 0,
        original_price:    data.original_price ?? null,
        promotion_percent: 0,
        is_default:        true,
        stock_quantity:    data.stock ?? 0,
      });
    }
  };

  const handleRecommendations = (product: Product, allCachedProducts: Product[]) => {
    if (product.recommendations && product.recommendations.length > 0) {
      const transformedRecs = product.recommendations.map(productToCard);
      setRecommendations(transformedRecs);
      setRecommendationCount(transformedRecs.length);
      
      const verification = testRecommendationCount.logRecommendationData(
        product.id,
        transformedRecs.length,
        product.recommendations
      );
      
      if (!verification.passed) {
        console.warn('⚠️ Recommendation count mismatch detected!', verification);
      }
    } else {
      setRecommendations([]);
      setRecommendationCount(0);
      console.log('ℹ️ No recommended products for this product');
    }
  };

  // ─── Wishlist toggle ────────────────────────────────────────────────────────
  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
    const newState = !wished;
    setWished(newState);
    showToast(newState ? 'Ajouté aux favoris' : 'Retiré des favoris', 'favorite');
  };

  // ─── Carousel scroll handlers ───────────────────────────────────────────────
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 320;
    if (direction === 'left') {
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // ─── Add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    if (selectedSize.stock_quantity === 0) {
      showToast('Ce produit est actuellement épuisé.', 'error');
      return;
    }
    const sizeLabel = selectedSize.size > 0
      ? `${selectedSize.size}${selectedSize.unit ?? 'ml'}`
      : null;
    addItem({
      productId:     product.id,
      productName:   product.name,
      slug:          product.slug,
      productType:   product.product_type?.name,
      sizeId:        selectedSize.id,
      sizeLabel,
      quantity,
      unitPrice:     selectedSize.final_price,
      originalPrice: selectedSize.original_price ?? undefined,
      imageUrl:      mainImage,
    });
    showToast('Produit ajouté au panier avec succès !', 'success');
  };

  const handleBuyNow = () => {
    if (!product || !selectedSize) return;
    if (selectedSize.stock_quantity === 0) {
      showToast('Ce produit est actuellement épuisé.', 'error');
      return;
    }
    const sizeLabel = selectedSize.size > 0
      ? `${selectedSize.size}${selectedSize.unit ?? 'ml'}`
      : null;
    addItem({
      productId:   product.id,
      productName: product.name,
      slug:        product.slug,
      productType: product.product_type?.name,
      sizeId:      selectedSize.id,
      sizeLabel,
      quantity,
      unitPrice:     selectedSize.final_price,
      originalPrice: selectedSize.original_price ?? undefined,
      imageUrl:      mainImage,
    });
    showToast('Redirection vers le paiement...', 'success');
    setTimeout(() => {
      router.push('/checkout');
    }, 1000);
  };

  // ─── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <LoadingSpinner />
        <Header />
        <main className="flex-grow bg-white">
          <div className="container mx-auto px-4 pt-6 pb-12 sm:pt-8 sm:pb-16 max-w-7xl">
            <div className="flex gap-2 mb-6 sm:mb-8">
              <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
              <div className="w-full md:w-1/2 space-y-4">
                <div className="w-full aspect-square md:aspect-[4/5] bg-gray-100 rounded-sm animate-pulse" />
                <div className="flex gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-20 w-20 bg-gray-100 rounded-sm animate-pulse" />)}
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-5">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-9 w-3/4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
                <div className="h-8 w-1/4 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-3">
                  {[1,2,3].map(i => <div key={i} className="h-10 w-20 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
                <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Error / not found ──────────────────────────────────────────────────────
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

  const FAQ = (product.faqs && product.faqs.length > 0)
    ? product.faqs.map((f) => ({ q: f.question, a: f.answer }))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Loading Overlay */}
      {loading && <LoadingSpinner />}

      <main className="flex-grow bg-white">
        <div className="container mx-auto px-4 pt-6 pb-40 sm:pt-8 md:pb-16 max-w-7xl scroll-smooth">
          {/* Breadcrumbs */}
          <nav className="mb-6 sm:mb-8 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">Accueil</Link> /{' '}
            <Link href="/collection" className="hover:text-gray-900 transition-colors">{product.category?.name ?? 'Collection'}</Link> /{' '}
            <span className="text-gray-900">{product.name}</span>
          </nav>

          {/* Product Layout */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            
            {/* ── Media Column (Left, Sticky on Desktop) ── */}
            <div className="w-full md:w-1/2 flex flex-col md:sticky md:top-20 md:h-max">
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Desktop Thumbnails */}
              <div className="hidden md:flex flex-col gap-4 w-16 lg:w-24 shrink-0">
                {images.filter(img => img !== mainImage).slice(0, 3).map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setMainImage(img)}
                    className="relative flex-1 w-full overflow-hidden rounded-sm border-2 transition-all border-transparent hover:border-gray-300"
                  >
                    {img && <Image src={sanitizeImageUrl(img)} alt={`${product.name} thumbnail ${idx + 1}`} fill unoptimized className="object-cover" />}
                  </button>
                ))}
              </div>

              {/* Main Image & Carousel */}
              <div className="group relative w-full flex-1 aspect-square md:aspect-[4/5] rounded-sm overflow-hidden bg-[#f8f8f8]">
                
                {/* Badges & Actions (Left Side) */}
                <div className="absolute top-5 left-5 z-10 flex flex-col gap-2 items-start pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlist();
                    }}
                    className="md:hidden rounded-full bg-white/90 p-2.5 text-gray-500 hover:text-red-500 transition-colors shadow-sm pointer-events-auto"
                  >
                    <Heart className={`h-5 w-5 ${wished ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {product.badges?.includes('Best Seller') && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#fdf6e3] px-3 py-1.5 text-xs font-medium text-[#b8860b] shadow-sm pointer-events-auto">
                      ✨ Best seller
                    </span>
                  )}
                </div>

                {/* Share Button (Right Side - Top) */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof window !== 'undefined' && product) {
                      const productUrl = `${window.location.origin}/product/${product.slug}`;
                      const message = `${product.name}\n\n${product.description ||  product.subtitle || 'Premium fragrance'}\n\nPrix: ${product.min_price} DH\n\n${productUrl}`;
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }
                  }}
                  className="absolute top-5 right-5 z-10 rounded-full bg-white/90 p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white transition-colors shadow-sm"
                >
                  <Share2 className="h-5 w-5" />
                </button>

                {/* Image Carousel */}
                <div 
                  className="relative w-full h-full cursor-zoom-in group/zoom bg-white"
                  onClick={() => {
                    setGalleryImages(images);
                    setGalleryStartImage(mainImage);
                    setGalleryOpen(true);
                  }}
                >
                  <Image
                    src={sanitizeImageUrl(mainImage)}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover/zoom:scale-105"
                  />
                  {/* Zoom hint overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover/zoom:bg-black/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover/zoom:opacity-100 pointer-events-none">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 flex items-center gap-2 rounded-full text-sm font-medium shadow-sm invisible md:visible transform translate-y-4 group-hover/zoom:translate-y-0 transition-all duration-300">
                      Click to Enlarge
                    </span>
                  </div>

                  {/* Carousel Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const idx = images.indexOf(mainImage);
                          const prev = idx > 0 ? images[idx - 1] : images[images.length - 1];
                          setMainImage(prev);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/60 p-2 text-gray-900 shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 z-20"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const idx = images.indexOf(mainImage);
                          const next = idx < images.length - 1 ? images[idx + 1] : images[0];
                          setMainImage(next);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/60 p-2 text-gray-900 shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 z-20"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Progress Dots */}
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
            </div>
          </div>

          {/* ── Details Column ─────────────────────────────────────────────────────── */}
          <div className="w-full md:w-1/2 flex flex-col md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:overflow-y-auto md:overflow-x-hidden scrollbar-hide">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="break-words text-3xl font-serif font-bold uppercase leading-tight tracking-wider text-gray-900 sm:text-4xl">
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
                    <p className="mt-1 max-w-full break-words text-xs uppercase tracking-wider text-gray-400 leading-relaxed">
                      {product.subtitle}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <div className="flex items-baseline gap-2 justify-start sm:justify-end">
                    {selectedSize?.original_price && (
                      <span className="font-serif text-lg sm:text-xl text-gray-400 line-through italic whitespace-nowrap">
                        {Math.round(selectedSize.original_price)} DH
                      </span>
                    )}
                    <span className="font-serif text-2xl sm:text-3xl font-bold italic text-gray-900 whitespace-nowrap">
                      {Math.round(selectedSize?.final_price ?? product.min_price)} DH
                    </span>
                  </div>
                  {product.review_count > 0 && (
                    <div className="mt-2 flex items-center justify-start gap-1 sm:justify-end">
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
              {/* ✅ FIX 1: Description block above button REMOVED */}
            </div>

            <hr className="hidden md:block mb-8 border-gray-200" />

            {/* Actions Section — desktop only */}
            <div className="mb-8 hidden md:flex items-center gap-3 md:gap-4 lg:gap-5 w-full h-12 md:max-w-2xl">
              {/* Quantity selector — equal thirds, perfectly centred */}
              <div className="flex h-11 w-[100px] md:h-12 md:w-[120px] items-center rounded-md border-2 border-[#969292] shrink-0 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 text-xl font-light fallback-touch"
                >-</button>
                <span className="flex-1 h-full flex items-center justify-center font-serif font-medium tabular-nums" style={{ fontSize: '28px' }}>{quantity}</span>
                <button
                  onClick={() => {
                    const max = selectedSize?.stock_quantity ?? product?.stock ?? 99;
                    setQuantity((q) => Math.min(max, q + 1));
                  }}
                  className="flex-1 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 text-xl font-light fallback-touch"
                >+</button>
              </div>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                className={`flex h-11 md:h-12 flex-1 items-center justify-center rounded-md px-4 shadow-sm transition-all active:scale-[0.98] ${
                  !selectedSize || selectedSize.stock_quantity === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#4a403a] text-white hover:bg-[#342f2d]'
                }`}
              >
                <span className="font-serif italic text-base md:text-lg tracking-wide">Acheter maintenant &rsaquo;</span>
              </button>

              {/* Cart Icon */}
              <button
                onClick={handleAddToCart}
                className={`flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-md border-2 shrink-0 shadow-sm active:scale-[0.98] transition-colors ${
                  !selectedSize || selectedSize.stock_quantity === 0
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-[#969292] text-gray-700 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.5} />
              </button>

              {/* Wishlist (Desktop only) */}
              <button
                onClick={handleWishlist}
                className={`hidden md:flex h-12 w-12 items-center justify-center rounded-md border-2 shrink-0 shadow-sm active:scale-[0.98] transition-colors ${
                  wished
                    ? 'border-red-500 bg-red-50'
                    : 'border-[#969292] bg-white hover:border-gray-400'
                }`}
              >
                <Heart className={`h-6 w-6 ${wished ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} strokeWidth={1.5} />
              </button>
            </div>

            {/* ── Size Variant Cards ─────────────────────────────────────────────── */}
            {/* ✅ FIX 3: border-[4px] + bg-[#FFFDF6] for selected state */}
            {product.variants && product.variants.length > 0 ? (
              <div className={`mb-0 grid gap-4 ${
                product.variants.length === 1 ? 'grid-cols-1' :
                product.variants.length === 2 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {product.variants.map((variant) => {
                  const outOfStock = !variant.stock_quantity || variant.stock_quantity === 0;
                  const isSelected = selectedSize?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      disabled={outOfStock}
                      onClick={() => !outOfStock && setSelectedSize(variant)}
                      className={`relative flex flex-col items-center justify-center rounded-[9px] py-4 transition-colors ${
                        outOfStock
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-2 border-gray-200'
                          : isSelected
                          ? 'border-[4px] border-[#4a403a] bg-[#FFFDF6]'
                          : 'border-2 border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {outOfStock && (
                        <div className="absolute -top-3 bg-gray-200 px-3 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 rounded-sm">
                          ÉPUISÉ
                        </div>
                      )}
                      <span className={`font-serif text-base italic ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                        {variant.size}{variant.unit ?? 'ml'}
                      </span>
                      <span className={`font-serif text-xl font-bold italic ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        {Math.round(variant.final_price)} DH
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : product.sizes && product.sizes.length > 0 ? (
              <div className={`mb-0 grid gap-4 ${
                product.sizes.length === 1 ? 'grid-cols-1' :
                product.sizes.length === 2 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {product.sizes.map((size) => {
                  const outOfStock = size.stock_quantity === 0;
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      disabled={outOfStock}
                      onClick={() => !outOfStock && setSelectedSize({
                        id:                size.id,
                        size:              size.volume_ml,
                        price:             size.original_price ?? size.price,
                        final_price:       size.price,
                        original_price:    size.original_price,
                        promotion_percent: 0,
                        is_default:        true,
                        stock_quantity:    size.stock_quantity ?? 0,
                      })}
                      className={`relative flex flex-col items-center justify-center rounded-[9px] py-4 transition-colors ${
                        outOfStock
                          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-2 border-gray-200'
                          : isSelected
                          ? 'border-[4px] border-[#4a403a] bg-[#FFFDF6]'
                          : 'border-2 border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {outOfStock && (
                        <div className="absolute -top-3 bg-gray-200 px-3 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 rounded-sm">
                          ÉPUISÉ
                        </div>
                      )}
                      <span className={`font-serif text-base italic ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                        {size.volume_ml}{(size as any).unit ?? 'ml'}
                      </span>
                      <span className={`font-serif text-xl font-bold italic ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        {Math.round(size.price)} DH
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* ── Accordion Sections ─────────────────────────────────────────────── */}
            <div className="mt-8 border-t border-gray-200">

            {/* Accordion: Description */}
            <div className="border-b border-gray-200 pt-6 pb-6 mt-0">
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

            {/* Accordion: Ingrédients */}
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
                <div className="pt-6 pb-6">
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
                      <button
                        onClick={() => setIngredientPage((p) => Math.max(0, p - 1))}
                        disabled={!canPrevIng}
                        className="absolute left-0 top-10 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-25 transition-opacity"
                        aria-label="Previous ingredients"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <div className="flex justify-center gap-6 sm:gap-8">
                        {visible.map((ing) => (
                          <div key={ing.id} className="flex flex-col items-center gap-3 w-20 sm:w-24 shrink-0">
                            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-[#f5f0eb] border border-gray-100">
                              {ing.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={ing.image_url}
                                  alt={ing.name}
                                  className="object-cover w-full h-full"
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

                      <button
                        onClick={() => setIngredientPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={!canNextIng}
                        className="absolute right-0 top-10 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-25 transition-opacity"
                        aria-label="Next ingredients"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

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

            {/* Accordion: Delivery & Returns */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button onClick={() => setIsDeliveryOpen(!isDeliveryOpen)} className="flex w-full items-center justify-between text-left group">
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Livraison et retours</span>
                {isDeliveryOpen ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
              </button>
              {isDeliveryOpen && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    { icon: <Truck className="h-6 w-6" />,    title: 'Expédition rapide',      desc: 'Les commandes sont expédiées dans les 24 heures.' },
                    { icon: <Clock className="h-6 w-6" />,    title: 'Temps de livraison',      desc: 'Livré dans 1–3 jours ouvrés.' },
                    { icon: <Banknote className="h-6 w-6" />, title: 'Paiement à la livraison',   desc: 'Payez commodement à la livraison.' },
                    { icon: <Package className="h-6 w-6" />,  title: 'Retours et remboursements',  desc: 'Remboursement ou remplacement en cas de dommage.' },
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
                  <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Reviews</span>
                  {isReviewsOpen ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
                </button>

                {isReviewsOpen && (
                  <div className="mt-8">
                    {/* Rating summary — matches CustomerReviewsSection layout */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 mb-10 justify-center">
                      {/* Score */}
                      <div className="flex flex-col items-center space-y-3 shrink-0">
                        <div className="text-7xl font-serif font-light text-[#2c2c2c] tracking-tight">
                          {product.avg_rating.toFixed(1).replace('.', ',')}
                        </div>
                        <div className="flex justify-center gap-1">
                          {[1,2,3,4,5].map((s) => (
                            <svg key={s} className={`w-5 h-5 fill-current ${s > Math.round(product.avg_rating) ? 'text-gray-300' : 'text-[#d4af37]'}`} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest font-light">{product.review_count} Avis</div>
                      </div>

                      {/* Distribution bars — uses API rating_distribution so
                           feedback reviews (no order_number) are included in counts */}
                      <div className="w-full sm:w-auto sm:min-w-[200px] space-y-2.5">
                        {[5,4,3,2,1].map((star) => {
                          const entry = product.rating_distribution?.[star];
                          const pct   = entry?.percentage ?? 0;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-xs font-serif text-gray-600 w-3">{star}</span>
                              <div className="flex-1 bg-gray-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-[#d4af37] h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quote */}
                    <p className="text-center font-serif italic text-[#4a403a] text-sm mb-8 px-2 leading-relaxed">
                      &ldquo;Nous croyons que l&rsquo;excellence ne se revendique pas, elle se constate.&rdquo;
                    </p>

                    {/* Carousel — matches CustomerReviewsSection card style */}
                    <div className="relative">
                      <div
                        ref={reviewsCarouselRef}
                        onScroll={() => {
                          const el = reviewsCarouselRef.current;
                          if (!el) return;
                        }}
                        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-stretch pb-4 touch-pan-x cursor-grab select-none"
                      >
                        {product.reviews!.map((review) => {
                          const initials = review.reviewer_name
                            .split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
                          return (
                            <div
                              key={review.id}
                              className="flex-none w-[calc(100%-16px)] sm:w-[calc(50%-12px)] snap-start bg-white rounded-[16px] border-[0.5px] border-black/10 shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col p-4 text-left"
                            >
                              {/* Card Header: Avatar + Info */}
                              <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="w-9 h-9 rounded-full bg-[#f5e6ea] text-[#C9527A] flex items-center justify-center text-[13px] font-medium shrink-0">
                                  {initials}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[13px] font-medium text-gray-900 truncate">{review.reviewer_name}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-gray-400">{new Date(review.created_at).toLocaleDateString('fr-MA')}</span>
                                    <span className="text-[10px] font-medium text-[#2ecc71] flex items-center gap-0.5">
                                      <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      Vérifié
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Stars */}
                              <div className="flex gap-0.5 mb-2">
                                {[1,2,3,4,5].map((s) => (
                                  <svg key={s} className={`w-3.5 h-3.5 fill-current ${s <= review.rating ? 'text-[#D4A847]' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>

                              {/* Body */}
                              {review.body && (
                                <p className="text-[12px] text-gray-600 leading-relaxed mb-4 line-clamp-3 italic opacity-90">{review.body}</p>
                              )}

                              {/* Image */}
                              {review.images?.[0] ? (
                                <div
                                  className="relative w-full h-[200px] bg-gray-50 cursor-pointer group overflow-hidden mt-auto rounded-[10px]"
                                  onClick={() => {
                                    const allReviewImages = product.reviews?.flatMap(r => r.images?.map((img: { image_url: string }) => img.image_url) || []) || [];
                                    setGalleryImages(allReviewImages);
                                    setGalleryStartImage(review.images![0].image_url);
                                    setGalleryOpen(true);
                                  }}
                                >
                                  <img
                                    src={review.images[0].image_url}
                                    alt="Review"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                              ) : (
                                <div className="bg-gray-50 w-full h-[200px] mt-auto rounded-[10px]" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Navigation Arrows */}
                      {product.reviews!.length > 1 && (
                        <>
                          <button
                            onClick={() => reviewsCarouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-gray-400 hover:text-[#e63a6c] transition-all duration-200 z-30"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                          </button>
                          <button
                            onClick={() => reviewsCarouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                            className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-white/90 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-gray-800 hover:text-[#e63a6c] transition-all duration-200 z-30"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accordion: FAQ */}
            {FAQ.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button onClick={() => setIsFaqOpen(!isFaqOpen)} className="flex w-full items-center justify-between text-left group">
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">FAQ</span>
                {isFaqOpen ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
              </button>
              {isFaqOpen && (
                <div className="mt-6 divide-y divide-gray-200 border-b border-gray-200">
                  {FAQ.map((faq, idx) => (
                    <div key={idx} className="py-4 px-4">
                      <button onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)} className="flex w-full items-center justify-between text-left gap-4">
                        <span className="font-serif text-lg font-bold italic text-gray-900">{faq.q}</span>
                        {openFaqIndex === idx ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                      </button>
                      {openFaqIndex === idx && (
                        <p className="mt-3 text-gray-500 text-sm leading-relaxed pr-8">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
            </div>{/* end accordion sections */}
          </div>{/* end details column */}
        </div>{/* end two-column flex row */}

        {/* ✅ FIX 4: "You may also Like" traduit en français */}
        {recommendations && recommendations.length > 0 && (
          <section className="w-full py-12 md:py-16 bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-serif font-bold italic text-gray-900 text-center md:text-left">
                  Vous aimerez <span className="not-italic" style={{ fontFamily: 'var(--font-serif-italic), cursive', fontStyle: 'italic', color: '#da2966' }}>Aussi</span>
                </h2>
              </div>

              <div className="relative group">
                {recommendations.length > 5 && (
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 duration-300"
                    aria-label="Scroll recommendations left"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                <div
                  ref={carouselRef}
                  className="overflow-x-auto scrollbar-hide"
                  style={{
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <div className="flex gap-3 sm:gap-4 md:gap-6 pb-4" style={{ minWidth: 'min-content' }}>
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="flex-shrink-0 w-auto" style={{ width: '200px' }}>
                        <ProductCard {...rec} />
                      </div>
                    ))}
                  </div>
                </div>

                {recommendations.length > 5 && (
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 duration-300"
                    aria-label="Scroll recommendations right"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
        </div>

        {/* Fullscreen Image Gallery Modal */}
        <ImageGalleryModal
          isOpen={isGalleryOpen}
          onClose={() => {
            setGalleryOpen(false);
            setGalleryImages([]);
          }}
          images={galleryImages.length > 0 ? galleryImages : images}
          currentImage={galleryStartImage || mainImage}
          onImageChange={setGalleryStartImage}
          altText={product.name}
        />

        {/* Custom Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-4 right-4 z-[9999] flex items-center space-x-3 px-5 py-3 rounded-md shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'success'
                ? 'bg-[#4a403a] text-white border border-[#342f2d]'
                : toast.type === 'favorite'
                ? 'bg-[#df4079]/90 backdrop-blur-md text-white border border-[#df4079]/50 shadow-[0_4px_20px_-4px_rgba(223,64,121,0.4)]'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : toast.type === 'favorite' ? (
              <Heart className="w-5 h-5 text-white fill-white" />
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            )}
            <span className="font-serif text-sm md:text-base tracking-wide">{toast.message}</span>
          </div>
        )}
      </main>

      {/* ── Mobile Fixed Action Bar ─────────────────────────────────── */}
      {product && !isGalleryOpen && (
        <div
          className="fixed left-0 right-0 z-[90] md:hidden flex items-center justify-between gap-3 px-4 bg-white transition-transform duration-300 ease-out"
          style={{
            bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
            height: '75px',
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
            transform: mobileBarReady ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          {/* Quantity selector */}
          <div className="flex h-11 items-center border-2 border-[#969292] shrink-0 bg-white overflow-hidden" style={{ borderRadius: '7px' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-full flex items-center justify-center text-gray-500 active:bg-gray-100 text-lg"
            >−</button>
            <span className="w-9 h-full flex items-center justify-center font-bold tabular-nums" style={{ fontSize: '17px' }}>{quantity}</span>
            <button
              onClick={() => {
                const max = selectedSize?.stock_quantity ?? product?.stock ?? 99;
                setQuantity((q) => Math.min(max, q + 1));
              }}
              className="w-11 h-full flex items-center justify-center text-gray-500 active:bg-gray-100 text-lg"
            >+</button>
          </div>

          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            className={`flex-1 h-11 flex items-center justify-center transition-all active:scale-[0.97] ${
              !selectedSize || selectedSize.stock_quantity === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-[#4a403a] text-white'
            }`}
            style={{ borderRadius: '7px', fontSize: '15px' }}
          >
            <span className="font-serif italic tracking-wide">Acheter maintenant</span>
          </button>

          {/* Cart Icon */}
          <button
            onClick={handleAddToCart}
            className={`flex h-11 w-11 items-center justify-center shrink-0 border-2 active:scale-[0.95] transition-colors ${
              !selectedSize || selectedSize.stock_quantity === 0
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-[#969292] text-gray-700'
            }`}
            style={{ borderRadius: '7px' }}
          >
            <ShoppingCart style={{ width: '21px', height: '21px' }} strokeWidth={1.5} />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
