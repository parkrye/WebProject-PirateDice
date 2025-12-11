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
    <div className="w-full max-w-2xl mx-auto">
      {/* 방 정보 패널 */}
      <div className="panel-wood mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-treasure">⚓ 대기실</h2>
          <div className="flex items-center gap-2">
            <span className="text-cream text-sm">방 코드:</span>
            <button
              onClick={copyRoomCode}
              className="px-3 py-1 bg-ocean-mid rounded text-treasure font-mono hover:bg-ocean-deep transition-colors"
              title="클릭하여 복사"
            >
              {roomId}
            </button>
          </div>
        </div>

        {/* 인원 현황 */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted">
          <span>👥 {playerCount}/{maxPlayers}명</span>
          <span>•</span>
          <span>✅ {readyCount}/{playerCount}명 준비</span>
        </div>
      </div>

      {/* 플레이어 목록 */}
      <div className="panel-parchment mb-6">
        <h3 className="text-lg font-bold text-wood-dark mb-4 text-center">
          🏴‍☠️ 승선한 선원들
        </h3>

        <div className="space-y-3">
          {players.map((player, index) => {
            const isSelf = player.id === currentPlayerId;
            const isPlayerHost = index === 0;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isSelf
                    ? 'bg-treasure/20 border-2 border-treasure'
                    : 'bg-wood-light/30 border border-wood-accent/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 순서 */}
                  <span className="w-6 h-6 flex items-center justify-center bg-wood-dark text-cream rounded-full text-sm">
                    {index + 1}
                  </span>

                  {/* 역할 아이콘 */}
                  <span className="text-xl">
                    {isPlayerHost ? '👑' : '🏴‍☠️'}
                  </span>

                  {/* 닉네임 */}
                  <span className={`font-medium ${isSelf ? 'text-treasure-dark' : 'text-wood-dark'}`}>
                    {player.nickname}
                    {isSelf && <span className="text-xs ml-1 text-wood-accent">(나)</span>}
                    {isPlayerHost && <span className="text-xs ml-1 text-red-600">(방장)</span>}
                  </span>
                </div>

                {/* 준비 상태 */}
                <div>
                  {player.isReady ? (
                    <span className="badge-ready">
                      ✅ 준비 완료
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      ⏳ 대기 중
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
              className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-wood-accent/30"
            >
              <span className="text-muted text-sm">빈 자리</span>
            </div>
          ))}
        </div>
      </div>

      {/* 액션 버튼 영역 */}
      <div className="flex flex-col items-center gap-4">
        {/* 준비 버튼 */}
        {!isReady ? (
          <button
            onClick={onReady}
            className="btn-treasure w-full max-w-xs text-lg"
          >
            ⚔️ 준비 완료
          </button>
        ) : (
          <div className="text-center">
            <span className="text-success text-lg">✅ 준비 완료!</span>
            <p className="text-muted text-sm mt-1">다른 선원들을 기다리는 중...</p>
          </div>
        )}

        {/* 방장 전용: 게임 시작 버튼 */}
        {isHost && (
          <div className="w-full max-w-xs">
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full text-lg ${canStart ? 'btn-danger' : 'btn-wood opacity-50 cursor-not-allowed'}`}
            >
              🎲 게임 시작
            </button>

            {/* 시작 조건 안내 */}
            {!canStart && (
              <p className="text-center text-muted text-xs mt-2">
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
          <p className="text-muted text-sm animate-pulse">
            ⏳ 방장이 게임을 시작하기를 기다리는 중...
          </p>
        )}
      </div>
    </div>
  );
}
