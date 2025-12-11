/**
 * 플레이어 엔티티 정의
 */

import type { ConnectionStatus } from '@pirate-dice/types';

/**
 * 플레이어 인터페이스
 */
export interface Player {
  /** 플레이어 고유 ID */
  id: string;
  /** 닉네임 */
  nickname: string;
  /** 현재 보유 주사위 수 */
  diceCount: number;
  /** 현재 라운드 주사위 값 (1-6 배열) */
  currentDice: number[];
  /** 생존 여부 */
  isAlive: boolean;
  /** 플레이 순서 (0부터 시작) */
  order: number;
  /** 준비 완료 여부 */
  isReady: boolean;
  /** 연결 상태 */
  connectionStatus: ConnectionStatus;
}

/**
 * 플레이어 생성 시 필요한 데이터
 */
export interface CreatePlayerData {
  id: string;
  nickname: string;
}

/**
 * 새 플레이어 생성 팩토리 함수
 */
export function createPlayer(data: CreatePlayerData, initialDiceCount: number): Player {
  return {
    id: data.id,
    nickname: data.nickname,
    diceCount: initialDiceCount,
    currentDice: [],
    isAlive: true,
    order: 0,
    isReady: false,
    connectionStatus: 'connected',
  };
}

/**
 * 플레이어 공개 정보 (다른 플레이어에게 보여지는 정보)
 */
export interface PublicPlayerInfo {
  id: string;
  nickname: string;
  diceCount: number;
  isAlive: boolean;
  order: number;
  isReady: boolean;
  connectionStatus: ConnectionStatus;
}

/**
 * Player를 PublicPlayerInfo로 변환
 */
export function toPublicPlayerInfo(player: Player): PublicPlayerInfo {
  return {
    id: player.id,
    nickname: player.nickname,
    diceCount: player.diceCount,
    isAlive: player.isAlive,
    order: player.order,
    isReady: player.isReady,
    connectionStatus: player.connectionStatus,
  };
}
