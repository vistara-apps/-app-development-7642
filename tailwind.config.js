/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(240, 80%, 50%)',
        accent: 'hsl(180, 70%, 45%)',
        surface: 'hsl(0, 0%, 100%)',
        bg: 'hsl(220, 20%, 98%)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0, 0%, 0%, 0.08)',
      },
    },
  },
  plugins: [],
}