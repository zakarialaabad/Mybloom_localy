import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | MyBloom',
  description: 'How we collect, use, and protect your personal information at MyBloom.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-[#fcfcfc] border-b border-[#f5eedf] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-serif text-[#403531] mb-4">Privacy Policy</h1>
            <div className="w-12 h-[2px] bg-[#da2966] mx-auto mb-6"></div>
            <p className="text-[#888] font-serif text-[15px] italic">
              Last updated: April 3, 2026
            </p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-[12px] font-serif text-gray-400">
              <Link href="/" className="hover:text-[#da2966] transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#403531]">Privacy Policy</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="prose prose-sm md:prose-base max-w-none text-[#555] font-serif leading-relaxed">
            
            <p className="mb-10 text-[15px]">
              Welcome to <strong>MyBloom</strong>. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our website 
              (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">1. Information We Collect</h2>
            <p className="mb-6 text-[15px]">
              When you purchase something from our store, as part of the buying and selling process, we collect the personal 
              information you give us such as your name, address, phone number, and email address. We also automatically receive 
              your computer&#39;s internet protocol (IP) address in order to provide us with information that helps us learn about 
              your browser and operating system.
            </p>
            <ul className="list-disc pl-5 mb-8 space-y-3 marker:text-[#da2966]">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address, and telephone numbers.</li>
              <li><strong>Financial Data:</strong> details about payments to and from you via our secure payment partners.</li>
              <li><strong>Transaction Data:</strong> details about products and services you have purchased from us.</li>
            </ul>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">2. How We Use Your Data</h2>
            <p className="mb-6 text-[15px]">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-5 mb-8 space-y-3 marker:text-[#da2966]">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., fulfilling an order).</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal or regulatory obligation.</li>
            </ul>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">3. Disclosure of Your Data</h2>
            <p className="mb-8 text-[15px]">
              We may share your Personal Data with third parties such as service providers (e.g., delivery companies, payment gateways). 
              We require all third parties to respect the security of your personal data and to treat it in accordance with the law. 
              We do not allow our third-party service providers to use your personal data for their own purposes and only permit them 
              to process your personal data for specified purposes and in accordance with our instructions.
            </p>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">4. Data Security</h2>
            <p className="mb-8 text-[15px]">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, 
              or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those 
              employees, agents, contractors, and other third parties who have a business need to know.
            </p>

            <h2 className="text-2xl text-[#403531] mb-6 mt-12 font-bold tracking-wide">5. Your Legal Rights</h2>
            <p className="mb-6 text-[15px]">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
            </p>
            <ul className="list-disc pl-5 mb-8 space-y-3 marker:text-[#da2966]">
              <li>Request access to your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request erasure of your personal data.</li>
              <li>Object to processing of your personal data.</li>
            </ul>

            <div className="bg-[#fcfcfc] border border-[#f5eedf] rounded-[5px] p-6 sm:p-8 mt-12 sm:mt-16 text-center">
              <h3 className="text-xl text-[#403531] mb-3 font-semibold">Questions about your privacy?</h3>
              <p className="text-[14px] text-[#888] mb-0">
                If you have any questions about this privacy policy, please contact our support team at{' '}
                <a href="mailto:privacy@mybloom.ma" className="text-[#da2966] hover:underline font-bold">privacy@mybloom.ma</a>
              </p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
