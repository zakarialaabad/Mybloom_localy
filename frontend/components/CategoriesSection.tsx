 'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionContainer from '@/components/SectionContainer';
import { categoryService, Category } from '@/services/api';

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);
  return (
    <section className="bg-white">
      {/* ── Why Shop with us ────────────────────────────────────────────────── */}
      <div 
        className="bg-cover bg-center bg-no-repeat py-16 sm:py-24"
        style={{ backgroundImage: "url('/background.jpeg')" }}
      >
        <SectionContainer>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 font-serif mb-16 text-left">
            Why Shop with <span className="text-yellow-600 italic font-light ml-2" style={{ fontFamily: 'var(--font-serif-italic), cursive' }}>My Bloom</span>
          </h2>

          <div className="grid grid-cols-1 px-2 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Authentic */}
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center">
                <Image 
                  src="/100_icon.jpeg" 
                  alt="Authentic icon" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-serif">100% Authentic Products</h3>
              <p className="mt-2 text-sm text-gray-500 font-light">Sourced from Authorized<br />Suppliers.</p>
            </div>

            {/* 2. Pricing */}
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center">
                <Image 
                  src="/Competitive_icon.jpeg" 
                  alt="Competitive icon" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-serif">Competitive Pricing</h3>
              <p className="mt-2 text-sm text-gray-500 font-light">Best Prices, Guaranteed<br />Savings!</p>
            </div>

            {/* 3. Support */}
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center">
                <Image 
                  src="/Customer_icon.jpeg" 
                  alt="Support icon" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-serif">Customer Support</h3>
              <p className="mt-2 text-sm text-gray-500 font-light">We’re here whenever<br />you need us.</p>
            </div>

            {/* 4. COD */}
            <div className="flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center">
                <Image 
                  src="/Cash_Icon.jpeg" 
                  alt="COD icon" 
                  width={80} 
                  height={80} 
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-serif">Cash on Delivery</h3>
              <p className="mt-2 text-sm text-gray-500 font-light">Pay when you<br />receive.</p>
            </div>
          </div>
        </SectionContainer>
      </div>

      {/* ── Discover by Notes ──────────────────────────────────────────────── */}
      <div className="py-16 sm:py-20">
        <SectionContainer>
          {/* Header */}
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end md:gap-4">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 font-serif">
              Discover by <span className="text-yellow-600 italic font-light ml-2" style={{ fontFamily: 'var(--font-serif-italic)' }}>Notes</span>
            </h2>
            <p className="mt-4 text-base text-gray-500 max-w-xl leading-relaxed">
              Explore fragrances by their unique scent notes and discover the perfect blend of floral, woody, citrus, and spicy perfumes that suits your style.
            </p>
          </div>
          <Link 
            href="/categories" 
            className="hidden md:inline-flex items-center justify-center bg-[#4a403a] px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-[#3a322d] transition-colors rounded-sm"
          >
            Shop all notes ›
          </Link>
        </div>

        {/* Carousel / Grid */}
        <div className="relative mt-12">
            {/* Left navigation arrow placeholder (visual only for mockup fidelity) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden lg:flex">
                <button className="h-12 w-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm">
                    ‹
                </button>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="group block text-center">
                    <div className="relative mx-auto h-40 w-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src={category.image_url ?? 'https://images.unsplash.com/photo-1598007264887-acc47d519b88?auto=format&fit=crop&q=80&w=200'}
                            alt={category.name}
                            width={120}
                            height={120}
                            className="h-full w-full object-cover opacity-90 mix-blend-multiply"
                        />
                    </div>
                    <h3 className="mt-6 text-sm font-serif uppercase tracking-widest text-[#4a403a]">
                        {category.name}
                    </h3>
                </Link>
            ))}
            </div>

            {/* Right navigation arrow placeholder */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden lg:flex">
                <button className="h-12 w-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm">
                    ›
                </button>
            </div>
        </div>

        {/* Mobile button */}
        <div className="mt-10 md:hidden">
          <Link 
            href="/categories" 
            className="flex w-full items-center justify-center bg-[#4a403a] px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-[#3a322d] rounded-sm"
          >
            Shop all notes ›
          </Link>
        </div>
        </SectionContainer>
      </div>
    </section>
  );
}
