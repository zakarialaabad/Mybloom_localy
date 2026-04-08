'use client';

import { useEffect } from 'react';
import useReferenceStore from '@/store/reference';

export default function BrandLogos() {
  const brands        = useReferenceStore((s) => s.brands);
  const ensureBrands  = useReferenceStore((s) => s.ensureBrands);

  // Idempotent: if brands are already loaded by another component this is a no-op
  useEffect(() => { ensureBrands(); }, [ensureBrands]);

  // Duplicate brands to create enough content for a seamless infinite scroll
  // We double it, but to be safe on ultra-wide screens, let's repeat it 4 times.
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <section className="border-b border-gray-100 py-12">
      <div className="container mx-auto px-4">
        {/* We use a flex container for the seamless animation */}
        <div className="overflow-hidden flex">
          <div className="flex w-max animate-[scrollBrand_60s_linear_infinite] items-center justify-start gap-[76px] opacity-70
            grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 hover:[animation-play-state:paused] pr-[76px]">
            {duplicatedBrands.map((brand, i) => (
              <span key={`${brand.id}-${i}`} className="text-xl font-bold font-serif whitespace-nowrap">
                {brand.name.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
