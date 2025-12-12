/**
 * WebSocket 이벤트 타입 정의
 * @see .claude/CLAUDE.md API 설계 섹션 참조
 */

import type { ChallengeResult } from './challenge-result.type';

// ============================================
// Client -> Server Events
// ============================================

/** 게임 준비 완료 이벤트 */
export interface GameReadyPayload {
  roomId: string;
}

/** 베팅 이벤트 */
export interface GameBetPayload {
  roomId: string;
  diceValue: number;
  diceCount: number;
}

/** 도전 이벤트 */
export interface GameChallengePayload {
  roomId: string;
}

// ============================================
// Server -> Client Events
// ============================================

/** 게임 시작 이벤트 */
export interface GameStartedPayload {
  players: Array<{
    id: string;
    nickname: string;
    diceCount: number;
    order: number;
  }>;
  firstPlayerId: string;
}

/** 라운드 시작 이벤트 */
export interface RoundStartedPayload {
  round: number;
  yourDice: number[];
}

/** 턴 변경 이벤트 */
export interface TurnChangedPayload {
  currentPlayerId: string;
  currentBet: {
    playerId: string;
    diceValue: number;
    diceCount: number;
  } | null;
}

/** 도전 결과 이벤트 */
export interface ChallengeResultPayload {
  result: ChallengeResult;
}

/** 플레이어 탈락 이벤트 */
export interface PlayerEliminatedPayload {
  playerId: string;
  playerNickname: string;
}

/** 게임 종료 이벤트 */
export interface GameEndedPayload {
  winnerId: string;
  winnerNickname: string;
}

/** 플레이어 입장 이벤트 */
export interface PlayerJoinedPayload {
  playerId: string;
  nickname: string;
  playerCount: number;
}

/** 플레이어 퇴장 이벤트 */
export interface PlayerLeftPayload {
  playerId: string;
  nickname: string;
  playerCount: number;
}

/** 에러 이벤트 */
export interface ErrorPayload {
  code: string;
  message: string;
}

/** 도전 타임 시작 이벤트 */
export interface ChallengePhaseStartedPayload {
  bettorId: string;
  bettorNickname: string;
  bet: {
    diceValue: number;
    diceCount: number;
  };
  timeoutMs: number;
}

/** 플레이어 패스 이벤트 */
export interface PlayerPassedPayload {
  playerId: string;
  nickname: string;
  passedPlayerIds: string[];
}

/** 도전 타임 종료 이벤트 (타임아웃 또는 모두 패스) */
export interface ChallengePhaseEndedPayload {
  reason: 'timeout' | 'all_passed';
  nextPlayerId: string;
}

// ============================================
// Event Names
// ============================================

/** 클라이언트 -> 서버 이벤트 이름 */
export const CLIENT_EVENTS = {
  GAME_READY: 'game:ready',
  GAME_BET: 'game:bet',
  GAME_CHALLENGE: 'game:challenge',
  GAME_PASS: 'game:pass',
  PLAYER_JOIN: 'player:join',
  PLAYER_LEAVE: 'player:leave',
} as const;

/** 서버 -> 클라이언트 이벤트 이름 */
export const SERVER_EVENTS = {
  GAME_STARTED: 'game:started',
  ROUND_STARTED: 'round:started',
  TURN_CHANGED: 'turn:changed',
  CHALLENGE_PHASE_STARTED: 'challenge:phase:started',
  CHALLENGE_PHASE_ENDED: 'challenge:phase:ended',
  PLAYER_PASSED: 'player:passed',
  CHALLENGE_RESULT: 'challenge:result',
  PLAYER_ELIMINATED: 'player:eliminated',
  GAME_ENDED: 'game:ended',
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  ERROR: 'error',
} as const;
