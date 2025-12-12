/**
 * 대기실 컴포넌트
 * 플레이어 목록, 준비 상태, 게임 시작 버튼을 표시
 */

import { GAME_CONFIG } from '@pirate-dice/constants';

interface PlayerInfo {
  id: string;
  nickname: string;
  diceCount: number;
  order: number;
  isAlive: boolean;
  isReady: boolean;
}

interface WaitingRoomProps {
  roomId: string;
  players: PlayerInfo[];
  currentPlayerId: string;
  isHost: boolean;
  isReady: boolean;
  canStart: boolean;
  onReady: () => void;
  onStartGame: () => void;
  onLeave: () => void;
}

export function WaitingRoom({
  roomId,
  players,
  currentPlayerId,
  isHost,
  isReady,
  canStart,
  onReady,
  onStartGame,
  onLeave,
}: WaitingRoomProps) {
  const playerCount = players.length;
  const readyCount = players.filter(p => p.isReady).length;
  const minPlayers = GAME_CONFIG.MIN_PLAYERS;
  const maxPlayers = GAME_CONFIG.MAX_PLAYERS;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      alert('방 코드가 복사되었습니다!');
    } catch {
      alert(`방 코드: ${roomId}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      {/* 방 정보 패널 */}
      <div className="panel-wood mb-4 sm:mb-6 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-treasure">⚓ 대기실</h2>
          <div className="flex items-center gap-2">
            <span className="text-cream text-xs sm:text-sm">방 코드:</span>
            <button
              onClick={copyRoomCode}
              className="px-2 sm:px-3 py-1 bg-ocean-mid rounded text-treasure font-mono text-sm sm:text-base active:bg-ocean-deep transition-colors"
              title="클릭하여 복사"
            >
              {roomId}
            </button>
          </div>
        </div>

        {/* 인원 현황 */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted">
          <span>👥 {playerCount}/{maxPlayers}명</span>
          <span>•</span>
          <span>✅ {readyCount}/{playerCount}명 준비</span>
        </div>
      </div>

      {/* 플레이어 목록 */}
      <div className="panel-parchment mb-4 sm:mb-6 p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold text-wood-dark mb-3 sm:mb-4 text-center">
          🏴‍☠️ 승선한 선원들
        </h3>

        <div className="space-y-2 sm:space-y-3">
          {players.map((player, index) => {
            const isSelf = player.id === currentPlayerId;
            const isPlayerHost = index === 0;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all ${
                  isSelf
                    ? 'bg-treasure/20 border-2 border-treasure'
                    : 'bg-wood-light/30 border border-wood-accent/50'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* 순서 */}
                  <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-wood-dark text-cream rounded-full text-xs sm:text-sm flex-shrink-0">
                    {index + 1}
                  </span>

                  {/* 역할 아이콘 */}
                  <span className="text-lg sm:text-xl flex-shrink-0">
                    {isPlayerHost ? '👑' : '🏴‍☠️'}
                  </span>

                  {/* 닉네임 */}
                  <span className={`font-medium text-sm sm:text-base truncate ${isSelf ? 'text-treasure-dark' : 'text-wood-dark'}`}>
                    {player.nickname}
                    {isSelf && <span className="text-[10px] sm:text-xs ml-1 text-wood-accent">(나)</span>}
                    {isPlayerHost && <span className="text-[10px] sm:text-xs ml-1 text-red-600">(방장)</span>}
                  </span>
                </div>

                {/* 준비 상태 */}
                <div className="flex-shrink-0 ml-2">
                  {player.isReady ? (
                    <span className="badge-ready text-[10px] sm:text-xs whitespace-nowrap">
                      ✅ 준비
                    </span>
                  ) : (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-600 text-[10px] sm:text-xs rounded-full whitespace-nowrap">
                      ⏳ 대기
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* 빈 슬롯 표시 */}
          {Array.from({ length: maxPlayers - playerCount }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center p-2 sm:p-3 rounded-lg border-2 border-dashed border-wood-accent/30"
            >
              <span className="text-muted text-xs sm:text-sm">빈 자리</span>
            </div>
          ))}
        </div>
      </div>

      {/* 액션 버튼 영역 */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 px-2 sm:px-0">
        {/* 준비 버튼 */}
        {!isReady ? (
          <button
            onClick={onReady}
            className="btn-treasure w-full max-w-xs text-base sm:text-lg"
          >
            ⚔️ 준비 완료
          </button>
        ) : (
          <div className="text-center">
            <span className="text-success text-base sm:text-lg">✅ 준비 완료!</span>
            <p className="text-muted text-xs sm:text-sm mt-1">다른 선원들을 기다리는 중...</p>
          </div>
        )}

        {/* 방장 전용: 게임 시작 버튼 */}
        {isHost && (
          <div className="w-full max-w-xs">
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full text-base sm:text-lg ${canStart ? 'btn-danger' : 'btn-wood opacity-50 cursor-not-allowed'}`}
            >
              🎲 게임 시작
            </button>

            {/* 시작 조건 안내 */}
            {!canStart && (
              <p className="text-center text-muted text-[10px] sm:text-xs mt-2">
                {playerCount < minPlayers
                  ? `최소 ${minPlayers}명이 필요합니다 (현재 ${playerCount}명)`
                  : `모든 선원이 준비해야 합니다 (${readyCount}/${playerCount}명 준비)`
                }
              </p>
            )}
          </div>
        )}

        {/* 일반 플레이어: 방장 대기 안내 */}
        {!isHost && canStart && (
          <p className="text-muted text-xs sm:text-sm animate-pulse">
            ⏳ 방장이 게임을 시작하기를 기다리는 중...
          </p>
        )}

        {/* 나가기 버튼 */}
        <button
          onClick={onLeave}
          className="mt-2 sm:mt-4 text-muted active:text-danger transition-colors text-xs sm:text-sm py-2"
        >
          🚪 방 나가기
        </button>
      </div>
    </div>
  );
}
