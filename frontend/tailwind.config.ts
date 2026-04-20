import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // Aura Essence store palette
        'aura-gold':       '#D4AF37',
        'aura-purple':     '#634A8E',
        'aura-soft-gray':  '#F9F9F9',
        'aura-accent':     '#E5D9F2',
        // Internal brand (admin/auth)
        brand: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          900: '#581c87',
        },
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
      },
    },
  },
  safelist: [
    // Order status badge colors
    'bg-yellow-50', 'text-yellow-700', 'border-yellow-200', 'bg-yellow-500',
    'bg-blue-50', 'text-blue-700', 'border-blue-200', 'bg-blue-500',
    'bg-purple-50', 'text-purple-700', 'border-purple-200', 'bg-purple-500',
    'bg-green-50', 'text-green-700', 'border-green-200', 'bg-green-500',
    'bg-red-50', 'text-red-700', 'border-red-200', 'bg-red-500',
    'bg-orange-50', 'text-orange-700', 'border-orange-200', 'bg-orange-500',
    // Review status colors
    'bg-orange-50', 'text-orange-700', 'border-orange-200',
    // Product stock colors
    'bg-green-50', 'text-green-600', 'border-green-200', 'bg-green-500',
    'bg-orange-50', 'text-orange-600', 'border-orange-200', 'bg-orange-400',
    'bg-gray-50', 'text-gray-500', 'border-gray-200', 'bg-gray-400',
    // Coupon colors
    'bg-slate-50', 'text-slate-600', 'border-slate-200', 'bg-slate-400',
  ],
  plugins: [],
};

export default config;
