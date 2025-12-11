/**
 * 베팅 서비스
 * 베팅 유효성 검증 로직
 * @see .claude/game_rules.md 섹션 5 참조
 */

import { BETTING_RULES } from '@pirate-dice/constants';
import type { Bet } from '@pirate-dice/entities';

/**
 * 베팅 검증 결과
 */
export interface BetValidationResult {
  isValid: boolean;
  errorCode?: BetValidationErrorCode;
  errorMessage?: string;
}

/**
 * 베팅 검증 에러 코드
 */
export type BetValidationErrorCode =
  | 'INVALID_DICE_VALUE'
  | 'INVALID_DICE_COUNT'
  | 'COUNT_TOO_LOW'
  | 'VALUE_MUST_INCREASE';

/**
 * 베팅 유효성 검증
 *
 * 규칙:
 * 1. 개수 하락 금지: 이전 베팅보다 개수(Y)를 낮출 수 없음
 * 2. 개수를 올릴 때: X는 임의 변경 가능
 * 3. 개수를 유지할 때: X는 반드시 증가해야 함
 *
 * @param previousBet 이전 베팅 (첫 베팅인 경우 null)
 * @param newDiceValue 새 베팅의 주사위 눈
 * @param newDiceCount 새 베팅의 개수
 * @returns 검증 결과
 */
export function validateBet(
  previousBet: Bet | null,
  newDiceValue: number,
  newDiceCount: number
): BetValidationResult {
  // 기본 범위 검증
  if (newDiceValue < BETTING_RULES.MIN_DICE_VALUE || newDiceValue > BETTING_RULES.MAX_DICE_VALUE) {
    return {
      isValid: false,
      errorCode: 'INVALID_DICE_VALUE',
      errorMessage: `주사위 눈은 ${BETTING_RULES.MIN_DICE_VALUE}~${BETTING_RULES.MAX_DICE_VALUE} 사이여야 합니다.`,
    };
  }

  if (newDiceCount < BETTING_RULES.MIN_DICE_COUNT) {
    return {
      isValid: false,
      errorCode: 'INVALID_DICE_COUNT',
      errorMessage: `베팅 개수는 ${BETTING_RULES.MIN_DICE_COUNT} 이상이어야 합니다.`,
    };
  }

  // 첫 베팅인 경우 항상 유효
  if (!previousBet) {
    return { isValid: true };
  }

  // 규칙 1: 개수 하락 금지
  if (newDiceCount < previousBet.diceCount) {
    return {
      isValid: false,
      errorCode: 'COUNT_TOO_LOW',
      errorMessage: '베팅 개수는 이전 베팅보다 같거나 높아야 합니다.',
    };
  }

  // 규칙 2: 개수 증가 시 X 자유
  if (newDiceCount > previousBet.diceCount) {
    return { isValid: true };
  }

  // 규칙 3: 개수 유지 시 X 증가 필수
  if (newDiceValue <= previousBet.diceValue) {
    return {
      isValid: false,
      errorCode: 'VALUE_MUST_INCREASE',
      errorMessage: '개수가 같으면 주사위 눈이 더 커야 합니다.',
    };
  }

  return { isValid: true };
}

/**
 * 베팅 가능 여부 확인 (간단 버전)
 */
export function isValidBet(
  previousBet: Bet | null,
  newDiceValue: number,
  newDiceCount: number
): boolean {
  return validateBet(previousBet, newDiceValue, newDiceCount).isValid;
}

/**
 * 가능한 다음 베팅 옵션 계산
 * @param previousBet 이전 베팅 (첫 베팅인 경우 null)
 * @returns 가능한 베팅 옵션 배열
 */
export function getAvailableBetOptions(
  previousBet: Bet | null
): Array<{ diceValue: number; diceCount: number }> {
  const options: Array<{ diceValue: number; diceCount: number }> = [];

  if (!previousBet) {
    // 첫 베팅: 모든 조합 가능
    for (let value = BETTING_RULES.MIN_DICE_VALUE; value <= BETTING_RULES.MAX_DICE_VALUE; value++) {
      options.push({ diceValue: value, diceCount: BETTING_RULES.MIN_DICE_COUNT });
    }
    return options;
  }

  // 같은 개수, 높은 눈
  for (let value = previousBet.diceValue + 1; value <= BETTING_RULES.MAX_DICE_VALUE; value++) {
    options.push({ diceValue: value, diceCount: previousBet.diceCount });
  }

  // 높은 개수, 모든 눈
  for (let value = BETTING_RULES.MIN_DICE_VALUE; value <= BETTING_RULES.MAX_DICE_VALUE; value++) {
    options.push({ diceValue: value, diceCount: previousBet.diceCount + 1 });
  }

  return options;
}
