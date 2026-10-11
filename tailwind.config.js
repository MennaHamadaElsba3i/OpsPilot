/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36abf7',
          500: '#0c8ee9',
          600: '#0270c7',
          700: '#0359a1',
          800: '#074c84',
          900: '#0c406e',
          950: '#082849',
        },
        status: {
          pending: {
            bg: '#fef3c7',
            text: '#92400e',
            border: '#fde68a',
            dot: '#f59e0b',
          },
          running: {
            bg: '#e0f2fe',
            text: '#0369a1',
            border: '#bae6fd',
            dot: '#0284c7',
          },
          completed: {
            bg: '#dcfce7',
            text: '#15803d',
            border: '#bbf7d0',
            dot: '#16a34a',
          },
          failed: {
            bg: '#fee2e2',
            text: '#b91c1c',
            border: '#fecaca',
            dot: '#dc2626',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
