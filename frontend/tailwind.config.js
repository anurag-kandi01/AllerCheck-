/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          cyan: '#00d4ff',
          purple: '#7c3aed',
          dark: '#0a0a0f',
          card: '#0e0e17',
        },
      },
      borderWidth: {
        3: '3px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 4s linear infinite',
        'orb-pulse': 'orb-pulse 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
