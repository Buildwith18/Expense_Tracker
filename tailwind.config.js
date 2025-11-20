/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Ensure dynamic classes are not purged
    'animate-fade-in',
    'animate-slide-up',
    'translate-x-0',
    '-translate-x-full',
    'opacity-100',
    'opacity-0',
    'pointer-events-auto',
    'pointer-events-none',
  ],
};
