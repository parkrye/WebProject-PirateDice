# CHANGELOG - 변경 이력

이 문서는 프로젝트의 주요 변경 사항을 기록합니다.

---

## 2025-12-11

### 문서 개선 작업

**요청**: CLAUDE.md와 game_rules.md 두 문서를 상호 확인하여 수정, 첨언 및 개선

#### CLAUDE.md 변경 사항

| 항목 | 변경 내용 |
|------|----------|
| 프로젝트 설명 | "Pirate Dice - 블러핑 기반 주사위 게임" 명시 |
| 문서 참조 | game_rules.md 참조 링크 추가 |
| 기술 스택 | WebSocket (Socket.io) 추가 |
| NestJS 아키텍처 | Gateway 레이어 추가 (WebSocket 처리) |
| 게임 흐름 | 플로우 다이어그램 작성 |
| 데이터 모델 | Player, Bet, GameRoom 인터페이스 정의 |
| API 설계 | REST API 및 WebSocket Events 명세 작성 |
| 파일 구조 | libs/ 하위 상세 구조 정의 |
| Firebase 구조 | 데이터베이스 스키마 설계 |
| UI 디자인 | 컬러 팔레트, Tailwind 설정, 컴포넌트 클래스 정의 |
| UI 레이아웃 | ASCII 다이어그램 추가 |
| 게임 상수 | game_rules.md 연동 TypeScript 코드 예시 |

#### game_rules.md 변경 사항

| 항목 | 변경 내용 |
|------|----------|
| 문서 참조 | CLAUDE.md 참조 링크 추가 |
| 구조화 | 표 형식 활용, 번호 체계 정리 |
| 용어 정의 | 와일드카드 정의 포함한 용어 표 추가 |
| 빨간 주사위 | 와일드카드 규칙 상세화 (섹션 10 신설) |
| 베팅 검증 | `isValidBet` 함수 코드 예시 추가 |
| 도전 판정 | `judgeChallenge` 함수 코드 예시 추가 |
| 와일드카드 카운팅 | `countDiceWithWildcard` 함수 코드 예시 추가 |
| 게임 상태 | ASCII 플로우차트 다이어그램 추가 |
| 엣지 케이스 | 동시 탈락, 연결 끊김, 타임아웃 처리 섹션 추가 |
| 구현 체크리스트 | 개발 시 확인용 체크리스트 추가 |

#### 상호 연계

- 두 문서 간 상호 참조 링크 추가
- game_rules.md의 규칙이 CLAUDE.md의 상수 정의와 일치하도록 동기화
- 개발자용 코드 예시를 game_rules.md에 포함하여 구현 가이드 제공

---

### CHANGELOG.md 생성 및 변경 이력 규칙 추가

**요청**: 변경 내용에 대한 요약 정보를 새 문서에 기록하고, 앞으로의 변경 사항도 기록하도록 규칙 추가

#### 변경 사항

| 항목 | 변경 내용 |
|------|----------|
| CHANGELOG.md | 변경 이력 기록 문서 신규 생성 |
| CLAUDE.md | 상단에 CHANGELOG.md 참조 링크 추가 |
| CLAUDE.md | "변경 이력 기록 규칙" 섹션 추가 (기록 형식 및 대상 정의) |

---

### 프로젝트 기초 구조 생성

**요청**: CLAUDE.md와 game_rules.md 문서를 참조하여 기초적인 프로젝트 작성

#### 생성된 파일 구조

```
WebProject-PirateDice/
├── package.json                    # 루트 모노레포 설정
├── tsconfig.base.json              # 공통 TypeScript 설정
├── .gitignore                      # Git 제외 파일
├── libs/
│   ├── constants/                  # 게임 상수
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── game.constants.ts   # 초기 주사위 수, 게임 설정
│   │       └── messages.constants.ts # UI 메시지
│   ├── types/                      # 타입 정의
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── game-status.type.ts
│   │       ├── player-action.type.ts
│   │       ├── challenge-result.type.ts
│   │       └── socket-events.type.ts
│   ├── entities/                   # 데이터 모델
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── player.entity.ts
│   │       ├── bet.entity.ts
│   │       ├── game-room.entity.ts
│   │       └── round.entity.ts
│   ├── services/                   # 게임 서비스
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── dice.service.ts     # 주사위 굴림
│   │       ├── betting.service.ts  # 베팅 검증
│   │       └── judgment.service.ts # 도전 판정
│   └── game-engine/                # 게임 엔진
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── game-engine.ts      # 메인 게임 엔진
│           ├── round-manager.ts    # 라운드 관리
│           └── turn-manager.ts     # 턴 관리
├── apps/
│   ├── backend/                    # NestJS 서버
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── rooms/
│   │       │   ├── rooms.module.ts
│   │       │   ├── rooms.controller.ts
│   │       │   └── rooms.service.ts
│   │       └── game/
│   │           ├── game.module.ts
│   │           └── game.gateway.ts  # WebSocket
│   └── frontend/                   # React 클라이언트
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── styles/
│           │   └── globals.css     # Tailwind + 커스텀 컴포넌트
│           ├── pages/
│           │   ├── HomePage.tsx
│           │   ├── LobbyPage.tsx
│           │   └── GamePage.tsx
│           ├── components/
│           │   ├── PlayerCard.tsx
│           │   ├── DiceDisplay.tsx
│           │   ├── BettingPanel.tsx
│           │   └── GameStatus.tsx
│           └── hooks/
│               └── useSocket.ts
```

#### 주요 구현 내용

| 영역 | 구현 내용 |
|------|----------|
| 모노레포 | npm workspaces 기반 모노레포 구조 |
| libs/constants | 게임 상수 (초기 주사위 수, 설정, 메시지) |
| libs/types | GameStatus, PlayerAction, ChallengeResult, SocketEvents 타입 |
| libs/entities | Player, Bet, GameRoom, Round 엔티티 + 팩토리 함수 |
| libs/services | 주사위 굴림, 베팅 검증, 도전 판정 서비스 |
| libs/game-engine | GameEngine, RoundManager, TurnManager 클래스 |
| apps/backend | NestJS + WebSocket 게이트웨이, REST API |
| apps/frontend | React + Vite, 페이지/컴포넌트 구조 |
| Tailwind | 커스텀 테마 (table-green, gold 등), 컴포넌트 클래스 |

#### game_rules.md 구현 체크리스트 상태

- [x] 플레이어 수에 따른 초기 주사위 배분
- [x] 베팅 유효성 검증 (개수 하락 금지, X 증가 규칙)
- [x] 도전 판정 로직 (R > Y, R < Y, R = Y 케이스)
- [x] 와일드카드 카운팅
- [x] 주사위 손실 처리 및 탈락 판정
- [x] 다음 라운드 첫 베팅자 결정
- [x] 승리 조건 확인
- [ ] 순서 결정 로직 (동점 처리 추가 필요)
- [ ] 엣지 케이스 처리 (동시 탈락, 타임아웃 등) - 일부 구현

---

### UI 디자인 테마 변경 (Casino -> Pirate)

**요청**: 디자인 규격을 "바다와 선상(배) + 해적 + 보물과 황금" 컨셉으로 변경

#### 디자인 컨셉

| 이전 | 변경 후 |
|------|---------|
| Casino Table (초록 펠트) | Pirate Ship & Treasure (밤바다 해적선) |
| 골드/레드/그린 색상 | 바다색/나무색/황금색 |
| 카지노 칩/카드 모티프 | 보물상자/양피지/해골 모티프 |

#### 컬러 팔레트 변경

| 용도 | 색상 | Tailwind Class |
|------|------|----------------|
| 배경 (바다) | #0c1929 | `bg-ocean-deep` |
| 배경 (하늘) | #1a2f4a | `bg-ocean-sky` |
| 나무 (어두운) | #3d2914 | `bg-wood-dark` |
| 나무 (밝은) | #5c3d1e | `bg-wood-light` |
| 황금 (메인) | #ffd700 | `text-treasure` |
| 양피지 | #d4c4a8 | `bg-parchment` |
| 바다 강조 | #2dd4bf | `text-sea-glow` |
| 텍스트 (기본) | #f5f5dc | `text-cream` |

#### 변경된 파일

| 파일 | 변경 내용 |
|------|----------|
| `CLAUDE.md` | UI 디자인 시스템 섹션 전면 개편 (Pirate Ship & Treasure 테마) |
| `tailwind.config.js` | 새 컬러 팔레트, 그림자, 애니메이션, 폰트 설정 추가 |
| `globals.css` | 해적 테마 컴포넌트 클래스 (btn-treasure, dice-gold, panel-wood 등) |
| `App.tsx` | ocean-gradient 배경 적용, 폰트 설정 |
| `HomePage.tsx` | 해적 테마 UI (title-pirate, panel-parchment, btn-treasure) |
| `LobbyPage.tsx` | 해적 선술집 테마 (panel-wood, btn-wood, 해적 아이콘) |
| `PlayerCard.tsx` | 해적 선원 카드 (player-card, player-card-self, 해적 아이콘) |
| `DiceDisplay.tsx` | 황금/양피지 주사위 (dice-gold, dice, dice-wild), WildcardDice 컴포넌트 추가 |
| `BettingPanel.tsx` | 보물 베팅 테이블 (panel-wood, btn-treasure, btn-danger) |
| `GameStatus.tsx` | 보물상자 중앙 영역 (treasure-chest), WildcardDice 연동 |

#### 추가된 주요 CSS 클래스

```css
/* 버튼 */
.btn-treasure     /* 황금 보물 버튼 */
.btn-danger       /* 붉은 도전 버튼 */
.btn-wood         /* 나무 버튼 */

/* 주사위 */
.dice             /* 양피지 주사위 */
.dice-gold        /* 황금 주사위 (내 주사위) */
.dice-hidden      /* 숨겨진 주사위 */
.dice-wild        /* 빨간 와일드카드 주사위 */

/* 패널 */
.panel-wood       /* 나무 패널 */
.panel-parchment  /* 양피지 패널 */
.treasure-chest   /* 보물상자 (중앙 베팅) */

/* 플레이어 카드 */
.player-card      /* 일반 플레이어 */
.player-card-self /* 자신 (황금 테두리) */
.player-card-turn /* 현재 턴 (바다빛 글로우) */

/* 텍스트 */
.title-pirate     /* 해적 타이틀 */
.text-treasure-glow /* 황금 글로우 텍스트 */

/* 입력 */
.input-pirate     /* 해적 테마 입력 필드 */
.select-pirate    /* 해적 테마 셀렉트 */
```

#### 추가된 애니메이션

| 애니메이션 | 설명 |
|------------|------|
| `animate-glow` | 황금빛 글로우 효과 (보물 강조) |
| `animate-float` | 부유 효과 (대기 아이콘) |
| `animate-wave` | 흔들림 효과 (로딩) |

#### 추가된 아이콘 사용 가이드

| 용도 | 아이콘 |
|------|--------|
| 게임 로고 | ⚓ 🏴‍☠️ |
| 보물/황금 | 💰 💎 🪙 |
| 플레이어 | 🏴‍☠️ (타인), ⭐ (자신) |
| 도전 | ⚔️ |
| 탈락 | 💀 |

---

### CLAUDE.md 문서 분리

**요청**: CLAUDE.md 문서가 너무 길어져서 핵심 규칙만 남기고 나머지는 별도 문서로 분리

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `CLAUDE.md` | 679줄 → 172줄로 간소화. 핵심 규칙(코딩 규칙, 금지 사항, 변경 이력 규칙)만 유지 |
| `SYSTEM_DESIGN.md` | 신규 생성. 게임 흐름, 데이터 모델, API 설계, 파일 구조, Firebase 구조 |
| `UI_DESIGN.md` | 신규 생성. 디자인 컨셉, 컬러 팔레트, Tailwind 설정, 컴포넌트 클래스, 레이아웃 |

#### 문서 구조

```
.claude/
├── CLAUDE.md          # 핵심 규칙 (항상 확인)
├── SYSTEM_DESIGN.md   # 시스템 설계 (개발 시 참조)
├── UI_DESIGN.md       # UI 디자인 (디자인 작업 시 참조)
├── game_rules.md      # 게임 규칙 (로직 구현 시 참조)
└── CHANGELOG.md       # 변경 이력
```

#### CLAUDE.md 참조 테이블 추가

| 문서 | 설명 | 용도 |
|------|------|------|
| game_rules.md | 게임 규칙 | 게임 로직 구현 시 |
| SYSTEM_DESIGN.md | 시스템 설계 | API, 데이터 모델, 파일 구조 |
| UI_DESIGN.md | UI 디자인 시스템 | 컬러, 컴포넌트, 레이아웃 |
| CHANGELOG.md | 변경 이력 | 모든 변경 사항 기록 |
