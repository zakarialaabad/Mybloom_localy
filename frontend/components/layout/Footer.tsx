import Link from 'next/link';

const SOCIAL = ['Instagram', 'Facebook', 'Twitter', 'Pinterest'] as const;

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 pb-10 pt-20">
      <div className="container mx-auto px-4 text-center">
        {/* Brand */}
        <div className="mb-8">
          <Link href="/" className="font-serif text-3xl italic leading-none text-aura-purple">
            Aura Essence
          </Link>
        </div>

        <p className="mx-auto mb-8 max-w-md text-sm text-gray-400">
          Your destination for luxury scents and premium beauty essentials.
          Crafting elegance in every drop since 2024.
        </p>

        {/* Social links */}
        <div className="mb-12 flex justify-center space-x-6 text-gray-400">
          {SOCIAL.map((name) => (
            <Link
              key={name}
              href="#"
              className="transition-colors hover:text-aura-purple"
            >
              {name}
            </Link>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-widest text-gray-400">
          © {new Date().getFullYear()} Aura Essence. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
