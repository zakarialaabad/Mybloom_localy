import Link from 'next/link';
import ProductCard, { type ProductCardProps } from '@/components/ui/ProductCard';

const PRODUCTS: ProductCardProps[] = [
  {
    id: 1,
    name: 'Midnight Bloom',
    subtitle: 'Sweet Body Butter',
    description: 'For Smooth & Radiant Skin',
    price: 120,
    originalPrice: 180,
    rating: 4.1,
    reviewCount: 121,
    isBestSeller: true,
    badge: 'Save Up To 100 DH',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCyl3GrcFE17JoEJNvOf9ZJMzxlxrZmfg4EUOWHo60uMD4EGj2gBUopjHKk8wQkMBt8M4SztrtddZVblKaLtHr-OK_l4Zx28-iHpx6Sa7KMnJkEQDiecBMcUU5yJ7zwA3RQEmYeJYhUihMwQteNoCPYothbIU3w6XzOymHDV_weHVk8dKOQKz3O924F5Y03A2S1xIEo7EYBu5inrX9V344pdiNhgdn6E9AKATBxBYuj2sNeYcpmxeJ9cDDysGYofhwtpTX-mB6cwu0',
  },
  {
    id: 2,
    name: 'Oceanic Drift',
    subtitle: 'Bold Body Mist',
    description: 'Warm & Sensual Fragrance',
    price: 140,
    originalPrice: 200,
    rating: 4.3,
    reviewCount: 80,
    badge: 'Save Up To 100 DH',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDFS9twEakvNkJ4xiuIBQLCeuwfNAmH4tgD9YyVc4J58ppCVYHIUoq6Wjx6EGHDrdakpJyV5B-5UysdkY8AE9YokP9-Z9bvOx_dTbIpnmFQ0xWExHKd0M_-cTfmjR4HYd-492S95iwyrN3ngzqMrflh4M5IBqJkVllI_xu7OR8lAkbkuoFtOFBRraJ3fHNkRTZsPQYHDozHj1HWnOI4yXDspevgU57qW6KDwbia9hGcHExjQwfJMHp_1NPBQTgXuyMAKxwZInAgkHw',
  },
  {
    id: 3,
    name: 'Velvet Rose',
    subtitle: 'Bold Body Mist',
    description: 'Warm & Sensual Fragrance',
    price: 140,
    originalPrice: 200,
    rating: 4.3,
    reviewCount: 80,
    badge: 'Save Up To 100 DH',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACu_NJj2TQXs2ZifElrQYl5LYCSm8R_6isvgG8u4JNtvUkQJ-Pk8G7aT8d9RGOcOUYufW5NtUxXT53UgIV4KAuMqoUrfmHvsPO-W-5Qp8qh-jqKvKLc9UtV0ry5NfnT_OyeGRKoBWtcXfuGu2mx3Rc1BW8al4Nzh3SMc9j7gRDh3TRkFgPuRhLffMc_4AYw5oIediO4rQousBDsVapv9b5NXGfjQj4SCZNnV10tXGrvEwuTTLskViaAWyhEh7gdpPJYsWOozyqkag',
  },
  {
    id: 4,
    name: 'Silk Petals',
    subtitle: 'Sweet Body Butter',
    description: 'For Smooth & Radiant Skin',
    price: 120,
    originalPrice: 180,
    rating: 4.1,
    reviewCount: 121,
    isBestSeller: true,
    badge: 'Save Up To 100 DH',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAZvFrbPHK8suJkXCtvE1JNN3L4axjLQo9UB_-MuGwtZCv1e6bpSnrihLJ4x_l5UDGpnq6hQ9EHJIvlY8uNhkbdAtt67pLARNG2-fhh8BF7r6rAA71fsrI5OyPtatwn7KiOtTmLZaEcJ--6H9pYAJwDXYOm1d0gogdGA2CeHOlJHngP2DyURc77ePSUbQPkh5D3et4pwE36U9wAdZqGPQA5s3dFw_pHHAI16NgASnOSGweAvrpP6D787T9ay9CkiaLmKG2LkI7LpDs',
  },
  {
    id: 5,
    name: 'Sugar Pop',
    subtitle: 'Sweet Body Butter',
    description: 'For Smooth & Radiant Skin',
    price: 120,
    originalPrice: 180,
    rating: 4.1,
    reviewCount: 121,
    isBestSeller: true,
    badge: 'Save Up To 100 DH',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBD8146TiJdFDeF-uVbcbtIBvq0ikjRu8_S4PkDgzv-e08S3YNuT5VyikfPbK4yHJC5UCIBESgiWNccQw8fSEGtDt7EjORt3qr6L2jtVQfierkgPRhpzFJvuAOVVVvDk-sTvS2qQ8Bmt1ClQ_AYH-ndQsgYa88-ETqhVv6Wawntgr23Z0J91NjhyR4K_kDpNUznnO0YCg801m0zFh9IJCs5eq7ZWLbFTSH2Z2wBpoanCoNtNkiJKqfxToVyK1JqrLTVPBsdB7mhrUs',
  },
];

export default function BestSellers() {
  return (
    <section id="best-sellers" className="pb-24 pt-16">
      {/* Section header */}
      <div className="container mx-auto mb-10 flex items-end justify-between px-4">
        <div>
          <h2 className="mb-4 font-serif text-4xl">
            Best <span className="italic text-aura-gold">Sellers</span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
            Explore our diverse collection of best-selling perfumes for men and women.
            <br />
            Discover a variety of affordable luxury fragrances in your desired price range,
            <br />
            perfect for any occasion. Get ready to be excited and intrigued at Fragrance Market.
          </p>
        </div>
        <Link
          href="#"
          className="rounded-md bg-aura-gold px-6 py-3 text-sm font-semibold text-white
            transition-colors hover:bg-yellow-600"
        >
          Shop Best Sellers &rsaquo;
        </Link>
      </div>

      {/* Product grid */}
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Prev arrow */}
          <button
            aria-label="Previous"
            className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2
              items-center justify-center rounded-full border border-gray-200 bg-white
              text-gray-400 shadow-sm hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            aria-label="Next"
            className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2
              items-center justify-center rounded-full border border-gray-200 bg-white
              text-gray-400 shadow-sm hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
