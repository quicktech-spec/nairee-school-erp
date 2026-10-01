/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        swift: {
          dark: '#0c1f2c',
          body: '#1e3a42',
          muted: '#52737d',
          base: '#f4fafa',
          soft: '#edfafa',
          electric: '#06b6d4',
          border: '#cde8e8',
          borderTeal: 'rgba(20, 184, 166, 0.22)',
        },
        frappe: {
          teal: '#0d9488',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
          slate: '#0c1f2c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'swift-sm': '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'swift-md': '0 4px 16px rgba(0,0,0,0.08)',
        'swift-lg': '0 8px 32px rgba(0,0,0,0.10)',
        'swift-teal': '0 8px 32px rgba(20,184,166,0.20)',
        'swift-card': '0 2px 12px rgba(12,31,44,0.07)',
      }
    },
  },
  plugins: [],
};
