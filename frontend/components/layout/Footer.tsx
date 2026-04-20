'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { storeService } from '@/services/api';

// TikTok SVG (not in lucide)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

// WhatsApp SVG (not in lucide)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

// Snapchat SVG (not in lucide) - Outline style to match lucide icons
function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3c-3.866 0-5.5 2.5-5.5 5.5 0 1.8.6 3.2 1.5 4.2-.4.8-.5 1.5-.5 2.3 0 1.5 1 2.5 2 2.5.4 0 .8-.1 1.2-.3.8.5 1.8.8 2.8.8s2-.3 2.8-.8c.4.2.8.3 1.2.3 1 0 2-1 2-2.5 0-.8-.1-1.5-.5-2.3.9-1 1.5-2.4 1.5-4.2 0-3-1.634-5.5-5.5-5.5z" />
      <path d="M8.5 14c-.5.5-1 1-2 1" />
      <path d="M15.5 14c.5.5 1 1 2 1" />
    </svg>
  );
}

export default function Footer() {
  const [contact, setContact] = useState<{ email: string | null; phone: string | null }>({
    email: 'Bloomparfums1@gmail.com',
    phone: '06 08 65 62 71',
  });

  useEffect(() => {
    storeService.getContact().then(setContact).catch(() => {});
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main content */}
      <div className="container mx-auto px-4 md:px-[69px] pt-16 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-10 md:gap-4 lg:gap-8">

          {/* Col 1 — Logo + tagline + social */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-5 inline-block">
              <Image
                src="/logo.png"
                alt="MyBloom Logo"
                width={130}
                height={40}
                className="object-contain h-[36px] w-auto"
              />
            </Link>
            <p className="text-[12px] text-gray-500 leading-loose mb-8 md:max-w-none">
              Notre objectif : vous offrir des produits qui allient<br className="hidden md:block"/> qualité, performance et satisfaction.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: 'https://www.instagram.com/my_bloom.ma?igsh=MTV4Y29odHI4b3NqNw%3D%3D&utm_source=qr', icon: <Instagram className="w-[18px] h-[18px]" />, label: 'Instagram' },
                { href: 'https://www.facebook.com/share/1AzUrWv47t/?mibextid=wwXIfr',  icon: <Facebook className="w-[18px] h-[18px]" />,  label: 'Facebook'  },
                { href: 'https://www.tiktok.com/@my.bloom.ma?_r=1&_t=ZS-95fpT2RLgaP',    icon: <TikTokIcon className="w-[16px] h-[16px]" />, label: 'TikTok'    },
                { href: 'https://www.snapchat.com/add/bloom_parfum?share_id=AAULxDsQR66nH9XmS_Hb_A&locale=fr_GB',  icon: <SnapchatIcon className="w-[18px] h-[18px]" />, label: 'Snapchat' },
                { href: 'https://wa.me/212608656271', icon: <WhatsAppIcon className="w-[17px] h-[17px]" />, label: 'WhatsApp' },
              ].map(({ href, icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-[38px] h-[38px] rounded-full bg-[#f1f1f1] flex items-center justify-center text-gray-700 hover:bg-[#da2966] hover:text-white transition-colors"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 2 — NOS COLLECTIONS */}
          <div className="flex flex-col items-center md:items-start mt-4 md:mt-0">
            <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-6">
              NOS COLLECTIONS
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Cadeaux', href: '/collection?is_gift=true' },
                { label: 'Parfums', href: '/collection?product_type=parfums' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — BEAUTÉ & SOINS */}
          <div className="flex flex-col items-center md:items-start mt-4 md:mt-0">
            <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-6">
              BEAUTÉ & SOINS
            </h4>
            <ul className="space-y-4">
              {[
                { label: 'Corps', href: '/collection?product_type=corps' },
                { label: 'Cheveux', href: '/collection?product_type=cheveux' },
                { label: 'Visage', href: '/collection?product_type=visage' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — CONTACT */}
          <div className="flex flex-col items-center md:items-start mt-4 md:mt-0 md:pl-4">
            <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-6">
              CONTACT
            </h4>
            <ul className="space-y-4">
              <li>
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {contact.email}
                  </a>
                ) : (
                  <span className="text-[13px] text-gray-300 animate-pulse">loading…</span>
                )}
              </li>
              <li>
                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {contact.phone}
                  </a>
                ) : (
                  <span className="text-[13px] text-gray-300 animate-pulse">loading…</span>
                )}
              </li>
              <li>
                <span className="text-[13px] text-gray-500">Laayoune, Maroc</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 py-5 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-gray-400 text-center">
            © 2026 MyBloom. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="text-[12px] text-gray-400 hover:text-gray-900 transition-colors">
              Politique de confidentialité
            </Link>
            <span className="text-gray-300 text-[12px]">|</span>
            <Link href="/terms" className="text-[12px] text-gray-400 hover:text-gray-900 transition-colors">
              Conditions générales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

