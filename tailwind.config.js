/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          900: '#1E3A8A',
        },
        airbnb:  { DEFAULT: '#FF385C', light: '#FFF0F3' },
        booking: { DEFAULT: '#003580', light: '#E8EFFF' },
        direct:  { DEFAULT: '#059669', light: '#ECFDF5' },
        ink: {
          DEFAULT: '#0F172A',
          2:       '#475569',
          3:       '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft:  '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        card:  '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        pop:   '0 24px 48px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'sheet-in': 'sheetIn 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        'pop-in':   'popIn 0.18s ease-out',
        'shimmer':  'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        sheetIn: {
          from: { transform: 'translateY(100%)' },
          to:   { transform: 'translateY(0)' },
        },
        popIn: {
          '0%':   { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        shimmer: {
          '0%, 100%': { opacity: 0.5 },
          '50%':      { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
