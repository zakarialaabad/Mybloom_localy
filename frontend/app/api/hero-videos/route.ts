import { NextResponse } from 'next/server';
import { readdir, access } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_EXTS = new Set(['.mp4', '.webm', '.ogg']);

type VideoEntry = {
  src: string;
  poster?: string;
};

type HeroVideoData = {
  desktop: VideoEntry[];
  mobile:  VideoEntry[];
};

/**
 * Attempt to fetch video list from the Laravel backend DB.
 * Returns null on any error or if the backend returns no videos.
 */
async function fetchFromBackend(): Promise<HeroVideoData | null> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!backendUrl) return null;

  try {
    const res = await fetch(`${backendUrl}/api/v1/videos/hero`, {
      next: { revalidate: 1800 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const raw = json?.data as { desktop?: (string | VideoEntry)[]; mobile?: (string | VideoEntry)[] } | undefined;

    if (!raw) return null;

    const normalize = (items: (string | VideoEntry)[]): VideoEntry[] =>
      items.map((item) => (typeof item === 'string' ? { src: item } : item));

    if ((raw.desktop?.length ?? 0) > 0 || (raw.mobile?.length ?? 0) > 0) {
      return {
        desktop: normalize(raw.desktop ?? []),
        mobile:  normalize(raw.mobile ?? []),
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fallback: scan the local /public/Home background/ directory.
 * Preserves full backward compatibility with videos that were not yet
 * migrated to the database.
 */
async function scanLocalFallback(): Promise<HeroVideoData> {
  const publicDir = path.join(process.cwd(), 'public');
  const heroDir   = path.join(publicDir, 'Home background');

  try {
    const files = await readdir(heroDir);

    const videoFiles = files.filter((f) => ALLOWED_EXTS.has(path.extname(f).toLowerCase()));

    const buildEntry = async (f: string): Promise<VideoEntry> => {
      const src = encodeURI(`/Home background/${f}`);
      const posterName = path.basename(f, path.extname(f)) + '_poster.jpg';
      const posterPath = path.join(heroDir, posterName);
      try {
        await access(posterPath);
        return { src, poster: encodeURI(`/Home background/${posterName}`) };
      } catch {
        return { src };
      }
    };

    const desktopFiles = videoFiles.filter((f) => f.toLowerCase().startsWith('desktop')).sort();
    const mobileFiles  = videoFiles.filter((f) => f.toLowerCase().startsWith('mobile')).sort();

    const desktop = await Promise.all(desktopFiles.map(buildEntry));
    const mobile  = await Promise.all(mobileFiles.map(buildEntry));

    return { desktop, mobile };
  } catch {
    return { desktop: [], mobile: [] };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const firstOnly = searchParams.get('first') === '1';

  // 1. Primary: DB-managed videos from Laravel backend
  const backendData = await fetchFromBackend();
  if (backendData) {
    if (firstOnly) {
      return NextResponse.json({
        desktop: backendData.desktop.slice(0, 1),
        mobile:  backendData.mobile.slice(0, 1),
      });
    }
    return NextResponse.json(backendData);
  }

  // 2. Fallback: legacy local filesystem scan (maintains old behavior perfectly)
  const localData = await scanLocalFallback();
  if (firstOnly) {
    return NextResponse.json({
      desktop: localData.desktop.slice(0, 1),
      mobile:  localData.mobile.slice(0, 1),
    });
  }
  return NextResponse.json(localData);
}

