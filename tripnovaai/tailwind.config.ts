import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // More refined blue
        'background-light': '#0a1128', 
        'background-dark': '#0a1128',
        // New Premium Pastel Palette
        'soft-sky': '#e0f2fe',
        'soft-mint': '#ecfdf5',
        'soft-rose': '#fff1f2',
        'soft-lavender': '#f5f3ff',
        'soft-peach': '#fff7ed',
        'soft-indigo': '#eef2ff',
        // Dark Mode Pastels (Subtle highlights)
        'dark-sky': '#0c4a6e',
        'dark-mint': '#064e3b',
        'dark-rose': '#881337',
        'dark-lavender': '#4c1d95',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'Outfit', 'sans-serif'], // Added Outfit for more premium feel if available
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1.25rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        full: '9999px',
      },
      boxShadow: {
        'premium': '0 20px 80px -15px rgba(0, 0, 0, 0.08)',
        'premium-hover': '0 30px 100px -12px rgba(0, 0, 0, 0.12)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.6)',
      }
    },
  },
  plugins: [],
}
export default config
