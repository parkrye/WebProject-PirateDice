/**
 * 베팅 엔티티 정의
 */

/**
 * 베팅 인터페이스
 */
export interface Bet {
  /** 베팅한 플레이어 ID */
  playerId: string;
  /** 베팅한 주사위 눈 (1-6) */
  diceValue: number;
  /** 베팅한 개수 */
  diceCount: number;
  /** 베팅 시간 (타임스탬프) */
  timestamp: number;
}

/**
 * 베팅 생성 데이터
 */
export interface CreateBetData {
  playerId: string;
  diceValue: number;
  diceCount: number;
}

/**
 * 새 베팅 생성 팩토리 함수
 */
export function createBet(data: CreateBetData): Bet {
  return {
    playerId: data.playerId,
    diceValue: data.diceValue,
    diceCount: data.diceCount,
    timestamp: Date.now(),
  };
}

/**
 * 베팅 표시용 문자열 생성
 */
export function formatBet(bet: Bet): string {
  return `${bet.diceValue}이(가) ${bet.diceCount}개 이상`;
}
