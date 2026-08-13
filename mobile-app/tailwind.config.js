/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Kurumsal kirmizi - butonlar, vurgular, logo
        isdemir: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          400: '#F04149',
          500: '#E11D25',
          600: '#C4131A',
          700: '#9E0F15',
        },
        // Sol paneldeki koyu tonlar
        kurum: {
          950: '#070708',
          900: '#0D0D0F',
          800: '#161619',
          700: '#212126',
          600: '#33333A',
        },
      },
    },
  },
  plugins: [],
};
