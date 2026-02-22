"use client";
import SectionContainer from '@/components/SectionContainer';

export default function CustomerReviewsSection() {
  return (
    <section className="mt-12 py-20 bg-white border-t border-gray-100" id="customer-reviews">
      <SectionContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Rating Summary */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-4xl font-serif text-gray-800">
              Nos Clients, <span className="italic text-aura-gold">Notre Fierté</span>
            </h2>
            <div className="flex items-start gap-8">
              <div className="text-center">
                <div className="text-7xl font-serif text-gray-800">4,5</div>
                <div className="flex justify-center text-aura-gold my-2">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg className="w-4 h-4 fill-current opacity-30" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-tighter">2689 au total</div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-2">5</span>
                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
                    <div className="bg-aura-gold h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-2">4</span>
                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
                    <div className="bg-aura-gold h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-2">3</span>
                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
                    <div className="bg-aura-gold h-full rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-2">2</span>
                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
                    <div className="bg-aura-gold h-full rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-2">1</span>
                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full">
                    <div className="bg-aura-gold h-full rounded-full" style={{ width: '2%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-8 italic text-gray-500 text-sm leading-relaxed border-t border-gray-50">
              "Nous croyons que l'excellence ne se revendique pas, elle se constate."
              Chaque produit présenté sur notre boutique est accompagné de notations attribuées par des clients réels, après réception et utilisation.
            </div>
            <a className="inline-block text-xs font-semibold underline uppercase tracking-widest text-gray-800 hover:text-aura-gold transition-colors" href="#">Read All Reviews</a>
          </div>

          {/* Right Column: Testimonials Carousel */}
          <div className="lg:col-span-8 relative">
            <div className="flex gap-6 overflow-hidden">
              {/* Review Card 1 */}
              <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100">
                  <img alt="Review Item" className="w-full h-full object-contain mix-blend-multiply p-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyl3GrcFE17JoEJNvOf9ZJMzxlxrZmfg4EUOWHo60uMD4EGj2gBUopjHKk8wQkMBt8M4SztrtddZVblKaLtHr-OK_l4Zx28-iHpx6Sa7KMnJkEQDiecBMcUU5yJ7zwA3RQEmYeJYhUihMwQteNoCPYothbIU3w6XzOymHDV_weHVk8dKOQKz3O924F5Y03A2S1xIEo7EYBu5inrX9V344pdiNhgdn6E9AKATBxBYuj2sNeYcpmxeJ9cDDysGYofhwtpTX-mB6cwu0" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-right" dir="rtl">واعررررريين كيحمققوووو 😍😍😍😍</p>
                  <p className="text-xs text-gray-400 text-right" dir="rtl">شكرااا بزااف.</p>
                </div>
                <div className="pt-4 border-t border-gray-50 flex flex-col items-center">
                  <span className="text-xs font-semibold text-gray-800">Zineb Elmakoudi</span>
                  <div className="flex text-aura-gold scale-75">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  </div>
                  <span className="text-[8px] text-gray-300">16 mai 2024</span>
                </div>
              </div>

              {/* Review Card 2 */}
              <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="aspect-square w-full rounded-xl overflow-hidden">
                  <img alt="Review Interface" className="w-full h-full object-cover scale-150" src="{{DATA:IMAGE:IMAGE_14}}" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-700 text-right leading-relaxed" dir="rtl">
                    لبنى الله يعطيك صحة تبارك الله هاد ريحة عرفتي شحال شريتها من مرة ماعمر ريحتها كانت بحال هادي كيما شميتها اول مرة الله يسهل عليك
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-50 flex flex-col items-center">
                  <span className="text-xs font-semibold text-gray-800">Zineb Elmakoudi</span>
                  <div className="flex text-aura-gold scale-75">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  </div>
                  <span className="text-[8px] text-gray-300">16 mai 2024</span>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-md text-gray-400 opacity-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
            <button className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-white/80 border border-gray-100 rounded-full w-10 h-10 flex items-center justify-center shadow-md text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
            </button>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
