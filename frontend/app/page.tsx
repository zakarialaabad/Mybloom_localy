import BrandLogos from '@/components/sections/BrandLogos';
import HomePageClient from '@/app/HomePageClient';

export default async function HomePage() {
  return <HomePageClient brandSection={<BrandLogos />} />;
}
