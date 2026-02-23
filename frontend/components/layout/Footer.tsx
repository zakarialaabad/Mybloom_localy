import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 sm:gap-16">
          {/* Logo and Tagline */}
          <div className="md:col-span-1 flex flex-col items-start">
            <Link href="/" className="mb-6">
              <Image 
                src="/logo.jpeg" 
                alt="Bloom Parfums Logo" 
                width={120} 
                height={60} 
                className="h-auto"
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs font-serif italic">
              Notre objectif : vous offrir des produits qui allient qualité, performance et satisfaction.
            </p>
            <div className="flex gap-6 text-gray-700">
              <Link href="#" className="hover:text-gray-900 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links: ABOUT */}
          <div>
            <h4 className="font-serif font-bold text-gray-900 uppercase tracking-wider mb-8"> ABOUT</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-serif italic">
              <li><Link href="#" className="hover:text-gray-900 transition-colors">Partnership</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition-colors">Terms of Use</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Links: PRODUCT */}
          <div>
            <h4 className="font-serif font-bold text-gray-900 uppercase tracking-wider mb-8">PRODUCT</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-serif italic">
              <li><Link href="#" className="hover:text-gray-900 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Links: RESOURCES */}
          <div>
            <h4 className="font-serif font-bold text-gray-900 uppercase tracking-wider mb-8">RESOURCES</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-serif italic">
              <li><Link href="#" className="hover:text-gray-900 transition-colors">Career</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-gray-900 transition-colors">Legal</Link></li>
            </ul>
          </div>

          {/* Links: CONTACT */}
          <div>
            <h4 className="font-serif font-bold text-gray-900 uppercase tracking-wider mb-8">CONTACT</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-serif italic">
              <li><Link href="mailto:Bloom_parfum@gmail.com" className="hover:text-gray-900 transition-colors">Bloom_parfum@gmail.com</Link></li>
              <li><Link href="tel:+212611955060" className="hover:text-gray-900 transition-colors">+ 212 611 95 50 60</Link></li>
              <li><span className="text-gray-400">Laayoune, Maroc</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-20 pt-8 border-t border-transparent text-center">
          <p className="text-gray-400 text-sm font-serif italic">
            © 2026 Bloom Parfum. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
