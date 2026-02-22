 'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionContainer from '@/components/SectionContainer';

export default function UniversSection() {
  return (
    <section className="mt-12 py-20 bg-white">
      <SectionContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-5xl font-serif text-gray-800">L'Univers de <span className="italic text-yellow-500 font-serif" style={{fontFamily: 'var(--font-serif, Playfair Display, serif)'}}>Bloom Parfums</span></h2>
            <p className="text-gray-500 text-sm mt-4 max-w-3xl leading-relaxed">
              Explorez notre catalogue complet regroupant tous nos produits, développés avec exigence pour répondre aux attentes les plus élevées, des solutions fiables et innovantes pensées pour vous apporter satisfaction, confiance et excellence.
            </p>
          </div>
          <Link href="#" className="bg-[#3D2B1F] text-white px-8 py-3 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-black transition-colors shrink-0">
            See all collection <span>›</span>
          </Link>
        </div>

        {/* Product Grid (static placeholders to match reference) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="product-item">
              <div className="bg-[#F9F9F9] rounded-sm mb-4 relative aspect-[4/5] overflow-hidden">
                <button className="absolute top-4 left-4 z-10">
                  <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </button>
                <span className="absolute top-4 right-4 bg-white/80 text-gray-500 text-[9px] px-2 py-1 rounded">- 30 %</span>
                <img alt={`Product ${i+1}`} className="w-full h-full object-contain p-8 mix-blend-multiply transition-transform duration-500 hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFS9twEakvNkJ4xiuIBQLCeuwfNAmH4tgD9YyVc4J58ppCVYHIUoq6Wjx6EGHDrdakpJyV5B-5UysdkY8AE9YokP9-Z9bvOx_dTbIpnmFQ0xWExHKd0M_-cTfmjR4HYd-492S95iwyrN3ngzqMrflh4M5IBqJkVllI_xu7OR8lAkbkuoFtOFBRraJ3fHNkRTZsPQYHDozHj1HWnOI4yXDspevgU57qW6KDwbia9hGcHExjQwfJMHp_1NPBQTgXuyMAKxwZInAgkHw" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900">Over Dose</h3>
                <p className="text-xs text-gray-400">Bold Body Mist</p>
                <p className="text-[10px] text-gray-500 py-1">Warm &amp; Sensual Fragrance</p>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">140 DH</span>
                  <span className="text-xs text-gray-400 line-through">200 DH</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-yellow-500">
                  <div className="flex"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></div>
                  <span className="text-[10px] text-gray-400">4.4 (180)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
