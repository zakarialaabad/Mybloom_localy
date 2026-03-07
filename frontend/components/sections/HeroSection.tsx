import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative h-[550px] md:h-[650px] overflow-hidden bg-gray-200">
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
      <div className="relative z-10 container mx-auto flex h-full flex-col justify-center px-4 text-white text-center md:text-left md:items-start items-center">
        <h2 className="mb-4 md:mb-6 font-serif text-5xl md:text-7xl uppercase tracking-wider">
          Aura Scents
        </h2>
        <p className="mb-8 md:mb-10 max-w-xl text-sm md:text-xl font-light px-4 md:px-0">
          Discover the world&apos;s most prestigious fragrance brands at unbeatable prices
        </p>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto px-8 md:px-0 items-center">
          <Link
            href="#best-sellers"
            className="flex w-max items-center justify-center rounded-full bg-white/40 md:bg-white px-8 md:px-10 py-2.5 md:py-3 text-xs md:text-sm font-semibold tracking-widest text-white md:text-gray-900 backdrop-blur-sm transition-colors hover:bg-aura-gold hover:text-white"
          >
            SHOP NOW <span className="ml-2 text-[10px] md:hidden">▶</span>
          </Link>
          <Link
            href="#"
            className="hidden md:flex rounded-full border border-white bg-white/20 px-10 py-3 text-sm font-semibold tracking-widest text-white backdrop-blur-md transition-colors hover:bg-white hover:text-gray-900"
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
