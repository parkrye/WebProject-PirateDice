# Pirate Dice

블러핑 기반 주사위 게임 웹 애플리케이션

## 게임 소개

Pirate Dice는 "Liar's Dice" 규칙을 기반으로 한 멀티플레이어 블러핑 게임입니다.
각 플레이어는 자신의 주사위만 볼 수 있으며, 테이블 위 모든 주사위에 대해 베팅하고 도전합니다.

### 기본 규칙

1. 각 플레이어는 주사위를 받고 굴립니다 (다른 플레이어에게 숨김)
2. 플레이어는 차례대로 "모든 주사위 중 X가 Y개 이상 있다"고 베팅합니다
3. 다음 플레이어는 더 높은 베팅을 하거나 "도전!"을 선언합니다
4. 도전 시 모든 주사위를 공개하고 베팅이 맞았는지 확인합니다
5. 베팅이 틀리면 베팅한 사람이, 맞으면 도전한 사람이 주사위를 잃습니다
6. 주사위를 모두 잃으면 탈락, 마지막까지 남은 플레이어가 승리합니다

### 특수 규칙

- **와일드카드 (1)**: 1은 모든 숫자로 카운트됩니다

---

## 플레이 가이드

### 온라인 플레이

게임 URL: **https://personal-project-park.web.app**

1. 사이트에 접속합니다
2. 닉네임을 입력하고 "항해 시작!" 버튼을 클릭합니다
3. 로비에서 새 방을 만들거나 기존 방에 참가합니다
4. 2명 이상이 모이면 방장이 "항해 출발!" 버튼으로 게임을 시작합니다

### 게임 플레이

#### 대기실
- 플레이어가 입장하면 목록에 표시됩니다
- "준비 완료" 버튼을 클릭하여 준비 상태를 표시합니다
- 모든 플레이어가 준비되면 방장이 게임을 시작할 수 있습니다

#### 게임 진행
- 자신의 차례가 되면 베팅 패널이 활성화됩니다
- **베팅**: 주사위 값(1-6)과 개수를 선택하고 "베팅하기" 버튼 클릭
- **도전**: 이전 베팅이 거짓이라고 생각하면 "도전!" 버튼 클릭

#### 베팅 규칙
- 이전 베팅보다 개수가 같거나 높아야 합니다
- 개수가 같으면 주사위 값이 더 커야 합니다
- 첫 턴에는 도전할 수 없습니다

---

## 개발자 가이드

### 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | NestJS + Socket.io |
| Styling | Tailwind CSS |
| Database | Firebase Realtime Database |
| Hosting | Firebase Hosting (Frontend) + Render (Backend) |

### 프로젝트 구조

```
WebProject-PirateDice/
├── apps/
│   ├── backend/          # NestJS 서버
│   │   └── src/
│   │       ├── rooms/    # 방 관리 API
│   │       └── game/     # WebSocket 게임 로직
│   └── frontend/         # React 클라이언트
│       └── src/
│           ├── pages/    # 페이지 컴포넌트
│           ├── components/ # UI 컴포넌트
│           └── hooks/    # Custom Hooks
├── libs/
│   ├── constants/        # 게임 상수
│   ├── types/            # TypeScript 타입
│   ├── entities/         # 데이터 모델
│   ├── services/         # 게임 서비스 (주사위, 베팅, 판정)
│   └── game-engine/      # 게임 엔진 핵심 로직
└── .claude/              # 프로젝트 문서
    ├── CLAUDE.md         # 개발 가이드
    ├── game_rules.md     # 게임 규칙 상세
    ├── SYSTEM_DESIGN.md  # 시스템 설계
    ├── UI_DESIGN.md      # UI 디자인 시스템
    └── CHANGELOG.md      # 변경 이력
```

### 로컬 개발 환경 설정

#### 요구사항
- Node.js 18 이상
- npm 9 이상

#### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (백엔드 + 프론트엔드 동시)
npm run dev

# 또는 개별 실행
npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:3000
```

#### 개별 빌드

```bash
# 전체 빌드
npm run build

# 백엔드만 빌드
npm run build:backend

# 프론트엔드만 빌드
npm run build:frontend
```

### 배포

#### Firebase 프론트엔드 배포

```bash
# 빌드
npm run build:frontend

# Firebase 배포
firebase deploy --only hosting
```

#### Render 백엔드 배포

GitHub main 브랜치에 push하면 자동 배포됩니다.

수동 배포:
1. https://dashboard.render.com 접속
2. pirate-dice-backend 서비스 선택
3. "Manual Deploy" 클릭

### 환경변수

#### Frontend (`apps/frontend/.env.production`)
```
VITE_API_URL=https://webproject-piratedice-backend.onrender.com
```

#### Backend (Render 환경변수)
```
NODE_ENV=production
FRONTEND_URL=https://personal-project-park.web.app
PORT=10000
```

### API 엔드포인트

#### REST API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/rooms` | 방 목록 조회 |
| GET | `/api/rooms/:id` | 방 정보 조회 |
| POST | `/api/rooms` | 방 생성 |
| POST | `/api/rooms/:id/join` | 방 참가 |
| POST | `/api/rooms/:id/leave` | 방 퇴장 |

#### WebSocket Events

| Event | Direction | 설명 |
|-------|-----------|------|
| `room:join` | Client → Server | 방 참가 |
| `game:ready` | Client → Server | 준비 완료 |
| `game:start` | Client → Server | 게임 시작 (방장) |
| `game:bet` | Client → Server | 베팅 |
| `game:challenge` | Client → Server | 도전 |
| `player:joined` | Server → Client | 플레이어 입장 알림 |
| `player:ready` | Server → Client | 준비 상태 변경 |
| `game:started` | Server → Client | 게임 시작 |
| `round:started` | Server → Client | 라운드 시작 (주사위 배분) |
| `turn:changed` | Server → Client | 턴 변경 |
| `challenge:result` | Server → Client | 도전 결과 |
| `game:ended` | Server → Client | 게임 종료 |

### 문서

자세한 개발 가이드는 `.claude/` 폴더의 문서를 참조하세요:

- [CLAUDE.md](.claude/CLAUDE.md) - 코딩 규칙 및 개발 가이드
- [game_rules.md](.claude/game_rules.md) - 게임 규칙 상세
- [SYSTEM_DESIGN.md](.claude/SYSTEM_DESIGN.md) - 시스템 설계
- [UI_DESIGN.md](.claude/UI_DESIGN.md) - UI 디자인 시스템
- [CHANGELOG.md](.claude/CHANGELOG.md) - 변경 이력

---

## 라이선스

MIT License
