/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'sg-cyan': '#06b6d4',
        'sg-orange': '#f97316',
        'sg-green': '#10b981',
        'sg-red': '#ef4444',
        'sg-dark': '#0f172a',
        'sg-secondary': '#1e293b',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
