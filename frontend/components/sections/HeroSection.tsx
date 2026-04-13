"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type HeroVideos = {
  desktop: string[];
  mobile: string[];
};

function VideoPlayer({
  videos,
  className,
}: {
  videos: string[];
  className: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    // Play the active video immediately
    if (videos.length > 0 && videoRefs.current[activeIndex]) {
      videoRefs.current[activeIndex]?.play().catch(() => {});
    }

    // Preload the next video in sequence
    const nextIndex = (activeIndex + 1) % videos.length;
    if (videos.length > 1 && videoRefs.current[nextIndex]) {
      videoRefs.current[nextIndex]?.load();
    }
  }, [activeIndex, videos]);

  if (videos.length === 0) {
    return (
      <Image
        src="/background.jpeg"
        alt="Luxury Perfume Hero"
        fill
        className={`${className} object-cover`}
        priority
        unoptimized
      />
    );
  }

  return (
    <>
      {videos.map((src, index) => {
        const isActive = index === activeIndex;
        // z-index: 10 for active, 0 for inactive so the next video is behind the current one until cross-faded/cut
        return (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={src}
            className={`${className} absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            muted
            playsInline
            onEnded={() => {
              // Once ended, reset this video's current time to 0 for next time
              if (videoRefs.current[index]) {
                  videoRefs.current[index]!.currentTime = 0;
              }
              setActiveIndex((i) => (i + 1) % videos.length);
            }}
          />
        );
      })}

      {/* Dynamic slider indicators */}
      {videos.length > 1 && (
        <div className={`${className} absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center space-x-2 md:space-x-3 z-30`}>
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-[2px] md:h-[3px] rounded-full transition-all duration-500 ease-in-out ${
                index === activeIndex ? 'w-8 md:w-12 bg-white' : 'w-4 md:w-6 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function HeroSection() {
  const [videos, setVideos] = useState<HeroVideos>({ desktop: [], mobile: [] });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/hero-videos')
      .then((res) => res.json())
      .then((data: HeroVideos) => {
        if (!cancelled) {
          setVideos(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative h-[550px] md:h-[650px] overflow-hidden bg-gray-200">
      {/* Background video (desktop) */}
      <VideoPlayer videos={videos.desktop} className="hidden md:block" />

      {/* Background video (mobile) */}
      <VideoPlayer videos={videos.mobile} className="md:hidden" />

      {/* Dark overlay */}
      <div className="absolute inset-0 hero-gradient z-20" />

      {/* Content */}
      <div className="relative z-30 w-full flex h-full flex-col justify-center px-4 md:px-[69px] text-white text-center md:text-left md:items-start items-center">
        <h2 className="mb-4 md:mb-6 font-serif text-5xl md:text-7xl uppercase tracking-wider">
          Aura Scents
        </h2>
        <p className="mb-8 md:mb-10 max-w-xl text-sm md:text-xl font-light px-4 md:px-0">
          Découvrez les plus prestigieuses marques de parfum du monde à des prix imbattables
        </p>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto px-8 md:px-0 items-center">
          <Link
            href="#best-sellers"
            className="flex w-max items-center justify-center rounded-full bg-white/40 md:bg-white px-8 md:px-10 py-2.5 md:py-3 text-xs md:text-sm font-semibold tracking-widest text-white md:text-gray-900 backdrop-blur-sm transition-colors hover:bg-aura-gold hover:text-white"
          >
            ACHETER MAINTENANT <span className="ml-2 text-[10px] md:hidden">▶</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
