import { access, readdir } from 'fs/promises';
import path from 'path';
import BrandLogoMarquee from '@/components/sections/BrandLogoMarquee';

async function resolveLogosDirectory(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), 'public', 'brands'),
    path.join(process.cwd(), 'frontend', 'public', 'brands'),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }

  throw new Error(`Brand logos directory not found. Checked: ${candidates.join(', ')}`);
}

async function getBrandLogos(): Promise<string[]> {
  const logosDirectory = await resolveLogosDirectory();
  const files = await readdir(logosDirectory, { withFileTypes: true });

  return files
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((filename) => /\.(png|jpe?g|webp|svg|avif)$/i.test(filename))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export default async function BrandLogos() {
  const logos = await getBrandLogos();

  if (logos.length === 0) {
    return null;
  }

  return <BrandLogoMarquee logos={logos} />;
}
