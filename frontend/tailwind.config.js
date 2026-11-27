/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hospital: {
          navy: "#0f2b48",
          dark: "#091a2f",
          teal: "#0d9488",
          lightTeal: "#14b8a6",
          cyan: "#06b6d4",
          ice: "#f0f9ff",
          surface: "#ffffff",
          slate: "#64748b",
          border: "#e2e8f0",
          emergency: "#ef4444",
          emergencyBg: "#fef2f2"
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'dash': 'dash 20s linear infinite',
      },
      keyframes: {
        dash: {
          to: {
            strokeDashoffset: '-1000',
          },
        },
      },
    },
  },
  plugins: [],
}

