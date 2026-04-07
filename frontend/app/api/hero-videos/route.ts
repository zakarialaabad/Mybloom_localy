import { NextResponse } from 'next/server';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED_EXTS = new Set(['.mp4', '.webm', '.ogg']);

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public');
  const heroDir = path.join(publicDir, 'Home background');

  try {
    const files = await readdir(heroDir);

    const desktop = files
      .filter((file) => ALLOWED_EXTS.has(path.extname(file).toLowerCase()))
      .filter((file) => file.toLowerCase().startsWith('desktop'))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => encodeURI(`/Home background/${file}`));

    const mobile = files
      .filter((file) => ALLOWED_EXTS.has(path.extname(file).toLowerCase()))
      .filter((file) => file.toLowerCase().startsWith('mobile'))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => encodeURI(`/Home background/${file}`));

    return NextResponse.json({ desktop, mobile });
  } catch (error) {
    return NextResponse.json({ desktop: [], mobile: [] }, { status: 200 });
  }
}
