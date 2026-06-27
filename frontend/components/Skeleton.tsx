/**
 * Reusable Skeleton Loader Component
 * Provides animated pulse loading placeholders for various UI elements
 */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

/**
 * Animated Loading Spinner — exact match of admin dashboard overlay.
 * bg-white/40 + backdrop-blur-[2px] gives the semi-transparent blurred
 * overlay that lets the rendered page elements show through behind it.
 * NOTE: this only looks transparent if the page layout is rendered behind
 * it — never return this as the ONLY element on screen.
 */
export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
      <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Full-page layout skeleton (shows while page is loading)
 */
export function FullPageLoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header skeleton */}
      <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="hidden sm:block h-4 w-48" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="flex-grow px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero section skeleton */}
          <Skeleton className="h-80 md:h-96 w-full rounded-xl" />

          {/* Section title skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>

          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-[4/5] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <div className="border-t border-gray-100 px-4 py-6 sm:px-6 mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for product cards in grid/carousel
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      <Skeleton className="w-full h-64" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for product detail page
 */
export function ProductDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image gallery */}
        <div className="space-y-4">
          <Skeleton className="w-full h-[500px] rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-24 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Right: Product info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-2/5" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for collection/browse page products
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for collection page sidebar filters
 */
export function FilterSkeleton() {
  return (
    <div className="bg-[#fcfcfc] p-6 rounded-sm space-y-6">
      {/* Brand filter */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Price filter */}
      <div className="border-t border-gray-100 pt-6 space-y-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>

      {/* Category filter */}
      <div className="border-t border-gray-100 pt-6 space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for home page sections
 */
export function SectionSkeleton({ title = true, itemCount = 4 }: { title?: boolean; itemCount?: number }) {
  return (
    <div className="space-y-6 py-12">
      {title && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for carousel/hero section
 */
export function HeroSkeleton() {
  return (
    <div className="w-full h-96 md:h-[500px]">
      <Skeleton className="w-full h-full rounded-none" />
    </div>
  );
}

/**
 * Skeleton for review/testimonial
 */
export function ReviewSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
