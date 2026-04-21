'use client';

import { useMemo } from 'react';

// Local brand logos from public/brand/
const BRAND_LOGOS = [
  'Armani.png',
  'AZZARO.png',
  'Burberry.png',
  'Carolina Herrera.png',
  'Chanel.png',
  'Dior.png',
  'Dolce & Gabbana.png',
  'Escada.png',
  'Givenchy.png',
  'Gucci.png',
  'Guerlain.png',
  'HUGO BOSS .png',
  'Jean Paul Gaultier.png',
  'Lancome.png',
  'LAVERNE.png',
  'Maison-Francis-Kurkdjian.png',
  'Mugler.png',
  'Nina Ricci.png',
  'PACO RABBANE .png',
  'Prada.png',
  'TOME FORD .png',
  'Versace.png',
  'Victoria secret.png',
  'Yves Rocher.png',
  'Yves Saint Laurent.png',
  'Zara.png',
];

// Extract filename without extension for alt text
function getAltText(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

export default function BrandLogos() {
  // Duplicate brands 4x for seamless infinite scroll
  const duplicatedBrands = useMemo(
    () => [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS],
    []
  );

  return (
    <section className="pb-10 pt-12 md:pb-8">
      <div className="container mx-auto px-4">
        {/* We use a flex container for the seamless animation */}
        <div className="overflow-hidden flex">
          <div className="flex w-max animate-[scrollBrand_60s_linear_infinite] items-center justify-start gap-[76px] opacity-70
            grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 hover:[animation-play-state:paused] pr-[76px]">
            {duplicatedBrands.map((filename, i) => (
              <img
                key={`${filename}-${i}`}
                src={`/brand/${filename}`}
                alt={getAltText(filename)}
                className="h-12 w-auto object-contain whitespace-nowrap"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
