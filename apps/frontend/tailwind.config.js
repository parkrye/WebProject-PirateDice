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
        'dice-roll': 'dice-roll 0.8s ease-out',
        'dice-bounce': 'dice-bounce 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'winner-glow': 'winner-glow 1s ease-in-out infinite',
        'loser-shake': 'loser-shake 0.5s ease-in-out',
        'sail-right': 'sail-right 25s linear infinite',
        'sail-left': 'sail-left 25s linear infinite',
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
        'dice-roll': {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '25%': { transform: 'rotateX(90deg) rotateY(90deg)' },
          '50%': { transform: 'rotateX(180deg) rotateY(180deg)' },
          '75%': { transform: 'rotateX(270deg) rotateY(270deg)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg)' },
        },
        'dice-bounce': {
          '0%': { transform: 'scale(0.8) translateY(-20px)', opacity: '0' },
          '60%': { transform: 'scale(1.1) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-10px)' },
          '40%': { transform: 'translateX(10px)' },
          '60%': { transform: 'translateX(-10px)' },
          '80%': { transform: 'translateX(10px)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'winner-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34,197,94,0.5)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 40px rgba(34,197,94,0.8)', transform: 'scale(1.02)' },
        },
        'loser-shake': {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(-5px) rotate(-2deg)' },
          '75%': { transform: 'translateX(5px) rotate(2deg)' },
        },
        'sail-right': {
          '0%': { left: '-10%', transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-8px)' },
          '50%': { transform: 'translateY(0)' },
          '75%': { transform: 'translateY(-8px)' },
          '100%': { left: '110%', transform: 'translateY(0)' },
        },
        'sail-left': {
          '0%': { right: '-10%', transform: 'translateY(0) scaleX(-1)' },
          '25%': { transform: 'translateY(-8px) scaleX(-1)' },
          '50%': { transform: 'translateY(0) scaleX(-1)' },
          '75%': { transform: 'translateY(-8px) scaleX(-1)' },
          '100%': { right: '110%', transform: 'translateY(0) scaleX(-1)' },
        },
      },
    },
  },
  plugins: [],
}
