'use client';

import { useEffect, useState } from 'react';
import { brandService, Brand } from '@/services/api';

export default function BrandLogos() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    brandService.list().then(setBrands).catch(() => {});
  }, []);

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
