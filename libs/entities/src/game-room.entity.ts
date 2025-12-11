/**
 * 게임방 엔티티 정의
 */

import type { GameStatus } from '@pirate-dice/types';
import type { Player } from './player.entity';
import type { Bet } from './bet.entity';

/**
 * 게임방 인터페이스
 */
export interface GameRoom {
  /** 게임방 고유 ID */
  id: string;
  /** 방장 플레이어 ID */
  hostId: string;
  /** 참가한 플레이어 목록 */
  players: Player[];
  /** 게임 상태 */
  status: GameStatus;
  /** 현재 라운드 번호 */
  currentRound: number;
  /** 현재 턴 플레이어 ID */
  currentTurnPlayerId: string | null;
  /** 현재 베팅 */
  currentBet: Bet | null;
  /** 버려진 주사위 총 수 */
  discardedDice: number;
  /** 승자 플레이어 ID */
  winnerId: string | null;
  /** 생성 시간 */
  createdAt: number;
  /** 최대 플레이어 수 */
  maxPlayers: number;
}

/**
 * 게임방 생성 데이터
 */
export interface CreateGameRoomData {
  id: string;
  hostId: string;
  maxPlayers?: number;
}

/**
 * 새 게임방 생성 팩토리 함수
 */
export function createGameRoom(data: CreateGameRoomData): GameRoom {
  return {
    id: data.id,
    hostId: data.hostId,
    players: [],
    status: 'waiting',
    currentRound: 0,
    currentTurnPlayerId: null,
    currentBet: null,
    discardedDice: 0,
    winnerId: null,
    createdAt: Date.now(),
    maxPlayers: data.maxPlayers ?? 6,
  };
}

/**
 * 게임방 공개 정보 (목록 표시용)
 */
export interface PublicGameRoomInfo {
  id: string;
  hostNickname: string;
  playerCount: number;
  maxPlayers: number;
  status: GameStatus;
}
