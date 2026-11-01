/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        diwali: {
          dark: '#0D0618',
          midnight: '#160B2D',
          royal: '#29104A',
          gold: '#FFD700',
          orange: '#FF8C00',
          cream: '#FFF4DC',
        }
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', '"Playfair Display"', 'serif'],
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
        hindi: ['"Rozha One"', '"Noto Sans Devanagari"', 'serif'],
        hindiSans: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 28s linear infinite',
        'spin-reverse-slow': 'spin-reverse 34s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'flicker': 'flicker 2.4s ease-in-out infinite',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.7, filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.5))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 24px rgba(255, 215, 0, 0.95))' },
        },
        flicker: {
          '0%, 100%': { transform: 'scale(1) rotate(-1deg)', opacity: 0.95 },
          '25%': { transform: 'scale(1.06, 0.96) rotate(1.5deg)', opacity: 1 },
          '50%': { transform: 'scale(0.97, 1.05) rotate(-1.5deg)', opacity: 0.9 },
          '75%': { transform: 'scale(1.04, 0.98) rotate(1deg)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
};

