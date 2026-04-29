/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: '#0e0e0e',
        paper: '#f5f0e8',
        cream: '#ede8dc',
        accent: '#e63329',
        gold: '#f0b429',
        muted: '#8a8680',
      },
      boxShadow: {
        card: '4px 4px 0px 0px #0e0e0e',
        'card-hover': '6px 6px 0px 0px #0e0e0e',
        'card-accent': '4px 4px 0px 0px #e63329',
      },
    },
  },
  plugins: [],
};
