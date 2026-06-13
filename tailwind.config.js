/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          light: '#1b4332',
          dark: '#0d241a',
        },
        gold: {
          light: '#f3e5ab',
          DEFAULT: '#d4af37',
          dark: '#cf9f2d',
        },
        charcoal: {
          DEFAULT: '#1c1c1e',
          dark: '#0d0d0f',
        },
        ivory: {
          DEFAULT: '#fcfaf2',
          dark: '#cfc9b8',
        }
      },
      fontFamily: {
        thai: ['Kanit', 'Noto Sans Thai', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
