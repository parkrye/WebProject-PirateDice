/**
 * 게임 상태 타입 정의
 */

/** 게임방 상태 */
export type GameStatus = 'waiting' | 'playing' | 'finished';

/** 라운드 단계 */
export type RoundPhase =
  | 'rolling'      // 주사위 굴리는 중
  | 'betting'      // 베팅 진행 중
  | 'challenging'  // 도전 판정 중
  | 'finished';    // 라운드 종료

/** 플레이어 연결 상태 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';
