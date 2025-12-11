/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 바다 & 하늘
        'ocean-deep': '#0c1929',
        'ocean-mid': '#122338',
        'ocean-sky': '#1a2f4a',
        'sea-glow': '#2dd4bf',

        // 나무 & 갑판
        'wood-dark': '#3d2914',
        'wood-light': '#5c3d1e',
        'wood-accent': '#8b5a2b',

        // 황금 & 보물
        'treasure': '#ffd700',
        'treasure-dark': '#b8860b',
        'treasure-glow': '#ffec8b',

        // 양피지 & 지도
        'parchment': '#d4c4a8',
        'parchment-dark': '#a89878',

        // 텍스트
        'cream': '#f5f5dc',
        'muted': '#a0937d',

        // 상태
        'danger': '#dc2626',
        'success': '#22c55e',
        'player-self': '#3b82f6',
      },
      boxShadow: {
        'dice': '2px 2px 8px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.2)',
        'dice-gold': '0 0 10px rgba(255,215,0,0.5), 2px 2px 8px rgba(0,0,0,0.5)',
        'panel': '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        'treasure': '0 0 20px rgba(255,215,0,0.4)',
        'glow-sea': '0 0 15px rgba(45,212,191,0.4)',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(180deg, #1a2f4a 0%, #0c1929 50%, #0a1420 100%)',
        'wood-grain': 'repeating-linear-gradient(90deg, #3d2914 0px, #5c3d1e 2px, #3d2914 4px)',
        'parchment-texture': 'linear-gradient(135deg, #d4c4a8 0%, #c4b498 50%, #d4c4a8 100%)',
      },
      fontFamily: {
        'pirate': ['Pirata One', 'cursive', 'serif'],
        'treasure': ['MedievalSharp', 'Georgia', 'serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255,215,0,0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255,215,0,0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      },
    },
  },
  plugins: [],
}
