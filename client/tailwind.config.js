/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Core Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#FF6B00',
          dark: '#E05A00',
          light: '#FF8A33',
        },
        dark: {
          bg: '#0F0F12',
          surface: '#17171C',
          card: '#1F1F26',
          border: '#2A2A34',
          muted: '#8E8E9F',
        },
        ice: {
          cyan: '#00C2FF',
          glow: 'rgba(0, 194, 255, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brand': '0 8px 30px rgba(255, 107, 0, 0.25)',
        'brand-glow': '0 0 25px rgba(255, 107, 0, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
