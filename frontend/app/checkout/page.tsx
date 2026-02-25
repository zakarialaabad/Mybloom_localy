import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-8 font-serif">
          <Link href="/" className="hover:text-gray-800">Home</Link> / <Link href="/cart" className="hover:text-gray-800">Panier</Link> / <span className="text-gray-800">Shipping</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Form */}
          <div className="flex-1 lg:w-[60%]">
            <h1 className="text-2xl font-serif font-bold text-gray-800 mb-8">Shipping Addres</h1>

            <form className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">First Name *</label>
                  <input type="text" defaultValue="Ayoub" className="w-full border-2 border-[#b89b72] rounded-sm px-4 py-3 focus:outline-none bg-[#fdfbf9] font-serif" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Last Name *</label>
                  <input type="text" defaultValue="LAGHZAL" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif" />
                </div>
              </div>

              {/* Phone Row */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Phone number *</label>
                <div className="flex border border-gray-200 rounded-sm focus-within:border-[#b89b72]">
                  <select className="bg-gray-50 border-r border-gray-200 px-4 py-3 focus:outline-none font-serif text-gray-700">
                    <option>MAR</option>
                  </select>
                  <input type="tel" defaultValue="+ 212 6 11 95 50 60" className="flex-1 px-4 py-3 focus:outline-none font-serif text-gray-600" />
                </div>
              </div>

              {/* City Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">City *</label>
                  <input type="text" defaultValue="Casablanca" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif text-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Quartier *</label>
                  <input type="text" defaultValue="Casablanca" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif text-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Zip Code</label>
                  <input type="text" defaultValue="20230" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif text-gray-600" />
                </div>
              </div>

              {/* Address Row */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Adress</label>
                <input type="text" defaultValue="N° 10, Rue XYZ, Appt 3 Hay Hassani 20230 ,CASABLANCA MAROC" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif text-gray-600" />
              </div>

              {/* Shipping Methods */}
              <div className="pt-6">
                <h2 className="text-xl font-serif font-bold text-gray-800 mb-6">Mode d'expédition</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Method 1 */}
                  <label className="border border-gray-200 rounded-sm p-4 cursor-pointer hover:border-[#b89b72] transition-colors flex flex-col relative">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-transparent"></div>
                        </div>
                        <span className="font-serif font-bold text-gray-800 text-sm">Free Shipping</span>
                      </div>
                      <span className="font-serif font-bold text-gray-900 text-sm">0 Dh</span>
                    </div>
                    <span className="text-xs text-gray-500 font-serif ml-6">Laayoune</span>
                  </label>

                  {/* Method 2 */}
                  <label className="border border-gray-200 rounded-sm p-4 cursor-pointer hover:border-[#b89b72] transition-colors flex flex-col relative">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-transparent"></div>
                        </div>
                        <span className="font-serif font-bold text-gray-800 text-sm">Région</span>
                      </div>
                      <span className="font-serif font-bold text-gray-900 text-sm">20 Dh</span>
                    </div>
                    <span className="text-xs text-gray-500 font-serif ml-6">Laayoune-Sakia el Hamra</span>
                  </label>

                  {/* Method 3 (Active) */}
                  <label className="border-2 border-[#b89b72] bg-[#fdfbf9] rounded-sm p-4 cursor-pointer flex flex-col relative">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                        </div>
                        <span className="font-serif font-bold text-gray-800 text-sm">National</span>
                      </div>
                      <span className="font-serif font-bold text-gray-900 text-sm">35 Dh</span>
                    </div>
                    <span className="text-xs text-gray-500 font-serif ml-6">Tous les villes du maroc</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="mt-12">
              <Link href="#" className="text-sm text-gray-500 underline font-serif hover:text-gray-800">Politique de confidentialité</Link>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-[40%] bg-[#fcfcfc] p-8 border border-gray-100 rounded-sm h-fit">
            <h2 className="text-lg font-serif font-bold text-gray-800 mb-8">Your Cart</h2>

            {/* Cart Items */}
            <div className="space-y-6 mb-8">
              {/* Item 1 */}
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-20 bg-gray-100 rounded-sm shrink-0 border border-gray-200">
                  <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200" alt="Sugar Pop" fill className="object-cover mix-blend-multiply p-2" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-[10px] flex items-center justify-center rounded-full font-serif">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-gray-900 text-sm">SUGAR POP</h4>
                  <p className="font-serif italic text-xs text-gray-400 mt-0.5">Body Butter / Size 50ml</p>
                </div>
                <div className="font-serif font-bold italic text-gray-900 text-sm">140 DH</div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-20 bg-gray-100 rounded-sm shrink-0 border border-gray-200">
                  <Image src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200" alt="Over Dose" fill className="object-cover mix-blend-multiply p-2" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-[10px] flex items-center justify-center rounded-full font-serif">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-gray-900 text-sm">OVER DOSE</h4>
                  <p className="font-serif italic text-xs text-gray-400 mt-0.5">Bold Body Mist / Size 50ml</p>
                </div>
                <div className="font-serif font-bold italic text-gray-900 text-sm">340 DH</div>
              </div>
              
              {/* Item 3 (Faded out like in screenshot) */}
              <div className="flex gap-4 items-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fcfcfc] z-10"></div>
                <div className="relative w-20 h-20 bg-gray-100 rounded-sm shrink-0 border border-gray-200">
                  <Image src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200" alt="Sugar Pop" fill className="object-cover mix-blend-multiply p-2" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-[10px] flex items-center justify-center rounded-full font-serif z-20">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-gray-900 text-sm">SUGAR POP</h4>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 font-serif mb-3">If you have a coupon code, please apply it below</p>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  defaultValue="mybloomAz"
                  className="flex-1 border-2 border-dashed border-[#2e7d32] text-[#2e7d32] rounded-sm px-4 py-3 text-sm focus:outline-none bg-[#f4fbf5] font-serif"
                />
                <button className="bg-[#005c2b] text-white px-6 py-3 rounded-sm font-serif italic text-sm hover:bg-[#004a22] transition-colors whitespace-nowrap">
                  Coupon validé
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-serif font-bold text-gray-800 text-sm">Your Price</span>
                <span className="font-serif font-bold italic text-gray-900">760 DH</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-serif font-bold text-gray-800 text-sm">Expédition</div>
                  <div className="font-serif italic text-xs text-gray-500 mt-0.5">Gratuit dès 590 DH</div>
                </div>
                <span className="font-serif font-bold italic text-gray-900">0 DH</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-serif font-bold text-gray-800 text-sm">Coupon</div>
                  <div className="font-serif italic text-xs text-gray-500 mt-0.5">Ajoutez un code promo et économisez sur votre commande.</div>
                </div>
                <span className="font-serif font-bold italic text-gray-900">40 DH</span>
              </div>
              
              <hr className="border-gray-200 my-4" />
              
              <div className="flex justify-between items-center">
                <span className="font-serif font-bold text-gray-800">Total</span>
                <span className="font-serif font-bold italic text-xl text-gray-900">720 DH</span>
              </div>
            </div>

            {/* Action Button */}
            <Link 
              href="/success"
              className="block w-full text-center bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-base hover:bg-[#3a322d] transition-colors"
            >
              Acheter maintenant ›
            </Link>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
