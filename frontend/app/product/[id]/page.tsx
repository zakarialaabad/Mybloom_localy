'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Share2, ChevronUp, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('50ml');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

  // Mock product data (in a real app, fetch this based on params.id)
  const product = {
    id: params.id,
    name: 'SUGAR POP',
    subtitle: 'Body Butter',
    description: 'Rich body butter for deep hydration and soft, sweet skin.',
    price: 140,
    originalPrice: 200,
    rating: 4.9,
    reviewCount: 180,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800', // Placeholder
    isBestSeller: true,
  };

  const images = [
    product.imageUrl,
    product.imageUrl,
    product.imageUrl,
  ];

  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 sm:py-16 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link> /{' '}
          <Link href="/women" className="hover:text-gray-900 transition-colors">Women</Link> /{' '}
          <Link href="/women/cream" className="hover:text-gray-900 transition-colors">Cream</Link> /{' '}
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-16">
          {/* Left Side - Images */}
          <div className="flex w-full md:w-1/2 gap-4">
            {/* Thumbnails */}
            <div className="hidden md:flex flex-col gap-4 w-24">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative aspect-square w-full overflow-hidden rounded-sm border-2 transition-all ${
                    mainImage === img ? 'border-gray-800' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1 aspect-square md:aspect-[4/5] rounded-sm overflow-hidden bg-[#f8f8f8]">
              <button className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-500 hover:bg-white transition-colors shadow-sm">
                <Share2 className="h-5 w-5" />
              </button>
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-contain p-8 mix-blend-multiply"
              />
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold uppercase tracking-wider text-gray-900">
                    {product.name}
                  </h1>
                  {product.isBestSeller && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#fdf6e3] px-2.5 py-1 text-xs font-medium text-[#b8860b]">
                      ✨ Best seller
                    </span>
                  )}
                </div>
                <p className="font-serif italic text-gray-600 text-xl">{product.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="font-serif text-2xl sm:text-3xl font-bold italic text-gray-900">
                    {product.price} DH
                  </span>
                  {product.originalPrice && (
                    <span className="font-serif text-lg sm:text-xl text-gray-400 line-through italic">
                      {product.originalPrice} DH
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-end gap-1">
                  <div className="flex text-[#d4af37]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 font-medium ml-1">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Short Description */}
            <p className="mb-8 text-gray-600 leading-relaxed text-lg">
              {product.description}
            </p>

            <hr className="mb-8 border-gray-200" />

            {/* Actions Row */}
            <div className="mb-8 flex flex-wrap sm:flex-nowrap items-center gap-4">
              {/* Quantity */}
              <div className="flex h-14 w-32 items-center justify-between rounded-sm border border-gray-300 px-4 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-500 hover:text-gray-900 text-2xl font-medium transition-colors"
                >
                  -
                </button>
                <span className="font-serif text-xl font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-500 hover:text-gray-900 text-2xl font-medium transition-colors"
                >
                  +
                </button>
              </div>

              {/* Buy Now */}
              <button className="flex h-14 flex-1 items-center justify-center rounded-sm bg-[#4a403a] px-8 text-white transition-colors hover:bg-[#3a322d] min-w-[200px]">
                <span className="font-serif italic text-xl">Buy It Now ›</span>
              </button>

              {/* Cart */}
              <button className="flex h-14 w-14 items-center justify-center rounded-sm border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 shrink-0">
                <ShoppingCart className="h-6 w-6" />
              </button>

              {/* Wishlist */}
              <button className="flex h-14 w-14 items-center justify-center rounded-sm border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 shrink-0">
                <Heart className="h-6 w-6" />
              </button>
            </div>

            {/* Variants */}
            <div className="mb-12 grid grid-cols-3 gap-4">
              {/* 30ml - Sold Out */}
              <div className="relative flex flex-col items-center justify-center rounded-sm border border-gray-200 py-4 opacity-50 cursor-not-allowed bg-gray-50">
                <div className="absolute -top-3 bg-gray-200 px-3 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 rounded-sm">
                  ÉPUISÉ
                </div>
                <span className="font-serif text-xl font-bold italic text-gray-400">30ml</span>
                <span className="font-serif text-base italic text-gray-400">100 DH</span>
              </div>

              {/* 50ml - Selected */}
              <button
                onClick={() => setSelectedSize('50ml')}
                className={`flex flex-col items-center justify-center rounded-sm border-2 py-4 transition-colors ${
                  selectedSize === '50ml' ? 'border-[#4a403a] bg-white' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className={`font-serif text-xl font-bold italic ${selectedSize === '50ml' ? 'text-gray-900' : 'text-gray-600'}`}>
                  50ml
                </span>
                <span className={`font-serif text-base italic ${selectedSize === '50ml' ? 'text-gray-600' : 'text-gray-400'}`}>
                  140 DH
                </span>
              </button>

              {/* 100ml - Available */}
              <button
                onClick={() => setSelectedSize('100ml')}
                className={`flex flex-col items-center justify-center rounded-sm border py-4 transition-colors ${
                  selectedSize === '100ml' ? 'border-[#4a403a] border-2 bg-white' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className={`font-serif text-xl font-bold italic ${selectedSize === '100ml' ? 'text-gray-900' : 'text-gray-600'}`}>
                  100ml
                </span>
                <span className={`font-serif text-base italic ${selectedSize === '100ml' ? 'text-gray-600' : 'text-gray-400'}`}>
                  220 DH
                </span>
              </button>
            </div>

            {/* Accordion */}
            <div className="border-t border-gray-200 pt-6 mt-auto">
              <button
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="flex w-full items-center justify-between text-left group"
              >
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Description</span>
                {isDescriptionOpen ? (
                  <ChevronUp className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                )}
              </button>
              
              {isDescriptionOpen && (
                <div className="mt-6 text-base leading-relaxed text-gray-600 space-y-4">
                  <p>
                    Le Sugar Pop Body Butter est un soin corporel riche et onctueux, formulé pour hydrater, adoucir et sublimer la peau. Sa texture crémeuse fond instantanément au contact de la peau, laissant un fini soyeux sans effet gras.
                  </p>
                  <p>
                    Enrichi en beurre de cacao, huile d'amande douce et vitamine E, il aide à nourrir la peau en profondeur, à améliorer son élasticité et à la protéger du dessèchement quotidien.
                  </p>
                  <p>
                    Idéal pour une utilisation quotidienne, surtout après la douche.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}