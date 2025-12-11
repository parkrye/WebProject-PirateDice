/**
 * 플레이어 카드 컴포넌트
 * 테마: 해적 선원 카드
 */

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
}

export function PlayerCard({ player, isCurrentTurn, isSelf = false }: PlayerCardProps) {
  const baseClass = isSelf ? 'player-card-self' : 'player-card';
  const turnClass = isCurrentTurn ? 'player-card-turn' : '';
  const aliveClass = player.isAlive ? '' : 'opacity-50 grayscale';

  return (
    <div className={`${baseClass} ${turnClass} ${aliveClass} min-w-[120px]`}>
      <div className="text-center">
        {/* 플레이어 아이콘 */}
        <div className="text-2xl mb-2">
          {isSelf ? '⭐' : '🏴‍☠️'}
        </div>

        {/* 닉네임 */}
        <p className={`font-medium truncate max-w-[100px] mx-auto ${
          isSelf ? 'text-treasure' : 'text-cream'
        }`}>
          {player.nickname}
          {isSelf && <span className="text-xs ml-1">(나)</span>}
        </p>

        {/* 주사위 개수 표시 */}
        <div className="flex justify-center gap-1 mt-3">
          {player.isAlive ? (
            Array.from({ length: Math.min(player.diceCount, 6) }).map((_, i) => (
              <div
                key={i}
                className="dice-hidden w-6 h-6 text-xs"
              >
                <span className="text-muted">?</span>
              </div>
            ))
          ) : (
            <span className="text-danger">💀</span>
          )}
          {player.diceCount > 6 && (
            <span className="text-muted text-xs self-center">+{player.diceCount - 6}</span>
          )}
        </div>

        {/* 상태 표시 */}
        <div className="mt-2">
          {player.isAlive ? (
            <span className="badge-alive">
              🎲 {player.diceCount}개
            </span>
          ) : (
            <span className="badge-eliminated">
              💀 탈락
            </span>
          )}
        </div>

        {/* 현재 턴 표시 */}
        {isCurrentTurn && player.isAlive && (
          <div className="mt-2 text-sea-glow text-xs animate-pulse">
            ⚔️ 차례
          </div>
        )}
      </div>
    </div>
  );
}
