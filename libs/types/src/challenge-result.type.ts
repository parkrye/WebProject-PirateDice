/**
 * 도전 결과 타입 정의
 * @see .claude/game_rules.md 섹션 7 참조
 */

/** 도전 결과 승자 */
export type ChallengeWinner = 'bettor' | 'challenger';

/** 도전 결과 타입 */
export type ChallengeResultType =
  | 'bettor_wins'       // R > Y: 베팅 성공, 도전자 패배
  | 'challenger_wins'   // R < Y: 베팅 실패, 도전 성공
  | 'exact_match';      // R = Y: 베팅자 제외 모두 패배

/**
 * 도전 판정 결과 인터페이스
 */
export interface ChallengeResult {
  /** 승자 */
  winner: ChallengeWinner;
  /** 결과 타입 */
  resultType: ChallengeResultType;
  /** 도전자 플레이어 ID */
  challengerId: string;
  /** 베팅자 플레이어 ID */
  bettorId: string;
  /** 패배자 플레이어 ID (R=Y인 경우 배열) */
  loserPlayerIds: string[];
  /** 잃을 주사위 개수 */
  diceToLose: number;
  /** 실제 주사위 개수 (와일드카드 포함) */
  actualCount: number;
  /** 베팅된 개수 */
  bettedCount: number;
  /** 베팅된 주사위 눈 */
  bettedValue: number;
  /** 모든 플레이어의 주사위 (공개용) */
  revealedDice: Record<string, number[]>;
}
