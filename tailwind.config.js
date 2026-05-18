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
          50: '#fff1f7',
          100: '#ffe4f0',
          200: '#ffc9e3',
          300: '#ffa0ca',
          400: '#ff66a5',
          500: '#ff3388',
          600: '#ed1e79',
          700: '#c01a7a',
          800: '#a01867',
          900: '#851858',
          DEFAULT: '#c01a7a', // Vibrant Magenta from Template
        },
        surface: {
          50: '#f8f9fc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['"Inter"', '"SF Pro Display"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0,0,0,0.02)',
        'card': '0 4px 20px -2px rgba(0,0,0,0.05)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08)',
        'soft': '0 2px 8px rgba(0,0,0,0.04)',
      },
      spacing: {
        '18': '4.5rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
