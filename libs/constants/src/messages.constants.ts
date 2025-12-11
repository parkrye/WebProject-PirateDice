/**
 * 게임 메시지 상수
 * UI에 표시되는 모든 메시지 문자열
 */

export const GAME_MESSAGES = {
  // 게임 상태
  WAITING_FOR_PLAYERS: '플레이어를 기다리는 중...',
  GAME_STARTING: '게임이 곧 시작됩니다!',
  GAME_STARTED: '게임이 시작되었습니다!',
  GAME_ENDED: '게임이 종료되었습니다!',

  // 라운드
  ROUND_START: (round: number) => `라운드 ${round} 시작!`,
  ROLL_DICE: '주사위를 굴리세요!',
  YOUR_TURN: '당신의 차례입니다!',

  // 베팅
  BET_PLACED: (playerName: string, value: number, count: number) =>
    `${playerName}: "${value}이(가) ${count}개 이상"`,
  INVALID_BET: '유효하지 않은 베팅입니다.',
  BET_COUNT_TOO_LOW: '베팅 개수는 이전보다 같거나 높아야 합니다.',
  BET_VALUE_MUST_INCREASE: '개수가 같으면 주사위 눈이 더 커야 합니다.',

  // 도전
  CHALLENGE_DECLARED: (playerName: string) => `${playerName}이(가) 도전했습니다!`,
  REVEAL_DICE: '모든 주사위를 공개합니다!',

  // 판정 결과
  CHALLENGE_SUCCESS: (challengerName: string, bettorName: string, lostCount: number) =>
    `도전 성공! ${bettorName}이(가) 주사위 ${lostCount}개를 잃습니다.`,
  CHALLENGE_FAIL: (challengerName: string, lostCount: number) =>
    `도전 실패! ${challengerName}이(가) 주사위 ${lostCount}개를 잃습니다.`,
  EXACT_MATCH: (bettorName: string) =>
    `정확히 맞췄습니다! ${bettorName}을(를) 제외한 모든 플레이어가 주사위 1개씩 잃습니다.`,

  // 플레이어 상태
  PLAYER_JOINED: (playerName: string) => `${playerName}이(가) 입장했습니다.`,
  PLAYER_LEFT: (playerName: string) => `${playerName}이(가) 퇴장했습니다.`,
  PLAYER_ELIMINATED: (playerName: string) => `${playerName}이(가) 탈락했습니다!`,
  PLAYER_WINS: (playerName: string) => `${playerName}이(가) 승리했습니다!`,

  // 연결 상태
  DISCONNECTED: '연결이 끊어졌습니다.',
  RECONNECTED: '다시 연결되었습니다.',
  WAITING_FOR_RECONNECT: (playerName: string) =>
    `${playerName}의 재접속을 기다리는 중...`,

  // 타임아웃
  TURN_TIMEOUT_WARNING: (seconds: number) => `${seconds}초 남았습니다!`,
  AUTO_BET_DUE_TO_TIMEOUT: '시간 초과로 자동 베팅되었습니다.',
} as const;

/**
 * 에러 메시지 상수
 */
export const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: '게임방을 찾을 수 없습니다.',
  ROOM_FULL: '게임방이 가득 찼습니다.',
  GAME_ALREADY_STARTED: '게임이 이미 시작되었습니다.',
  NOT_YOUR_TURN: '당신의 차례가 아닙니다.',
  INVALID_ACTION: '유효하지 않은 행동입니다.',
  PLAYER_NOT_FOUND: '플레이어를 찾을 수 없습니다.',
  CANNOT_CHALLENGE_FIRST_TURN: '첫 턴에는 도전할 수 없습니다.',
  NOT_ENOUGH_PLAYERS: '플레이어가 부족합니다.',
} as const;
