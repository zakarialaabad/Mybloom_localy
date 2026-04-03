import Header from '@/components/layout/Header';
import Link from 'next/link';
import { ChevronRight, Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | MyBloom',
  description: 'Get in touch with MyBloom for any inquiries regarding our luxury perfumes.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f9]">
      <Header />
      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-[#fff9f9] border-b border-[#f5eedf] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-serif text-[#403531] mb-4">Contact Us</h1>
            <div className="w-12 h-[2px] bg-[#da2966] mx-auto mb-6"></div>
            <p className="text-[#888] font-serif text-[15px] italic">
              We would love to hear from you.
            </p>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-[12px] font-serif text-gray-400">
              <Link href="/" className="hover:text-[#da2966] transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#403531]">Contact Us</span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24">
            
            {/* Contact Information */}
            <div className="font-serif text-[#555]">
              <h2 className="text-2xl text-[#4a403a] mb-8 font-bold tracking-wide">Get In Touch</h2>
              <p className="mb-10 text-[15px] leading-relaxed">
                Have questions about our perfumes, an existing order, or just want to say hello? 
                Fill out the form, and our customer service team will get back to you within 24 hours.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#fdfcfb] border border-[#f5eedf] flex items-center justify-center flex-shrink-0 text-[#da2966]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#403531] mb-1">Email</h3>
                    <p className="text-[14px] text-[#888]">contact@mybloom.ma</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#fdfcfb] border border-[#f5eedf] flex items-center justify-center flex-shrink-0 text-[#da2966]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#403531] mb-1">Phone</h3>
                    <p className="text-[14px] text-[#888]">+212 5XX XX XX XX</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#fdfcfb] border border-[#f5eedf] flex items-center justify-center flex-shrink-0 text-[#da2966]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#403531] mb-1">Address</h3>
                    <p className="text-[14px] text-[#888]">123 Luxury Avenue, Casablanca, Morocco</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#fdfcfb] border border-[#f5eedf] flex items-center justify-center flex-shrink-0 text-[#da2966]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#403531] mb-1">Business Hours</h3>
                    <p className="text-[14px] text-[#888]">Monday - Friday: 9am - 6pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-[#f5eedf] rounded-[8px] p-6 sm:p-8 md:p-10 shadow-sm">
              <form className="space-y-5 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-[13px] font-sans text-[#888] uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full border border-gray-200 rounded-[3px] px-4 py-3 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-colors font-sans text-[14px]"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[13px] font-sans text-[#888] uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full border border-gray-200 rounded-[3px] px-4 py-3 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-colors font-sans text-[14px]"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-[13px] font-sans text-[#888] uppercase tracking-wider mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full border border-gray-200 rounded-[3px] px-4 py-3 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-colors font-sans text-[14px]"
                    placeholder="Order Inquiry"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-[13px] font-sans text-[#888] uppercase tracking-wider mb-2">Message</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    className="w-full border border-gray-200 rounded-[3px] px-4 py-3 focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-colors font-sans text-[14px] resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button 
                  type="button" 
                  className="w-full bg-[#403531] text-white px-6 py-4 rounded-[3px] text-[14px] font-sans uppercase tracking-widest hover:bg-[#da2966] transition-colors duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
