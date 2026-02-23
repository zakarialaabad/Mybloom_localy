'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Share2, ChevronUp, ChevronDown, Truck, Clock, Banknote, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('50ml');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const [isFaqOpen, setIsFaqOpen] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
          {/* Left Side - Images (Sticky) */}
          <div className="flex w-full md:w-1/2 gap-4 sticky top-24">
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

            {/* Accordion: Description */}
            <div className="border-t border-gray-200 pt-6 mt-12">
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

            {/* Accordion: Ingrédients */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={() => setIsIngredientsOpen(!isIngredientsOpen)}
                className="flex w-full items-center justify-between text-left group"
              >
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Ingrédients</span>
                {isIngredientsOpen ? (
                  <ChevronUp className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                )}
              </button>
              
              {isIngredientsOpen && (
                <div className="mt-8 flex justify-center gap-8 sm:gap-16">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100 relative">
                      <Image src="https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&q=80&w=200" alt="Cocoa Butter" fill className="object-cover" />
                    </div>
                    <span className="font-serif text-gray-500">Cocoa Butter</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100 relative">
                      <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200" alt="Almond Oil" fill className="object-cover" />
                    </div>
                    <span className="font-serif text-gray-500">Almond Oil</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100 relative">
                      <Image src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200" alt="Vitamin E" fill className="object-cover" />
                    </div>
                    <span className="font-serif text-gray-500">Vitamin E</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Delivery & Retourns */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                className="flex w-full items-center justify-between text-left group"
              >
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Delivery & Retourns</span>
                {isDeliveryOpen ? (
                  <ChevronUp className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                )}
              </button>
              
              {isDeliveryOpen && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-700">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-gray-900">Fast Dispatch</h4>
                      <p className="text-sm text-gray-500 mt-1">Orders are dispatched within 24 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-700">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-gray-900">Delivery Time</h4>
                      <p className="text-sm text-gray-500 mt-1">Delivered within 1-3 business days.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-700">
                      <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-gray-900">Cash on Delivery</h4>
                      <p className="text-sm text-gray-500 mt-1">Pay conveniently upon delivery.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-700">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-gray-900">Returns & Refunds</h4>
                      <p className="text-sm text-gray-500 mt-1">Refund or replacement if damaged.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: Reviews */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={() => setIsReviewsOpen(!isReviewsOpen)}
                className="flex w-full items-center justify-between text-left group"
              >
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">Reviews</span>
                {isReviewsOpen ? (
                  <ChevronUp className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                )}
              </button>
              
              {isReviewsOpen && (
                <div className="mt-8">
                  <p className="text-center font-serif italic text-gray-500 mb-8">
                    "Nous croyons que l'excellence ne se revendique pas, elle se constate"
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12">
                    <div className="text-center">
                      <div className="text-6xl font-serif italic text-gray-900 mb-2">4,9</div>
                      <div className="flex text-[#d4af37] justify-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">2689 au total</div>
                    </div>
                    
                    <div className="flex-1 w-full max-w-xs space-y-2">
                      {[
                        { stars: 5, percent: 90 },
                        { stars: 4, percent: 8 },
                        { stars: 3, percent: 2 },
                        { stars: 2, percent: 0 },
                        { stars: 1, percent: 0 },
                      ].map((row) => (
                        <div key={row.stars} className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 w-2">{row.stars}</span>
                          <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#d4af37]" style={{ width: `${row.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Cards Carousel (Mock) */}
                  <div className="relative flex gap-4 overflow-x-auto pb-4 snap-x">
                    {/* Card 1 */}
                    <div className="min-w-[280px] snap-center rounded-xl border border-gray-200 p-4 flex flex-col">
                      <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4 bg-gray-100">
                        <Image src="https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=400" alt="Review image" fill className="object-cover" />
                      </div>
                      <div className="text-center">
                        <h5 className="font-serif font-bold text-gray-900">Zineb Elmakoudi</h5>
                        <div className="flex text-[#d4af37] justify-center my-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">16 nov. 2025</p>
                      </div>
                    </div>
                    {/* Card 2 */}
                    <div className="min-w-[280px] snap-center rounded-xl border border-gray-200 p-4 flex flex-col">
                      <div className="relative h-48 w-full rounded-lg overflow-hidden mb-4 bg-gray-100">
                        <Image src="https://images.unsplash.com/photo-1615397323744-8d2111111111?auto=format&fit=crop&q=80&w=400" alt="Review image" fill className="object-cover" />
                      </div>
                      <div className="text-center">
                        <h5 className="font-serif font-bold text-gray-900">Zineb Elmakoudi</h5>
                        <div className="flex text-[#d4af37] justify-center my-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">16 nov. 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion: FAQ */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={() => setIsFaqOpen(!isFaqOpen)}
                className="flex w-full items-center justify-between text-left group"
              >
                <span className="font-serif text-2xl italic text-gray-900 group-hover:text-[#4a403a] transition-colors">FAQ</span>
                {isFaqOpen ? (
                  <ChevronUp className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-500 group-hover:text-gray-900 transition-colors" />
                )}
              </button>
              
              {isFaqOpen && (
                <div className="mt-6 space-y-4">
                  {[
                    { q: "Is this body butter suitable for all skin types?", a: "Yes, it is suitable for all skin types, including dry and sensitive skin." },
                    { q: "How do I use this body butter?", a: "Apply a generous amount to clean, dry skin and massage gently until fully absorbed." },
                    { q: "How often can I use it?", a: "For best results, use daily after showering or bathing." },
                    { q: "Does it leave a greasy feeling?", a: "No, our formula is designed to absorb quickly without leaving a greasy residue." },
                  ].map((faq, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                      <button 
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <span className="font-serif text-lg font-bold italic text-gray-900">{faq.q}</span>
                        {openFaqIndex === idx ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      {openFaqIndex === idx && (
                        <p className="mt-3 text-gray-500 text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* You may also Like Section */}
        <div className="mt-24">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
              You may also <span className="italic text-[#d4af37] font-light">Like</span>
            </h2>
          </div>

          <div className="relative group/carousel">
            {/* Combined Navigation Arrows positioned at left and right centers */}
            <button className="absolute -left-4 sm:-left-6 top-[35%] -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 shadow-xl hover:text-gray-900 hover:scale-110 transition-all">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button className="absolute -right-4 sm:-right-6 top-[35%] -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 shadow-xl hover:text-gray-900 hover:scale-110 transition-all">
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="flex gap-6 overflow-x-auto pb-8 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 1, name: 'Over Dose', subtitle: 'Bold Body Mist', desc: 'Warm & Sensual Fragrance', price: 140, oldPrice: 200, rating: 4.4, reviews: 180, discount: '- 30 %', liked: true, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400' },
              { id: 2, name: 'Over Dose', subtitle: 'Bold Body Mist', desc: 'Warm & Sensual Fragrance', price: 140, oldPrice: 200, rating: 4.4, reviews: 180, discount: '- 30 %', liked: false, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400' },
              { id: 3, name: 'Over Dose', subtitle: 'Bold Body Mist', desc: 'Warm & Sensual Fragrance', price: 140, oldPrice: 200, rating: 4.4, reviews: 180, discount: '- 30 %', liked: false, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400' },
              { id: 4, name: 'Over Dose', subtitle: 'Bold Body Mist', desc: 'Warm & Sensual Fragrance', price: 140, oldPrice: 200, rating: 4.4, reviews: 180, discount: '- 30 %', liked: false, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400' },
              { id: 5, name: 'Over Dose', subtitle: 'Bold Body Mist', desc: 'Warm & Sensual Fragrance', price: 140, oldPrice: 200, rating: 4.4, reviews: 180, discount: '- 30 %', liked: false, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=400' },
            ].map((item) => (
              <div key={item.id} className="min-w-[260px] sm:min-w-[280px] snap-start group cursor-pointer">
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full bg-[#f8f8f8] mb-4 overflow-hidden">
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10">
                    <button className="text-red-500 hover:scale-110 transition-transform">
                      <Heart className={`h-5 w-5 ${item.liked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-[#fdf6e3] text-[#b8860b] text-xs font-medium px-2 py-1 rounded-sm">
                      {item.discount}
                    </span>
                  </div>
                  {/* Image */}
                  <Image src={item.image} alt={item.name} fill className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-gray-900">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.subtitle}</p>
                  <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bold text-gray-900">{item.price} DH</span>
                    <span className="text-sm text-gray-400 line-through">{item.oldPrice} DH</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex text-[#d4af37]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{item.rating} ({item.reviews})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>

      <Footer />
    </div>
  );
}