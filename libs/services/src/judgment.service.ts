/**
 * 판정 서비스
 * 도전 판정 로직
 * @see .claude/game_rules.md 섹션 7 참조
 */

import type { ChallengeResult, ChallengeResultType, ChallengeWinner } from '@pirate-dice/types';
import type { Bet } from '@pirate-dice/entities';
import { countTotalDiceValue } from './dice.service';

/**
 * 도전 판정 입력 데이터
 */
export interface JudgeChallengeInput {
  /** 모든 플레이어의 주사위 (playerId -> 주사위 배열) */
  allPlayerDice: Record<string, number[]>;
  /** 현재 베팅 */
  currentBet: Bet;
  /** 도전자 ID */
  challengerId: string;
  /** 모든 생존 플레이어 ID 배열 */
  alivePlayerIds: string[];
}

/**
 * 도전 판정 실행
 *
 * 판정 규칙:
 * - R > Y: 베팅 성공, 도전자가 (R - Y)개 손실
 * - R < Y: 베팅 실패, 베팅자가 (Y - R)개 손실
 * - R = Y: 베팅 성공, 베팅자 제외 모든 플레이어가 1개씩 손실
 *
 * @param input 판정 입력 데이터
 * @returns 판정 결과
 */
export function judgeChallenge(input: JudgeChallengeInput): ChallengeResult {
  const { allPlayerDice, currentBet, challengerId, alivePlayerIds } = input;

  // 실제 개수 계산 (와일드카드 및 중앙 빨간 주사위 포함)
  const actualCount = countTotalDiceValue(
    allPlayerDice,
    currentBet.diceValue,
    true // 중앙 빨간 주사위 포함
  );

  const bettedCount = currentBet.diceCount;
  const diff = actualCount - bettedCount;

  let winner: ChallengeWinner;
  let resultType: ChallengeResultType;
  let loserPlayerIds: string[];
  let diceToLose: number;

  if (diff > 0) {
    // R > Y: 베팅 성공, 도전자 패배
    winner = 'bettor';
    resultType = 'bettor_wins';
    loserPlayerIds = [challengerId];
    diceToLose = diff;
  } else if (diff < 0) {
    // R < Y: 베팅 실패, 도전 성공
    winner = 'challenger';
    resultType = 'challenger_wins';
    loserPlayerIds = [currentBet.playerId];
    diceToLose = Math.abs(diff);
  } else {
    // R = Y: 베팅자 제외 모두 패배
    winner = 'bettor';
    resultType = 'exact_match';
    loserPlayerIds = alivePlayerIds.filter(id => id !== currentBet.playerId);
    diceToLose = 1;
  }

  return {
    winner,
    resultType,
    challengerId,
    bettorId: currentBet.playerId,
    loserPlayerIds,
    diceToLose,
    actualCount,
    bettedCount,
    bettedValue: currentBet.diceValue,
    revealedDice: allPlayerDice,
  };
}

/**
 * 판정 결과에 따른 주사위 손실량 계산
 * @param playerId 플레이어 ID
 * @param currentDiceCount 현재 주사위 개수
 * @param result 판정 결과
 * @returns 손실 후 남은 주사위 개수
 */
export function calculateRemainingDice(
  playerId: string,
  currentDiceCount: number,
  result: ChallengeResult
): number {
  if (!result.loserPlayerIds.includes(playerId)) {
    return currentDiceCount;
  }

  const remaining = currentDiceCount - result.diceToLose;
  return Math.max(0, remaining);
}

/**
 * 플레이어가 탈락했는지 확인
 * @param remainingDice 남은 주사위 개수
 * @returns 탈락 여부
 */
export function isEliminated(remainingDice: number): boolean {
  return remainingDice <= 0;
}

/**
 * 판정 결과 요약 문자열 생성
 */
export function formatChallengeResultSummary(result: ChallengeResult): string {
  const { resultType, actualCount, bettedCount, bettedValue, diceToLose } = result;

  switch (resultType) {
    case 'bettor_wins':
      return `실제 ${bettedValue}의 개수: ${actualCount}개 (베팅: ${bettedCount}개) - 도전자가 ${diceToLose}개 손실`;
    case 'challenger_wins':
      return `실제 ${bettedValue}의 개수: ${actualCount}개 (베팅: ${bettedCount}개) - 베팅자가 ${diceToLose}개 손실`;
    case 'exact_match':
      return `정확히 맞췄습니다! ${bettedValue}이(가) 정확히 ${actualCount}개 - 베팅자 제외 모두 1개씩 손실`;
  }
}
