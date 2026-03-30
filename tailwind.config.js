/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6C47FF',
          light: '#9B7EFF',
          dark: '#4A2ECC',
        },
        surface: {
          DEFAULT: '#0a0a0a',
          raised: '#141414',
          overlay: '#1f1f1f',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
