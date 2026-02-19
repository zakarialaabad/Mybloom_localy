import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative h-[650px] overflow-hidden bg-gray-200">
      {/* Background image */}
      <Image
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhcmoR9svmfrFjlMsTAcokQxRV91NsQfS-VKDM1Hf-CjOI9vInGSNDn2_rBruYJhoY_KVv1chFrSJAVqnTv6XjofNJHtwjpNnW5xmF_RkA-0rBbV7rZo77gbVKC-tCqkxS6hVLHJHuTQE0vTJNHC3rYK1ySpnvXWkkIfZR7AgGFMV73A6EJkJu4LTusbCs0ieMeEX9hvtsoUgY1fBiVrMRLwa4H2IgpZn6fcIYbDtYfFjYJC6_Pd8P-DT9bxJu7X6d69-CBCb8ntI"
        alt="Luxury Perfume Hero"
        fill
        className="object-cover"
        priority
        unoptimized
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative z-10 container mx-auto flex h-full flex-col justify-center px-4 text-white">
        <h2 className="mb-6 font-serif text-7xl uppercase tracking-wider">
          Aura Scents
        </h2>
        <p className="mb-10 max-w-xl text-xl font-light">
          Discover the world&apos;s most prestigious fragrance brands at unbeatable prices
        </p>
        <div className="flex space-x-4">
          <Link
            href="#best-sellers"
            className="rounded-full bg-white px-10 py-3 text-sm font-semibold tracking-widest
              text-gray-900 transition-colors hover:bg-aura-gold hover:text-white"
          >
            SHOP NOW &rsaquo;
          </Link>
          <Link
            href="#"
            className="rounded-full border border-white bg-white/20 px-10 py-3 text-sm
              font-semibold tracking-widest text-white backdrop-blur-md transition-colors
              hover:bg-white hover:text-gray-900"
          >
            VIEW COLLECTION
          </Link>
        </div>
      </div>

      {/* Slider indicators */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 space-x-2">
        <div className="h-1 w-10 rounded-full bg-white" />
        <div className="h-1 w-10 rounded-full bg-white/50" />
      </div>
    </section>
  );
}
