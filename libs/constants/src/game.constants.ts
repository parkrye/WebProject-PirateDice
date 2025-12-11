/**
 * 게임 상수 정의
 * @see .claude/game_rules.md 참조
 */

/**
 * 플레이어 수에 따른 초기 주사위 개수
 * - 2인: 15개
 * - 3인: 10개
 * - 4인: 7개
 * - 5인: 6개
 * - 6인: 5개
 */
export const INITIAL_DICE_COUNT: Readonly<Record<number, number>> = {
  2: 15,
  3: 10,
  4: 7,
  5: 6,
  6: 5,
} as const;

/**
 * 게임 기본 설정
 */
export const GAME_CONFIG = {
  /** 최소 플레이어 수 */
  MIN_PLAYERS: 2,
  /** 최대 플레이어 수 */
  MAX_PLAYERS: 6,
  /** 주사위 면 수 */
  DICE_SIDES: 6,
  /** 중앙 버린 주사위 칸 수 */
  CENTER_SLOTS: 30,
  /** 가능한 주사위 눈 */
  DICE_VALUES: [1, 2, 3, 4, 5, 6] as const,
  /** 와일드카드 주사위 눈 (빨간 주사위) */
  WILDCARD_VALUE: 1,
  /** 중앙 빨간 주사위 개수 */
  CENTER_WILDCARD_COUNT: 1,
} as const;

/**
 * 베팅 규칙 상수
 */
export const BETTING_RULES = {
  /** 최소 주사위 눈 */
  MIN_DICE_VALUE: 1,
  /** 최대 주사위 눈 */
  MAX_DICE_VALUE: 6,
  /** 최소 베팅 개수 */
  MIN_DICE_COUNT: 1,
} as const;

/**
 * 게임 타이밍 설정 (밀리초)
 */
export const GAME_TIMING = {
  /** 턴 타임아웃 (기본 30초) */
  TURN_TIMEOUT: 30000,
  /** 연결 끊김 대기 시간 (기본 60초) */
  DISCONNECT_TIMEOUT: 60000,
  /** 라운드 시작 대기 시간 */
  ROUND_START_DELAY: 2000,
  /** 판정 결과 표시 시간 */
  JUDGMENT_DISPLAY_TIME: 3000,
} as const;

/**
 * 게임방 설정
 */
export const ROOM_CONFIG = {
  /** 게임방 ID 길이 */
  ROOM_ID_LENGTH: 6,
  /** 최대 대기 시간 (방 자동 삭제) */
  MAX_IDLE_TIME: 1800000, // 30분
} as const;
