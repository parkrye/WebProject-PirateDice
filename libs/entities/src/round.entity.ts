/**
 * 라운드 엔티티 정의
 */

import type { RoundPhase, ChallengeResult } from '@pirate-dice/types';
import type { Bet } from './bet.entity';

/**
 * 라운드 인터페이스
 */
export interface Round {
  /** 라운드 번호 */
  roundNumber: number;
  /** 라운드 단계 */
  phase: RoundPhase;
  /** 각 플레이어의 주사위 (playerId -> 주사위 배열) */
  playerDice: Record<string, number[]>;
  /** 이번 라운드의 베팅 기록 */
  bets: Bet[];
  /** 도전 결과 (도전이 발생한 경우) */
  challengeResult: ChallengeResult | null;
  /** 첫 베팅자 플레이어 ID */
  firstBettorId: string;
  /** 도전자 플레이어 ID */
  challengerId: string | null;
}

/**
 * 새 라운드 생성 팩토리 함수
 */
export function createRound(roundNumber: number, firstBettorId: string): Round {
  return {
    roundNumber,
    phase: 'rolling',
    playerDice: {},
    bets: [],
    challengeResult: null,
    firstBettorId,
    challengerId: null,
  };
}
