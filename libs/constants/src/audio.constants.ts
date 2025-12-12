/**
 * 오디오 상수 정의
 * 모든 오디오 파일은 apps/frontend/public/audio/ 폴더에 위치
 */

/**
 * BGM (Background Music) 경로
 * 파일 위치: apps/frontend/public/audio/bgm/
 */
export const BGM = {
  /** 로비/대기방 BGM - 잔잔한 해적 테마 */
  LOBBY: '/audio/bgm/lobby.mp3',
  /** 게임 중 BGM - 긴장감 있는 음악 */
  GAME: '/audio/bgm/game.mp3',
  /** 게임 종료 BGM - 승리 팡파르 */
  VICTORY: '/audio/bgm/victory.mp3',
} as const;

/**
 * SFX (Sound Effects) 경로
 * 파일 위치: apps/frontend/public/audio/sfx/
 */
export const SFX = {
  /** 주사위 굴리기 */
  DICE_ROLL: '/audio/sfx/dice-roll.mp3',
  /** 베팅 선언 */
  BET_PLACE: '/audio/sfx/bet-place.mp3',
  /** 도전 선언 */
  CHALLENGE: '/audio/sfx/challenge.mp3',
  /** 도전 성공 (도전자 승리) */
  CHALLENGE_WIN: '/audio/sfx/challenge-win.mp3',
  /** 도전 실패 (베팅자 승리) */
  CHALLENGE_LOSE: '/audio/sfx/challenge-lose.mp3',
  /** 플레이어 탈락 */
  PLAYER_ELIMINATED: '/audio/sfx/eliminated.mp3',
  /** 라운드 시작 */
  ROUND_START: '/audio/sfx/round-start.mp3',
  /** 내 턴 시작 */
  MY_TURN: '/audio/sfx/my-turn.mp3',
  /** 버튼 클릭 */
  BUTTON_CLICK: '/audio/sfx/button-click.mp3',
  /** 채팅 메시지 수신 */
  CHAT_MESSAGE: '/audio/sfx/chat-message.mp3',
  /** 도전 타임 시작 */
  CHALLENGE_PHASE: '/audio/sfx/challenge-phase.mp3',
  /** 타이머 경고 (3초 남음) */
  TIMER_WARNING: '/audio/sfx/timer-warning.mp3',
  /** 묵시 (패스) */
  PASS: '/audio/sfx/pass.mp3',
  /** 플레이어 입장 */
  PLAYER_JOIN: '/audio/sfx/player-join.mp3',
  /** 플레이어 퇴장 */
  PLAYER_LEAVE: '/audio/sfx/player-leave.mp3',
  /** 게임 시작 */
  GAME_START: '/audio/sfx/game-start.mp3',
  /** 주사위 공개 (도전 결과 시) */
  DICE_REVEAL: '/audio/sfx/dice-reveal.mp3',
} as const;

/**
 * 오디오 볼륨 기본값
 */
export const AUDIO_VOLUME = {
  BGM: 0.3,
  SFX: 0.5,
} as const;

/**
 * 오디오 파일 목록 (개발자 참조용)
 *
 * 📁 apps/frontend/public/audio/
 * ├── 📁 bgm/
 * │   ├── lobby.mp3      - 로비/대기방 BGM (루프 재생)
 * │   ├── game.mp3       - 게임 중 BGM (루프 재생)
 * │   └── victory.mp3    - 게임 종료 BGM (1회 재생)
 * │
 * └── 📁 sfx/
 *     ├── dice-roll.mp3       - 주사위 굴리기 (라운드 시작 시)
 *     ├── bet-place.mp3       - 베팅 선언
 *     ├── challenge.mp3       - "도전!" 선언
 *     ├── challenge-win.mp3   - 도전 성공 (도전자 승리)
 *     ├── challenge-lose.mp3  - 도전 실패 (베팅자 승리)
 *     ├── eliminated.mp3      - 플레이어 탈락
 *     ├── round-start.mp3     - 라운드 시작 알림
 *     ├── my-turn.mp3         - 내 턴 알림
 *     ├── button-click.mp3    - 버튼 클릭
 *     ├── chat-message.mp3    - 채팅 메시지 수신
 *     ├── challenge-phase.mp3 - 도전 타임 시작
 *     ├── timer-warning.mp3   - 타이머 3초 경고
 *     ├── pass.mp3            - 묵시 선택
 *     ├── player-join.mp3     - 플레이어 입장
 *     ├── player-leave.mp3    - 플레이어 퇴장
 *     ├── game-start.mp3      - 게임 시작
 *     └── dice-reveal.mp3     - 주사위 공개 (도전 결과)
 */
