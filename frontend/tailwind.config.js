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
          50:  'rgb(var(--tw-clr-primary-50,  254 242 242) / <alpha-value>)',
          100: 'rgb(var(--tw-clr-primary-100, 253 227 227) / <alpha-value>)',
          200: 'rgb(var(--tw-clr-primary-200, 251 199 199) / <alpha-value>)',
          300: 'rgb(var(--tw-clr-primary-300, 248 160 160) / <alpha-value>)',
          400: 'rgb(var(--tw-clr-primary-400, 245 101 101) / <alpha-value>)',
          500: 'rgb(var(--tw-clr-primary-500, 229 62 62)   / <alpha-value>)',
          600: 'rgb(var(--tw-clr-primary-600, 199 0 11)     / <alpha-value>)',
          700: 'rgb(var(--tw-clr-primary-700, 158 0 6)      / <alpha-value>)',
          800: 'rgb(var(--tw-clr-primary-800, 139 0 5)      / <alpha-value>)',
          900: 'rgb(var(--tw-clr-primary-900, 122 0 4)      / <alpha-value>)',
          950: 'rgb(var(--tw-clr-primary-950, 92 0 3)       / <alpha-value>)',
        },
      },
      maxWidth: {
        'news': '1200px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
