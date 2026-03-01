import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f1e8',
          300: '#ede6d6',
          400: '#e3d8bf',
          500: '#d4c5a3',
          600: '#c0ab85',
          700: '#a68f6b',
          800: '#8a7558',
          900: '#6f5e47',
        },
        forest: {
          50: '#f0f7f4',
          100: '#dceee5',
          200: '#b9ddcb',
          300: '#8cc5ab',
          400: '#5fa888',
          500: '#3f8a6d',
          600: '#2f6e57',
          700: '#265847',
          800: '#21473a',
          900: '#1c3b31',
        },
      },
    },
  },
  plugins: [],
}
export default config
