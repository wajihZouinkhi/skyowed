/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { brand: { blue: '#1D4ED8', orange: '#F97316' } } } },
  plugins: [],
};
