/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          DEFAULT: '#7f1d1d',
          deep:    '#450a0a',
          bright:  '#991b1b',
        },
        ash: {
          DEFAULT: '#9ca3af',
          dark:    '#4b5563',
        },
        bone: {
          DEFAULT: '#e8e2d5',
          dark:    '#c4bfb5',
        },
        void: {
          DEFAULT: '#0a0a0c',
          mid:     '#0f0f12',
          light:   '#18181c',
          panel:   '#13131a',
        },
        grave: {
          DEFAULT: '#1a1a22',
          light:   '#252530',
        },
        // Keep legacy tokens for backward compat
        gold: {
          light:   '#f3e5ab',
          DEFAULT: '#d4af37',
          dark:    '#cf9f2d',
        },
        charcoal: {
          DEFAULT: '#1c1c1e',
          dark:    '#0d0d0f',
        },
        ivory: {
          DEFAULT: '#fcfaf2',
          dark:    '#cfc9b8',
        },
      },
      fontFamily: {
        thai: ['Kanit', 'Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
