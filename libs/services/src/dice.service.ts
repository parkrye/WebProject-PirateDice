/**
 * 주사위 서비스
 * 주사위 굴림 및 관련 유틸리티
 */

import { GAME_CONFIG } from '@pirate-dice/constants';

/**
 * 단일 주사위 굴림
 * @returns 1-6 사이의 랜덤 값
 */
export function rollSingleDice(): number {
  return Math.floor(Math.random() * GAME_CONFIG.DICE_SIDES) + 1;
}

/**
 * 여러 개의 주사위 굴림
 * @param count 굴릴 주사위 개수
 * @returns 주사위 값 배열
 */
export function rollDice(count: number): number[] {
  if (count <= 0) {
    return [];
  }

  const dice: number[] = [];
  for (let i = 0; i < count; i++) {
    dice.push(rollSingleDice());
  }
  return dice;
}

/**
 * 주사위 배열에서 특정 값의 개수를 카운트
 * @param dice 주사위 배열
 * @param targetValue 찾을 값
 * @param includeWildcard 와일드카드(1) 포함 여부
 * @returns 해당 값의 개수
 */
export function countDiceValue(
  dice: number[],
  targetValue: number,
  includeWildcard: boolean = true
): number {
  let count = 0;

  for (const die of dice) {
    if (die === targetValue) {
      count++;
    } else if (includeWildcard && die === GAME_CONFIG.WILDCARD_VALUE && targetValue !== GAME_CONFIG.WILDCARD_VALUE) {
      // 와일드카드는 타겟 값이 1이 아닐 때만 추가 카운트
      count++;
    }
  }

  return count;
}

/**
 * 모든 플레이어의 주사위에서 특정 값의 총 개수를 카운트
 * @param allPlayerDice 모든 플레이어의 주사위 (playerId -> 주사위 배열)
 * @param targetValue 찾을 값
 * @param includeCenterWildcard 중앙 빨간 주사위 포함 여부
 * @returns 총 개수
 */
export function countTotalDiceValue(
  allPlayerDice: Record<string, number[]>,
  targetValue: number,
  includeCenterWildcard: boolean = true
): number {
  let totalCount = 0;

  for (const playerDice of Object.values(allPlayerDice)) {
    totalCount += countDiceValue(playerDice, targetValue, true);
  }

  // 중앙 빨간 주사위 추가 (와일드카드)
  if (includeCenterWildcard && targetValue !== GAME_CONFIG.WILDCARD_VALUE) {
    totalCount += GAME_CONFIG.CENTER_WILDCARD_COUNT;
  }

  return totalCount;
}

/**
 * 순서 결정을 위한 주사위 굴림 결과 비교
 * @param diceA 플레이어 A의 주사위 배열
 * @param diceB 플레이어 B의 주사위 배열
 * @returns A가 높으면 양수, B가 높으면 음수, 같으면 0
 */
export function compareDiceForOrder(diceA: number[], diceB: number[]): number {
  // 내림차순 정렬
  const sortedA = [...diceA].sort((a, b) => b - a);
  const sortedB = [...diceB].sort((a, b) => b - a);

  // 가장 높은 눈부터 비교
  const maxLength = Math.max(sortedA.length, sortedB.length);
  for (let i = 0; i < maxLength; i++) {
    const valueA = sortedA[i] ?? 0;
    const valueB = sortedB[i] ?? 0;

    if (valueA !== valueB) {
      return valueB - valueA; // 높은 값이 먼저 오도록
    }
  }

  return 0; // 완전히 동일
}
