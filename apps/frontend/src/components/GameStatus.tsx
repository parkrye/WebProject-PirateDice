/**
 * 게임 상태 표시 컴포넌트
 * 테마: 보물상자
 */

import { WildcardDice } from './DiceDisplay';

interface CurrentBet {
  playerId: string;
  diceValue: number;
  diceCount: number;
}

interface PlayerInfo {
  id: string;
  nickname: string;
}

interface GameStatusProps {
  currentBet: CurrentBet | null;
  players: PlayerInfo[];
  discardedDice?: number;
}

export function GameStatus({ currentBet, players, discardedDice = 0 }: GameStatusProps) {
  const getBettorName = () => {
    if (!currentBet) return null;
    const bettor = players.find((p) => p.id === currentBet.playerId);
    return bettor?.nickname ?? 'Unknown';
  };

  return (
    <div className="treasure-chest min-w-[280px] max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-4 relative z-10">
        <h2 className="text-treasure-glow font-bold text-xl flex items-center justify-center gap-2">
          <span>💎</span> TREASURE CHEST <span>💎</span>
        </h2>
      </div>

      {/* 베팅 정보 */}
      <div className="relative z-10">
        {currentBet ? (
          <div className="text-center">
            <p className="text-muted text-sm mb-1">
              <span className="text-treasure">{getBettorName()}</span>의 베팅
            </p>
            <div className="bg-ocean-deep/50 rounded-lg p-4 border border-treasure/30">
              <p className="text-2xl text-cream font-bold">
                <span className="text-treasure">{currentBet.diceValue}</span>
                이(가){' '}
                <span className="text-treasure">{currentBet.diceCount}</span>
                개 이상
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-2 animate-float">🎲</div>
            <p className="text-muted">첫 베팅을 기다리는 중...</p>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-t border-treasure/30 my-4 relative z-10" />

      {/* 하단 정보 */}
      <div className="flex justify-between items-center text-sm relative z-10">
        {/* 버려진 주사위 */}
        <div className="flex items-center gap-2">
          <span className="text-treasure">🪙</span>
          <span className="text-muted">버려진:</span>
          <span className="text-cream font-bold">{discardedDice}개</span>
        </div>

        {/* 빨간 와일드카드 */}
        <div className="flex items-center gap-2">
          <span className="text-muted">와일드:</span>
          <WildcardDice size="sm" />
        </div>
      </div>
    </div>
  );
}
