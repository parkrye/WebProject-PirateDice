/**
 * 플레이어 카드 컴포넌트
 * 테마: 해적 선원 카드
 */

import { SpeechBubble } from './SpeechBubble';

interface PlayerInfo {
  id: string;
  nickname: string;
  diceCount: number;
  isAlive: boolean;
}

interface PlayerCardProps {
  player: PlayerInfo;
  isCurrentTurn: boolean;
  isSelf?: boolean;
  chatMessage?: string | null;
}

export function PlayerCard({ player, isCurrentTurn, isSelf = false, chatMessage }: PlayerCardProps) {
  const baseClass = isSelf ? 'player-card-self' : 'player-card';
  const turnClass = isCurrentTurn ? 'player-card-turn' : '';
  const aliveClass = player.isAlive ? '' : 'opacity-50 grayscale';

  return (
    <div className={`${baseClass} ${turnClass} ${aliveClass} min-w-[100px] sm:min-w-[120px] p-2 sm:p-4 relative`}>
      {/* 말풍선 */}
      {chatMessage && <SpeechBubble message={chatMessage} />}
      <div className="text-center">
        {/* 플레이어 아이콘 */}
        <div className="text-xl sm:text-2xl mb-1 sm:mb-2">
          {isSelf ? '⭐' : '🏴‍☠️'}
        </div>

        {/* 닉네임 */}
        <p className={`font-medium truncate max-w-[80px] sm:max-w-[100px] mx-auto text-sm sm:text-base ${
          isSelf ? 'text-treasure' : 'text-cream'
        }`}>
          {player.nickname}
          {isSelf && <span className="text-xs ml-1">(나)</span>}
        </p>

        {/* 주사위 개수 표시 - 모바일에서 간소화 */}
        <div className="flex justify-center gap-0.5 sm:gap-1 mt-2 sm:mt-3">
          {player.isAlive ? (
            Array.from({ length: Math.min(player.diceCount, 5) }).map((_, i) => (
              <div
                key={i}
                className="dice-hidden !w-5 !h-5 sm:!w-6 sm:!h-6 text-xs"
              >
                <span className="text-muted text-[10px] sm:text-xs">?</span>
              </div>
            ))
          ) : (
            <span className="text-danger text-lg sm:text-xl">💀</span>
          )}
          {player.diceCount > 5 && (
            <span className="text-muted text-[10px] sm:text-xs self-center">+{player.diceCount - 5}</span>
          )}
        </div>

        {/* 상태 표시 */}
        <div className="mt-1.5 sm:mt-2">
          {player.isAlive ? (
            <span className="badge-alive text-[10px] sm:text-xs">
              🎲 {player.diceCount}개
            </span>
          ) : (
            <span className="badge-eliminated text-[10px] sm:text-xs">
              💀 탈락
            </span>
          )}
        </div>

        {/* 현재 턴 표시 */}
        {isCurrentTurn && player.isAlive && (
          <div className="mt-1 sm:mt-2 text-sea-glow text-[10px] sm:text-xs animate-pulse">
            ⚔️ 차례
          </div>
        )}
      </div>
    </div>
  );
}
