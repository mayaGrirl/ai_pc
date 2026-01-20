/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e74c3c',
          dark: '#c0392b',
          light: '#ff6b5b'
        },
        secondary: {
          DEFAULT: '#f39c12',
          dark: '#d68910',
          light: '#f5b041'
        }
      },
      fontFamily: {
        sans: ['Microsoft YaHei', 'SimHei', 'Arial', 'sans-serif']
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'dialog': '0 12px 15px 0 rgba(0, 0, 0, 0.25)'
      },
      width: {
        'content': '1200px'
      }
    },
  },
  plugins: [],
}
