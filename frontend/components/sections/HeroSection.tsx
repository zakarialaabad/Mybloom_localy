"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type VideoEntry = {
  src: string;
  poster?: string;
};

type HeroVideos = {
  desktop: VideoEntry[];
  mobile: VideoEntry[];
};

function VideoPlayer({
  videos,
  className,
}: {
  videos: VideoEntry[];
  className: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Only mount the first video element initially; expand as videos need to be pre-loaded.
  const [mountedCount, setMountedCount] = useState(1);
  const videoRefs    = useRef<(HTMLVideoElement | null)[]>([]);
  // Track which indexes have already had .load() triggered to avoid redundant calls.
  const preloadedSet = useRef<Set<number>>(new Set());

  // When the full video list arrives (phase 2), mount all videos so they're available.
  useEffect(() => {
    if (videos.length > mountedCount) {
      setMountedCount(videos.length);
    }
  }, [videos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset preload tracking and start playing when the active video changes.
  useEffect(() => {
    preloadedSet.current.clear();

    if (videos.length > 0 && videoRefs.current[activeIndex]) {
      videoRefs.current[activeIndex]?.play().catch(() => {});
    }
  }, [activeIndex, videos]);

  // Called by onTimeUpdate on the active <video>: when the current video is 70%
  // through, mount and start loading the next one so it's buffered in time.
  const handleTimeUpdate = useCallback(
    (index: number) => {
      const vid = videoRefs.current[index];
      if (!vid || !vid.duration) return;

      const progress = vid.currentTime / vid.duration;
      if (progress < 0.7) return;

      const nextIndex = (index + 1) % videos.length;
      if (!preloadedSet.current.has(nextIndex)) {
        preloadedSet.current.add(nextIndex);
        // Mount the next video element if not yet in the DOM, then load it.
        setMountedCount((prev) => {
          const needed = nextIndex + 1;
          if (needed > prev) {
            // After mounting, trigger .load() on the next tick.
            setTimeout(() => {
              videoRefs.current[nextIndex]?.load();
            }, 50);
            return needed;
          }
          // Already mounted — trigger load immediately.
          videoRefs.current[nextIndex]?.load();
          return prev;
        });
      }
    },
    [videos.length],
  );

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

  // Only render video elements that have been mounted (first one initially, rest lazily).
  const visibleVideos = videos.slice(0, Math.min(mountedCount, videos.length));

  return (
    <>
      {visibleVideos.map((entry, index) => {
        const isActive  = index === activeIndex;
        const posterUrl = entry.poster || '/background.jpeg';
        return (
          <video
            key={entry.src}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={entry.src}
            className={`${className} absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            muted
            playsInline
            preload="metadata"
            poster={posterUrl}
            onTimeUpdate={isActive ? () => handleTimeUpdate(index) : undefined}
            onEnded={() => {
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

    // Step 1: Fetch only the first video immediately so the hero renders fast
    // and the rest of the page (BestSellers, Categories, Reviews) is not blocked.
    fetch('/api/hero-videos?first=1')
      .then((res) => res.json())
      .then((data: HeroVideos) => {
        if (!cancelled) setVideos(data);
      })
      .catch(() => {});

    // Step 2: After page content is visible, fetch all remaining videos in the background.
    const timer = setTimeout(() => {
      if (cancelled) return;
      fetch('/api/hero-videos')
        .then((res) => res.json())
        .then((data: HeroVideos) => {
          if (!cancelled) setVideos(data);
        })
        .catch(() => {});
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="relative h-[calc(100vh-140px)] md:h-[650px] overflow-hidden bg-gray-200">
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
            className="flex w-max items-center justify-center rounded-full bg-white/40 md:bg-white px-8 md:px-10 py-2.5 md:py-3 text-xs md:text-sm font-semibold tracking-widest text-white md:text-gray-900 backdrop-blur-sm transition-colors hover:bg-[#da2966] hover:text-white"
          >
            ACHETER MAINTENANT <span className="ml-2 text-[10px] md:hidden">▶</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
