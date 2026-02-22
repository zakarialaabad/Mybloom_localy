const BRANDS = [
  { label: 'GIORGIO ARMANI', className: 'text-xl font-bold font-serif' },
  { label: 'CHANEL',         className: 'text-xl font-bold' },
  { label: 'Dior',           className: 'text-xl font-serif' },
  { label: 'PRADA',          className: 'text-xl font-bold tracking-tighter' },
  { label: 'LANCÔME',        className: 'text-xl font-medium italic' },
  { label: 'BOSS',           className: 'text-xl font-black' },
  { label: 'SAUVAGE',        className: 'text-xl font-serif' },
  { label: 'GUCCI',          className: 'text-xl font-bold' },
  { label: 'Balenciaga',     className: 'text-xl font-bold uppercase tracking-widest' },
];

export default function BrandLogos() {
  return (
    <section className="border-b border-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden">
          <div className="scrolling-row items-center justify-start gap-8 opacity-70
            grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
            {BRANDS.map(({ label, className }) => (
              <span key={label} className={className}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
