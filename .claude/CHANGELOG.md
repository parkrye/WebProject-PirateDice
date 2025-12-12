# CHANGELOG - 변경 이력

이 문서는 프로젝트의 주요 변경 사항을 기록합니다.

---

## 2025-12-12

### BGM 및 SFX 오디오 시스템 추가

**요청**: 외부에서 BGM, SFX 오디오를 추가할 수 있도록 프론트엔드 구성

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `libs/constants/src/audio.constants.ts` | 신규 생성. BGM/SFX 파일 경로 상수 정의 |
| `apps/frontend/src/hooks/useAudio.tsx` | 신규 생성. 오디오 관리 훅 (BGM 재생/정지, SFX 재생, 볼륨 조절, 음소거) |
| `apps/frontend/src/components/AudioControl.tsx` | 신규 생성. 오디오 컨트롤 UI (음소거 토글, 볼륨 슬라이더) |
| `apps/frontend/src/main.tsx` | AudioProvider 래퍼 추가 |
| `apps/frontend/src/pages/GamePage.tsx` | 게임 이벤트별 오디오 재생 연동 |

#### 오디오 파일 위치

```
apps/frontend/public/audio/
├── bgm/
│   ├── lobby.mp3      - 로비/대기방 BGM
│   ├── game.mp3       - 게임 중 BGM
│   └── victory.mp3    - 게임 종료 BGM
└── sfx/
    ├── dice-roll.mp3       - 주사위 굴리기
    ├── bet-place.mp3       - 베팅 선언
    ├── challenge.mp3       - 도전 선언
    ├── challenge-win.mp3   - 도전 성공
    ├── challenge-lose.mp3  - 도전 실패
    ├── eliminated.mp3      - 플레이어 탈락
    ├── round-start.mp3     - 라운드 시작
    ├── my-turn.mp3         - 내 턴 알림
    ├── button-click.mp3    - 버튼 클릭
    ├── chat-message.mp3    - 채팅 수신
    ├── challenge-phase.mp3 - 도전 타임 시작
    ├── timer-warning.mp3   - 3초 경고
    ├── pass.mp3            - 묵시
    ├── player-join.mp3     - 플레이어 입장
    ├── player-leave.mp3    - 플레이어 퇴장
    ├── game-start.mp3      - 게임 시작
    └── dice-reveal.mp3     - 주사위 공개
```

---

### 게임 플레이 개선 및 도망치기 기능 추가

**요청**: 묵시 후 도전 버튼 숨기기, 탈락 플레이어 채팅 허용, 접속 종료 플레이어 탈락 처리, 채팅 말풍선 위치 조정, 도망치기 버튼 추가

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `apps/frontend/src/pages/GamePage.tsx` | roundPassedPlayerIds 상태 추가로 묵시한 플레이어 도전 버튼 숨김, 탈락 플레이어 채팅 허용, 내 채팅 말풍선 오른편 위치 조정, 도망치기 버튼 및 handleRunaway 함수 추가 |
| `apps/backend/src/game/game.gateway.ts` | handlePlayerDisconnectDuringGame 메서드로 접속 종료 플레이어 탈락 처리, game:runaway 핸들러 추가 |

#### 기능 상세

| 기능 | 설명 |
|------|------|
| 묵시 후 도전 불가 | 도전 타임에 묵시를 선택한 플레이어는 해당 라운드 내에서 베팅 패널의 도전 버튼이 표시되지 않음 |
| 탈락 플레이어 채팅 | 탈락한 플레이어도 채팅 버튼을 사용하여 메시지 전송 가능 |
| 접속 종료 처리 | 게임 중 접속 종료 시 해당 플레이어 탈락 처리, 턴이었다면 다음 플레이어로 넘김, 1명 남으면 게임 종료 |
| 채팅 말풍선 위치 | 내 채팅 말풍선이 TREASURE CHEST 프레임 오른편에 표시 |
| 도망치기 버튼 | 게임 중 헤더 우측 상단에 "🏃 도망" 버튼 표시, 클릭 시 확인 후 탈락 및 로비 이동 |

---

### 빠른 채팅 기능 추가

**요청**: 채팅 버튼 클릭 -> 카테고리 선택 -> 템플릿 메시지 선택 -> 말풍선 표시

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `libs/constants/src/chat.constants.ts` | 신규 생성. 채팅 카테고리 및 템플릿 메시지 상수 정의 |
| `apps/frontend/src/components/ChatButton.tsx` | 신규 생성. 채팅 버튼 및 카테고리/템플릿 메뉴 |
| `apps/frontend/src/components/SpeechBubble.tsx` | 신규 생성. 말풍선 컴포넌트 |
| `apps/frontend/src/components/PlayerCard.tsx` | chatMessage prop 추가, 말풍선 표시 지원 |
| `apps/backend/src/game/game.gateway.ts` | `chat:send` 이벤트 핸들러 추가, `chat:message` 브로드캐스트 |
| `apps/frontend/src/pages/GamePage.tsx` | 채팅 상태 관리, 소켓 이벤트 연동, ChatButton UI 추가 |

#### 채팅 카테고리

| 카테고리 | 아이콘 | 예시 메시지 |
|---------|--------|------------|
| 도발 | 😏 | "감히 내게 도전하려고?", "그게 최선이야?" |
| 위협 | 💀 | "주사위를 전부 잃게 될 거야...", "널 바다에 던져버리겠어!" |
| 허세 | 🎭 | "내 패가 완벽해!", "도전 못 하겠지?" |
| 감정 | 😤 | "제길!", "운이 좋았어...", "좋았어!" |
| 인사 | 👋 | "요호호!", "행운을 빌어!", "좋은 게임이었어!" |

#### 기능 동작

1. 채팅 버튼(💬) 클릭
2. 카테고리 메뉴에서 선택 (도발/위협/허세/감정/인사)
3. 템플릿 메시지 선택
4. 해당 플레이어 슬롯 위에 말풍선 표시 (4초간)
5. 모든 플레이어에게 실시간 브로드캐스트

---

### 모바일 웹 UI 최적화

**요청**: 모바일 웹 환경에 적합한 UI 및 최적화

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `apps/frontend/index.html` | 모바일 meta 태그 추가 (viewport-fit, apple-mobile-web-app-capable, theme-color) |
| `apps/frontend/src/styles/globals.css` | 모바일 기본 스타일 추가 (safe-area, touch handling, 터치 타겟 크기 44px, dvh) |
| `apps/frontend/src/components/BettingPanel.tsx` | 모바일 반응형 레이아웃, inputMode="numeric", 터치 친화적 버튼 |
| `apps/frontend/src/components/PlayerCard.tsx` | 모바일 크기 최적화 (min-w-[100px] sm:min-w-[120px]), 주사위 표시 간소화 |
| `apps/frontend/src/components/WaitingRoom.tsx` | 모바일 반응형 패딩/폰트 크기, 터치 친화적 버튼 |
| `apps/frontend/src/pages/GamePage.tsx` | min-h-dvh, safe-area-inset, 반응형 간격/폰트 |
| `apps/frontend/src/pages/LobbyPage.tsx` | 반응형 헤더/방 목록, 모바일에서 장식 요소 숨김 |

#### 주요 모바일 최적화 내용

| 항목 | 적용 내용 |
|------|----------|
| 뷰포트 | `viewport-fit=cover`, `user-scalable=no`, `maximum-scale=1.0` |
| 높이 | `min-h-dvh` (동적 뷰포트 높이 - 모바일 주소창 고려) |
| Safe Area | iOS 노치/홈 인디케이터 대응 (`env(safe-area-inset-*)`) |
| 터치 | 최소 터치 타겟 44px, `touch-action: manipulation` |
| 스크롤 | `-webkit-overflow-scrolling: touch`, `overscroll-behavior: none` |
| 입력 | 폰트 크기 16px 이상 (iOS 자동 확대 방지), `inputMode="numeric"` |
| 반응형 | `sm:` 브레이크포인트 활용한 데스크톱/모바일 분기 |

#### 추가된 유틸리티 클래스

```css
.safe-area-inset      /* iOS safe area 패딩 */
.touch-action-manipulation  /* 터치 최적화 */
.scroll-touch         /* 모바일 스크롤 최적화 */
.select-none-touch    /* 게임 UI 텍스트 선택 방지 */
```

---

### 방 나가기 기능 추가

**요청**: 게임 룸에서 나가기 버튼 추가하여 로비로 돌아갈 수 있도록

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `apps/backend/src/game/game.gateway.ts` | `room:leave` 이벤트 핸들러 추가 (게임 중에는 나갈 수 없음) |
| `apps/frontend/src/components/WaitingRoom.tsx` | `onLeave` prop 추가, 나가기 버튼 UI 추가 |
| `apps/frontend/src/pages/GamePage.tsx` | `handleLeave` 함수 구현 |

---

### 게임 버그 수정 (도전 연출, 방 인원 동기화)

**요청**: 도전 과정 연출 미표시, 방 생성 시 본인 표시 안됨, 입장 시 기존 유저 갱신 안됨 버그 수정

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `libs/types/src/challenge-result.type.ts` | ChallengeResult 인터페이스에 `challengerId`, `bettorId` 필드 추가 |
| `libs/services/src/judgment.service.ts` | judgeChallenge 함수에서 challengerId, bettorId 반환하도록 수정 |
| `apps/frontend/src/pages/GamePage.tsx` | BackendChallengeResult 타입 업데이트, useRef로 stale closure 문제 해결, useEffect dependency 정리 |
| `apps/backend/src/game/game.gateway.ts` | room:join 성공 시 본인에게 `room:synced` 이벤트 전송 추가 |
| `apps/frontend/src/components/ChallengeResultModal.tsx` | 미사용 변수 제거, NodeJS.Timeout 타입을 브라우저 호환 타입으로 변경 |

#### 해결된 문제

1. **도전 결과 연출 미표시**: 백엔드에서 challengerId/bettorId 정보가 누락되어 프론트에서 도전자/베팅자를 찾지 못함
2. **방 생성 시 본인 미표시**: room:join 콜백 응답이 불안정하여 `room:synced` 이벤트로 백업
3. **입장 시 갱신 안됨**: useEffect dependency에 players/currentBet이 있어 이벤트 리스너가 불필요하게 재등록되며 stale closure 발생

---

## 2025-12-11

### 소켓 이벤트 디버깅 및 오류 처리 개선

**요청**: 소켓 연결 및 room:join 이벤트 관련 디버깅

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `apps/backend/src/game/game.gateway.ts` | 디버그 로그 추가, room:join 콜백 응답 구조 수정, 오류 처리 개선 |

---

### Render 배포 빌드 오류 수정

**요청**: Render 배포 시 발생하는 빌드 오류 해결

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `apps/backend/tsconfig.runtime.json` | 런타임 경로 해결을 위한 설정 추가 |
| `package.json` | TS_NODE_PROJECT 환경변수 추가, 빌드 도구를 dependencies로 이동 |

#### 해결된 문제

- `exit code 127` 오류: devDependencies가 설치되지 않아 빌드 도구 누락
- 런타임 경로 오류: tsconfig-paths가 올바른 tsconfig를 참조하도록 수정
- 해결 방법: 빌드에 필요한 `typescript`, `tsconfig-paths` 등을 dependencies로 이동

---

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

### 게임 대기실 UI 및 배포 설정

**요청**: 게임 룸에 현재 플레이어 목록을 띄우는 UI → 인원이 2인 이상일 때 방장이 시작 버튼 → 게임 UI 순서로 진행

#### 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `apps/frontend/src/components/WaitingRoom.tsx` | 신규 생성. 플레이어 목록, 준비 상태, 시작 버튼 컴포넌트 |
| `apps/frontend/src/pages/GamePage.tsx` | WaitingRoom 컴포넌트 연동, 호스트/준비 상태 관리 |
| `apps/backend/src/game/game.gateway.ts` | player:ready 이벤트, 플레이어 목록 브로드캐스트 추가 |
| `apps/frontend/src/main.tsx` | React Router v7 future flags 적용 |

---

### 프로덕션 배포 설정

**요청**: localhost URL이 아닌 정식 게임 URL로 배포

#### Firebase Hosting 배포

| 파일 | 변경 내용 |
|------|----------|
| `firebase.json` | 신규 생성. Firebase Hosting 설정 (SPA 라우팅) |
| `.firebaserc` | 신규 생성. Firebase 프로젝트 연결 (personal-project-park) |
| `apps/frontend/tsconfig.node.json` | composite, emitDeclarationOnly 설정 추가 (빌드 오류 수정) |

#### Render 백엔드 배포

| 파일 | 변경 내용 |
|------|----------|
| `render.yaml` | 신규 생성. Render 배포 설정 |
| `package.json` | start:backend 스크립트 추가 |
| `apps/backend/tsconfig.runtime.json` | 신규 생성. 런타임용 tsconfig |

#### 환경변수 분리

| 파일 | 변경 내용 |
|------|----------|
| `apps/frontend/src/config/env.ts` | 신규 생성. 환경변수 설정 모듈 |
| `apps/frontend/.env.development` | 신규 생성. 개발 환경 설정 |
| `apps/frontend/.env.production` | 신규 생성. 프로덕션 환경 설정 (Render 백엔드 URL) |
| `apps/frontend/src/pages/LobbyPage.tsx` | API URL 환경변수 적용 |
| `apps/frontend/src/hooks/useSocket.ts` | Socket URL 환경변수 적용 |
| `apps/frontend/tsconfig.json` | vite/client 타입 추가 |

#### 배포 URL

| 환경 | URL |
|------|-----|
| 프론트엔드 | https://personal-project-park.web.app |
| 백엔드 | https://webproject-piratedice-backend.onrender.com |

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
