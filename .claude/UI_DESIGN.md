# UI 디자인 시스템

> 이 문서는 Pirate Dice 게임의 UI 디자인 시스템을 정의합니다.

---

## 디자인 컨셉: Pirate Ship & Treasure

**핵심 테마**: 바다 위 해적선에서 벌어지는 보물을 건 주사위 대결

**무드 & 분위기**:
- 깊고 어두운 바다의 신비로움
- 낡은 해적선의 나무 갑판 질감
- 빛나는 황금 보물과 동전
- 달빛이 비치는 밤바다

**비주얼 요소**:
- 배경: 밤바다 + 해적선 갑판 느낌
- 카드/패널: 낡은 양피지, 나무 판자 텍스처
- 강조색: 황금/보물 색상
- 아이콘: 해골, 닻, 보물상자, 칼, 나침반

---

## 컬러 팔레트

| 용도 | 색상 | Tailwind Class | 설명 |
|------|------|----------------|------|
| 배경 (바다) | #0c1929 | `bg-ocean-deep` | 깊은 밤바다 |
| 배경 (하늘) | #1a2f4a | `bg-ocean-sky` | 밤하늘 |
| 갑판 (나무) | #3d2914 | `bg-wood-dark` | 어두운 나무 |
| 갑판 (밝은) | #5c3d1e | `bg-wood-light` | 밝은 나무 |
| 황금 (메인) | #ffd700 | `text-treasure` | 보물/황금 |
| 황금 (어두운) | #b8860b | `text-treasure-dark` | 황금 그림자 |
| 양피지 | #d4c4a8 | `bg-parchment` | 양피지/지도 |
| 양피지 (어두운) | #a89878 | `bg-parchment-dark` | 오래된 양피지 |
| 바다 강조 | #2dd4bf | `text-sea-glow` | 바다빛/발광 |
| 위험/도전 | #dc2626 | `bg-danger` | 붉은 해적기 |
| 성공 | #22c55e | `bg-success` | 성공 표시 |
| 플레이어 (본인) | #3b82f6 | `bg-player-self` | 자신 강조 |
| 텍스트 (기본) | #f5f5dc | `text-cream` | 크림색 텍스트 |
| 텍스트 (보조) | #a0937d | `text-muted` | 흐린 텍스트 |

---

## 그라데이션

```css
/* 바다 배경 그라데이션 */
.bg-ocean-gradient {
  background: linear-gradient(180deg, #1a2f4a 0%, #0c1929 50%, #0a1420 100%);
}

/* 황금 텍스트 그라데이션 */
.text-gold-shine {
  background: linear-gradient(135deg, #ffd700 0%, #ffec8b 50%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 나무 패널 그라데이션 */
.bg-wood-panel {
  background: linear-gradient(180deg, #5c3d1e 0%, #3d2914 100%);
}
```

---

## Tailwind 커스텀 설정

```javascript
// tailwind.config.js
module.exports = {
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
    }
  }
}
```

---

## 커스텀 컴포넌트 클래스

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=MedievalSharp&display=swap');

@layer components {
  /* === 버튼 === */
  .btn-treasure {
    @apply bg-gradient-to-b from-treasure to-treasure-dark
           text-wood-dark font-bold py-2 px-6 rounded-lg
           border-2 border-treasure-dark
           shadow-treasure hover:shadow-lg
           transform hover:scale-105 transition-all duration-200;
  }

  .btn-danger {
    @apply bg-gradient-to-b from-red-600 to-red-800
           text-cream font-bold py-2 px-6 rounded-lg
           border-2 border-red-900
           shadow-panel hover:shadow-lg
           transform hover:scale-105 transition-all duration-200;
  }

  .btn-wood {
    @apply bg-gradient-to-b from-wood-light to-wood-dark
           text-cream font-medium py-2 px-4 rounded
           border border-wood-accent
           shadow-panel hover:from-wood-accent hover:to-wood-light
           transition-all duration-200;
  }

  /* === 주사위 === */
  .dice {
    @apply w-14 h-14 bg-parchment rounded-lg shadow-dice
           flex items-center justify-center text-2xl font-bold
           text-wood-dark border-2 border-parchment-dark;
  }

  .dice-gold {
    @apply w-14 h-14 bg-gradient-to-br from-treasure to-treasure-dark
           rounded-lg shadow-dice-gold
           flex items-center justify-center text-2xl font-bold
           text-wood-dark border-2 border-treasure-dark
           animate-glow;
  }

  .dice-hidden {
    @apply w-14 h-14 bg-wood-dark rounded-lg shadow-dice
           flex items-center justify-center
           border-2 border-wood-light;
  }

  .dice-wild {
    @apply bg-gradient-to-br from-red-600 to-red-800
           rounded-lg shadow-dice
           flex items-center justify-center
           border-2 border-red-900;
  }

  /* === 패널 & 카드 === */
  .panel-wood {
    @apply bg-gradient-to-b from-wood-light to-wood-dark
           rounded-xl p-4 border-2 border-wood-accent
           shadow-panel;
  }

  .panel-parchment {
    @apply bg-parchment-texture bg-parchment
           rounded-lg p-4 border-2 border-parchment-dark
           shadow-panel text-wood-dark;
  }

  .player-card {
    @apply bg-gradient-to-b from-wood-light to-wood-dark
           rounded-xl p-4 border-2 border-wood-accent
           shadow-panel;
  }

  .player-card-self {
    @apply bg-gradient-to-b from-wood-light to-wood-dark
           rounded-xl p-4 border-2 border-treasure
           shadow-treasure;
  }

  .player-card-turn {
    @apply ring-2 ring-sea-glow shadow-glow-sea animate-glow;
  }

  /* === 입력 필드 === */
  .input-pirate {
    @apply w-full px-4 py-3
           bg-ocean-mid border-2 border-wood-accent rounded-lg
           text-cream placeholder-muted
           focus:outline-none focus:border-treasure focus:shadow-treasure
           transition-all duration-200;
  }

  .select-pirate {
    @apply px-4 py-3
           bg-ocean-mid border-2 border-wood-accent rounded-lg
           text-cream
           focus:outline-none focus:border-treasure focus:shadow-treasure
           transition-all duration-200;
  }

  /* === 타이틀 & 텍스트 === */
  .title-pirate {
    @apply font-pirate text-4xl text-treasure
           drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
           [text-shadow:_0_0_10px_rgba(255,215,0,0.5)];
  }

  .text-treasure-glow {
    @apply text-treasure
           [text-shadow:_0_0_10px_rgba(255,215,0,0.6)];
  }

  /* === 보물상자 (중앙 베팅 영역) === */
  .treasure-chest {
    @apply bg-gradient-to-b from-wood-accent to-wood-dark
           rounded-xl p-6 border-4 border-treasure-dark
           shadow-treasure relative overflow-hidden;
  }

  .treasure-chest::before {
    content: '';
    @apply absolute inset-0 bg-gradient-to-t from-transparent to-treasure/10;
  }

  /* === 해적선 갑판 배경 === */
  .deck-floor {
    @apply bg-wood-grain bg-wood-dark;
  }

  /* === 뱃지 === */
  .badge-alive {
    @apply inline-block px-2 py-1 text-xs font-medium
           bg-success/20 text-success rounded-full;
  }

  .badge-eliminated {
    @apply inline-block px-2 py-1 text-xs font-medium
           bg-danger/20 text-danger rounded-full;
  }
}

@layer utilities {
  /* 물결 효과 */
  .wave-border {
    border-image: repeating-linear-gradient(
      90deg,
      #2dd4bf 0px,
      #0c1929 10px,
      #2dd4bf 20px
    ) 1;
  }
}
```

---

## UI 컴포넌트 레이아웃

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚓ PIRATE DICE ⚓                          🌙 Round 3  💰 12    │  <- 타이틀 바 (treasure 색상)
├─────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░  바다 배경  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                                                 │
│   ╔═══════════╗                         ╔═══════════╗          │
│   ║  🏴‍☠️ Jack  ║                         ║  🏴‍☠️ Mary  ║          │  <- 다른 플레이어 (wood 패널)
│   ║  🎲🎲🎲🎲🎲  ║                         ║  🎲🎲🎲🎲   ║          │
│   ║   5개     ║                         ║   4개     ║          │
│   ╚═══════════╝                         ╚═══════════╝          │
│                                                                 │
│               ╔══════════════════════════╗                      │
│               ║    💎 TREASURE CHEST 💎   ║                      │  <- 보물상자 (중앙)
│               ║                          ║                      │
│               ║   현재 베팅:              ║                      │
│               ║   "⚄ 4가 5개 이상"       ║                      │
│               ║                          ║                      │
│               ║   🪙 버려진 주사위: 8개   ║                      │
│               ║   🔴 빨간 주사위: 1개     ║                      │
│               ╚══════════════════════════╝                      │
│                                                                 │
│   ╔═══════════╗                         ╔═══════════╗          │
│   ║  🏴‍☠️ Hook  ║                         ║ ⭐ Captain ║          │  <- 자신 (treasure 테두리)
│   ║  🎲🎲🎲    ║                         ║   (나)    ║          │
│   ║   3개     ║                         ║  🎲🎲🎲🎲🎲 ║          │
│   ╚═══════════╝                         ╚═══════════╝          │
│                                                                 │
├══════════════════════════  갑판  ════════════════════════════════┤
│                                                                 │
│   나의 주사위:  🎲2  🎲4  🎲4  🎲6  🎲1                          │  <- 내 주사위 (dice-gold)
│                                                                 │
│   ╔════════════════════╗    ╔════════════════════╗             │
│   ║   💰 베팅하기       ║    ║   ⚔️ 도전하기       ║             │  <- 버튼들
│   ╚════════════════════╝    ╚════════════════════╝             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 아이콘 & 심볼 가이드

| 용도 | 아이콘 | 설명 |
|------|--------|------|
| 게임 로고 | ⚓ 🏴‍☠️ | 닻, 해적기 |
| 보물/황금 | 💰 💎 🪙 | 돈주머니, 보석, 동전 |
| 플레이어 | 🏴‍☠️ ⭐ | 해적기, 자신은 별 |
| 주사위 | 🎲 | 주사위 |
| 도전 | ⚔️ | 교차된 검 |
| 베팅 | 💰 | 돈주머니 |
| 라운드 | 🌙 | 달 (밤바다) |
| 위험 | 💀 ☠️ | 해골 |
| 승리 | 👑 🏆 | 왕관, 트로피 |
| 로딩 | ⚓ | 닻 (흔들림 애니메이션) |
| 새로고침 | 🔄 | 새로고침 |
| 퇴장 | ⛵ | 배 (승선/하선) |
