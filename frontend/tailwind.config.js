/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef2f2',
          100: '#fde3e3',
          200: '#fbc7c7',
          300: '#f8a0a0',
          400: '#f56565',
          500: '#e53e3e',
          600: '#C7000B',   // Huawei Cloud brand red
          700: '#9E0006',
          800: '#8B0005',
          900: '#7A0004',
          950: '#5C0003',
        },
      },
      maxWidth: {
        'news': '1200px',
      },
    },
  },
  plugins: [],
};
