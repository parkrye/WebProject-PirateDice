/**
 * 플레이어 행동 타입 정의
 */

/** 플레이어가 수행할 수 있는 행동 */
export type PlayerAction = 'bet' | 'challenge';

/** 베팅 액션 데이터 */
export interface BetAction {
  type: 'bet';
  diceValue: number;  // 베팅한 주사위 눈 (1-6)
  diceCount: number;  // 베팅한 개수
}

/** 도전 액션 데이터 */
export interface ChallengeAction {
  type: 'challenge';
}

/** 플레이어 액션 유니온 타입 */
export type PlayerActionData = BetAction | ChallengeAction;
