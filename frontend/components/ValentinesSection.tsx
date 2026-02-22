"use client";

import Link from 'next/link';
import SectionContainer from '@/components/SectionContainer';

export default function ValentinesSection() {
  return (
    <section className="mt-12 py-20 " data-purpose="valentines-promotion">
      <SectionContainer>
      

        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <img alt="Valentine's Day Offers" className="w-full h-auto block" src="/Valentines-image.png" />
        </div>

       
      </SectionContainer>
    </section>
  );
}
