# 시스템 설계 문서

> 이 문서는 Pirate Dice 게임의 시스템 설계를 정의합니다.
> 게임 규칙은 [game_rules.md](./game_rules.md)를 참조하세요.

---

## 게임 흐름

```
[로비] -> [게임 시작] -> [라운드 시작] -> [베팅/도전 턴] -> [판정] -> [라운드 종료]
                              ↑                                        ↓
                              └──────────── (생존자 2명 이상) ──────────┘
                                                   ↓ (생존자 1명)
                                              [게임 종료]
```

**주요 이벤트 흐름:**
1. 플레이어 입장 및 준비
2. 게임 시작 (순서 결정)
3. 라운드 시작 (주사위 굴림)
4. 베팅 또는 도전 선택
5. 도전 시 판정 및 주사위 손실 처리
6. 다음 라운드 또는 게임 종료

---

## 데이터 모델

```typescript
// libs/entities/player.entity.ts
interface Player {
  id: string;
  nickname: string;
  diceCount: number;           // 현재 보유 주사위 수
  currentDice: number[];       // 현재 라운드 주사위 값 (1-6)
  isAlive: boolean;            // 생존 여부
  order: number;               // 플레이 순서
}

// libs/entities/bet.entity.ts
interface Bet {
  playerId: string;
  diceValue: number;           // 베팅한 주사위 눈 (1-6)
  diceCount: number;           // 베팅한 개수
  timestamp: number;
}

// libs/entities/game-room.entity.ts
interface GameRoom {
  id: string;
  hostId: string;
  players: Player[];
  status: GameStatus;          // 'waiting' | 'playing' | 'finished'
  currentRound: number;
  currentTurnPlayerId: string;
  currentBet: Bet | null;
  discardedDice: number;       // 버려진 주사위 총 수 (최대 30)
  winnerId: string | null;
}

// libs/types/game-status.type.ts
type GameStatus = 'waiting' | 'playing' | 'finished';
type PlayerAction = 'bet' | 'challenge';
```

---

## API 설계

### REST API (게임방 관리)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/rooms` | 게임방 생성 |
| GET | `/api/rooms` | 게임방 목록 조회 |
| GET | `/api/rooms/:id` | 게임방 상세 조회 |
| POST | `/api/rooms/:id/join` | 게임방 참가 |
| POST | `/api/rooms/:id/leave` | 게임방 퇴장 |

### WebSocket Events (실시간 게임)

| Event (Client -> Server) | Payload | 설명 |
|--------------------------|---------|------|
| `game:ready` | `{ roomId }` | 게임 준비 완료 |
| `game:bet` | `{ roomId, diceValue, diceCount }` | 베팅 |
| `game:challenge` | `{ roomId }` | 도전 (블러프 선언) |

| Event (Server -> Client) | Payload | 설명 |
|--------------------------|---------|------|
| `game:started` | `{ players, firstPlayerId }` | 게임 시작 |
| `round:started` | `{ round, yourDice }` | 라운드 시작 (본인 주사위) |
| `turn:changed` | `{ currentPlayerId, currentBet }` | 턴 변경 |
| `challenge:result` | `{ allDice, result, loser, lostCount }` | 도전 결과 |
| `player:eliminated` | `{ playerId }` | 플레이어 탈락 |
| `game:ended` | `{ winnerId }` | 게임 종료 |

---

## 파일 구조 상세

```
libs/
├── constants/
│   └── game.constants.ts      # 게임 상수 (초기 주사위 수, 중앙 칸 수 등)
├── entities/
│   ├── player.entity.ts
│   ├── bet.entity.ts
│   └── game-room.entity.ts
├── services/
│   ├── dice.service.ts        # 주사위 굴림 로직
│   ├── betting.service.ts     # 베팅 검증 로직
│   └── judgment.service.ts    # 도전 판정 로직
├── game-engine/
│   ├── game-engine.ts         # 게임 상태 관리 메인 클래스
│   ├── round-manager.ts       # 라운드 진행 관리
│   └── turn-manager.ts        # 턴 순서 관리
└── types/
    ├── game-status.type.ts
    ├── player-action.type.ts
    └── challenge-result.type.ts
```

---

## Firebase 데이터 구조

```
/rooms
  /{roomId}
    /info
      - hostId: string
      - status: 'waiting' | 'playing' | 'finished'
      - createdAt: timestamp
      - maxPlayers: number
    /players
      /{playerId}
        - nickname: string
        - diceCount: number
        - isAlive: boolean
        - order: number
        - isReady: boolean
    /game
      - currentRound: number
      - currentTurnPlayerId: string
      - currentBet: { playerId, diceValue, diceCount } | null
      - discardedDice: number
    /rounds
      /{roundNumber}
        /dice
          /{playerId}: number[]  # 해당 라운드 주사위 값 (암호화 권장)
        /bets: Bet[]             # 해당 라운드 베팅 기록
        /result: ChallengeResult # 판정 결과
```

---

## 게임 상수 정의

> [game_rules.md](./game_rules.md)의 규칙을 기반으로 정의

```typescript
// libs/constants/game.constants.ts

// 플레이어 수에 따른 초기 주사위 개수
export const INITIAL_DICE_COUNT: Record<number, number> = {
  2: 15,
  3: 10,
  4: 7,
  5: 6,
  6: 5,
};

// 게임 설정
export const GAME_CONFIG = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  DICE_SIDES: 6,
  CENTER_SLOTS: 30,        // 중앙 버린 주사위 칸 수
  DICE_VALUES: [1, 2, 3, 4, 5, 6] as const,
} as const;

// 베팅 규칙
export const BETTING_RULES = {
  MIN_DICE_VALUE: 1,
  MAX_DICE_VALUE: 6,
  MIN_DICE_COUNT: 1,
} as const;
```
