/**
 * 베팅 패널 컴포넌트
 * 테마: 보물 베팅 테이블
 */

import { useState } from 'react';
import { BETTING_RULES } from '@pirate-dice/constants';

interface CurrentBet {
  playerId: string;
  diceValue: number;
  diceCount: number;
}

interface BettingPanelProps {
  currentBet: CurrentBet | null;
  onBet: (diceValue: number, diceCount: number) => void;
  onChallenge: () => void;
  canChallenge: boolean;
}

export function BettingPanel({
  currentBet,
  onBet,
  onChallenge,
  canChallenge,
}: BettingPanelProps) {
  const [diceValue, setDiceValue] = useState(currentBet?.diceValue ?? 1);
  const [diceCount, setDiceCount] = useState(currentBet?.diceCount ?? 1);

  const isValidBet = (): boolean => {
    if (!currentBet) return true;

    if (diceCount < currentBet.diceCount) return false;
    if (diceCount === currentBet.diceCount && diceValue <= currentBet.diceValue) {
      return false;
    }
    return true;
  };

  const handleBet = () => {
    if (isValidBet()) {
      onBet(diceValue, diceCount);
    }
  };

  const minCount = currentBet?.diceCount ?? BETTING_RULES.MIN_DICE_COUNT;

  return (
    <div className="panel-wood mt-4 sm:mt-6 w-full max-w-md mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-wood-accent">
        <h3 className="text-treasure-glow font-bold text-base sm:text-lg flex items-center justify-center gap-2">
          <span>⚔️</span> 네 차례다!
        </h3>
      </div>

      {/* 베팅 입력 - 모바일에서 세로 배치 */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center mb-4">
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-muted text-xs sm:text-sm mb-1 sm:mb-2">🎲 주사위 눈</label>
            <select
              value={diceValue}
              onChange={(e) => setDiceValue(Number(e.target.value))}
              className="select-pirate text-base w-20"
            >
              {[1, 2, 3, 4, 5, 6].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-muted text-xs sm:text-sm mb-1 sm:mb-2">🪙 개수</label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={diceCount}
              onChange={(e) => setDiceCount(Math.max(minCount, Number(e.target.value)))}
              min={minCount}
              className="input-pirate w-20 text-center text-base"
            />
          </div>

          <span className="text-cream pb-3 font-medium text-sm sm:text-base">개 이상</span>
        </div>
      </div>

      {/* 현재 베팅 정보 */}
      {currentBet && (
        <div className="bg-ocean-deep/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 text-center">
          <p className="text-muted text-xs sm:text-sm">현재 베팅</p>
          <p className="text-treasure font-bold text-sm sm:text-base">
            "{currentBet.diceValue}이(가) {currentBet.diceCount}개 이상"
          </p>
        </div>
      )}

      {/* 액션 버튼 - 모바일에서 전체 너비 */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <button
          onClick={handleBet}
          disabled={!isValidBet()}
          className="btn-treasure flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <span>💰</span> 베팅
        </button>

        {canChallenge && (
          <button
            onClick={onChallenge}
            className="btn-danger flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span>⚔️</span> 도전!
          </button>
        )}
      </div>

      {/* 도움말 */}
      <div className="mt-3 sm:mt-4 text-center text-muted text-xs">
        {!canChallenge ? (
          <p>첫 턴에는 도전할 수 없습니다</p>
        ) : (
          <p>상대의 베팅이 거짓이라 생각하면 도전하세요!</p>
        )}
      </div>
    </div>
  );
}
