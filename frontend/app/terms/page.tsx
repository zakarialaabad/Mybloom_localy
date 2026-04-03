import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions | MyBloom',
  description: 'Terms and conditions for purchasing from MyBloom store.',
};

export default function TermsConditionsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fff9f9]">
        {/* Page Header */}
        <div className="bg-[#fff9f9] border-b border-[#f5eedf] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-serif text-[#403531] mb-4">Terms & Conditions</h1>
            <div className="w-12 h-[2px] bg-[#da2966] mx-auto mb-6"></div>
            <p className="text-[#888] font-serif text-[15px] italic">
              Effective from: April 3, 2026
            </p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-[12px] font-serif text-gray-400">
              <Link href="/" className="hover:text-[#da2966] transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#403531]">Terms & Conditions</span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="bg-white border border-[#f5eedf] rounded-[8px] p-5 sm:p-8 md:p-12 shadow-sm font-serif text-[#555] leading-relaxed relative">
            
            {/* Background absolute subtle pattern placeholder (optional) */}
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none p-4">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="#403531"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>

            <p className="mb-10 text-[15px] first-letter:text-[40px] first-letter:font-bold first-letter:text-[#da2966] first-letter:mr-1 first-letter:float-left">
              These Terms & Conditions outline the rules and regulations for the use of MyBloom&#39;s Website, 
              located at <strong>www.mybloom.ma</strong>. By accessing this website we assume you accept these 
              terms and conditions. Do not continue to use MyBloom if you do not agree to take all of the terms 
              and conditions stated on this page.
            </p>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              1. Definitions
            </h2>
            <p className="mb-6 text-[15px]">
              &quot;Client&quot;, &quot;You&quot; and &quot;Your&quot; refers to you, the person log on this website and 
              compliant to the Company&#39;s terms and conditions. &quot;The Company&quot;, &quot;Ourselves&quot;, 
              &quot;We&quot;, &quot;Our&quot; and &quot;Us&quot;, refers to our Company. &quot;Party&quot;, 
              &quot;Parties&quot;, or &quot;Us&quot;, refers to both the Client and ourselves.
            </p>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              2. Products and Purchases
            </h2>
            <p className="mb-6 text-[15px]">
              Our luxury perfumes, body mists, and body butters are produced with the highest standards. However, packaging, dimensions, 
              and colors may vary slightly from the images shown online. 
              By completing an order, you agree to:
            </p>
            <ul className="list-inside mb-8 space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-[#da2966] mt-1 font-bold">»</span> 
                Provide accurate shipping, billing, and contact information.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#da2966] mt-1 font-bold">»</span> 
                Confirm that the payment method you use is legally yours.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#da2966] mt-1 font-bold">»</span> 
                Not use our products for resale or commercial distribution without explicit written permission.
              </li>
            </ul>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              3. Pricing and Availability
            </h2>
            <p className="mb-8 text-[15px]">
              Prices for our products are subject to change without notice. We reserve the right at any time to modify or 
              discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable 
              to you or to any third-party for any modification, price change, suspension or discontinuance of our perfumes.
            </p>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              4. Shipping, Cancellation, and Returns
            </h2>
            <p className="mb-6 text-[15px]">
              Please refer to our Shipping Policy for details on delivery times and costs. Orders may only be cancelled 
              before they have reached the &quot;Processing&quot; or &quot;Shipped&quot; status. Due to the sensitive nature 
              of luxury cosmetics, we only accept returns for items that arrive damaged or significantly not as described 
              within 7 days of delivery.
            </p>

            <h2 className="text-2xl text-[#4a403a] mb-6 mt-12 font-bold tracking-wide border-l-4 border-[#da2966] pl-4">
              5. Intellectual Property
            </h2>
            <p className="mb-8 text-[15px]">
              Unless otherwise stated, MyBloom and/or its licensors own the intellectual property rights for all material on 
              the website. All intellectual property rights are reserved. You may access this from MyBloom for your own 
              personal use subjected to restrictions set in these terms and conditions.
            </p>

            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center bg-[#fdfcfb] px-6 py-4 rounded-[4px]">
              <p className="text-[13px] text-[#888] font-sans md:mb-0 mb-4 text-center md:text-left">
                Do you have further questions or need help?
              </p>
              <Link 
                href="/contact" 
                className="bg-[#403531] text-white px-5 py-2.5 rounded-[3px] text-[13px] font-sans hover:bg-[#2d2522] transition-colors"
              >
                Contact Legal Team
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
