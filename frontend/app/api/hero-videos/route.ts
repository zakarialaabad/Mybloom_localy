import { NextResponse } from 'next/server';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_EXTS = new Set(['.mp4', '.webm', '.ogg']);

type HeroVideoData = {
  desktop: string[];
  mobile:  string[];
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
      // Next.js server-side cache: revalidate every 30 min
      next: { revalidate: 1800 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data as HeroVideoData | undefined;

    if (!data) return null;

    // Only use backend data when it actually has entries
    if ((data.desktop?.length ?? 0) > 0 || (data.mobile?.length ?? 0) > 0) {
      return data;
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

    const desktop = files
      .filter((f) => ALLOWED_EXTS.has(path.extname(f).toLowerCase()))
      .filter((f) => f.toLowerCase().startsWith('desktop'))
      .sort((a, b) => a.localeCompare(b))
      .map((f) => encodeURI(`/Home background/${f}`));

    const mobile = files
      .filter((f) => ALLOWED_EXTS.has(path.extname(f).toLowerCase()))
      .filter((f) => f.toLowerCase().startsWith('mobile'))
      .sort((a, b) => a.localeCompare(b))
      .map((f) => encodeURI(`/Home background/${f}`));

    return { desktop, mobile };
  } catch {
    return { desktop: [], mobile: [] };
  }
}

export async function GET() {
  // 1. Primary: DB-managed videos from Laravel backend
  const backendData = await fetchFromBackend();
  if (backendData) {
    return NextResponse.json(backendData);
  }

  // 2. Fallback: legacy local filesystem scan (maintains old behavior perfectly)
  const localData = await scanLocalFallback();
  return NextResponse.json(localData);
}

