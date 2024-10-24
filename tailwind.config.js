/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.{html,js}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}

