'use client';

import { useEffect } from 'react';
import useReferenceStore from '@/store/reference';

export default function BrandLogos() {
  const brands        = useReferenceStore((s) => s.brands);
  const ensureBrands  = useReferenceStore((s) => s.ensureBrands);

  // Idempotent: if brands are already loaded by another component this is a no-op
  useEffect(() => { ensureBrands(); }, [ensureBrands]);

  return (
    <section className="border-b border-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden">
          <div className="scrolling-row items-center justify-start gap-8 opacity-70
            grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
            {brands.map((brand) => (
              <span key={brand.id} className="text-xl font-bold font-serif">
                {brand.name.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
