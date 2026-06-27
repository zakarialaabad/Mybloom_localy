'use client';

import { useEffect, useRef, useState } from 'react';
import SectionContainer from '@/components/SectionContainer';

type BrandLogoMarqueeProps = {
  logos: string[];
};

function altFromFilename(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
}

export default function BrandLogoMarquee({ logos }: BrandLogoMarqueeProps) {
  const sequenceRef = useRef<HTMLDivElement>(null);
  const [sequenceWidth, setSequenceWidth] = useState(0);

  useEffect(() => {
    const node = sequenceRef.current;
    if (!node) return;

    const measure = () => setSequenceWidth(node.scrollWidth);
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);

    const images = Array.from(node.querySelectorAll('img'));
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', measure);
        img.addEventListener('error', measure);
      }
    });

    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
      images.forEach((img) => {
        img.removeEventListener('load', measure);
        img.removeEventListener('error', measure);
      });
    };
  }, [logos]);

  const duration = sequenceWidth > 0
    ? Math.max(sequenceWidth / 72, logos.length * 1.8)
    : 40;

  return (
    <section className="pb-10 pt-12 md:pb-8">
      <SectionContainer>
        <div className="overflow-hidden">
          <div
            className="brand-marquee-track flex w-max items-center opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 hover:[animation-play-state:paused]"
            style={{
              ['--brand-marquee-distance' as string]: `${sequenceWidth}px`,
              ['--brand-marquee-duration' as string]: `${duration}s`,
            }}
          >
            <div ref={sequenceRef} className="flex shrink-0 items-center gap-[76px] pr-[76px]">
              {logos.map((filename) => (
                <img
                  key={filename}
                  src={`/brands/${filename}`}
                  alt={altFromFilename(filename)}
                  className="h-12 w-auto max-w-none object-contain"
                  decoding="async"
                />
              ))}
            </div>

            <div aria-hidden="true" className="flex shrink-0 items-center gap-[76px] pr-[76px]">
              {logos.map((filename) => (
                <img
                  key={`duplicate-${filename}`}
                  src={`/brands/${filename}`}
                  alt=""
                  className="h-12 w-auto max-w-none object-contain"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
