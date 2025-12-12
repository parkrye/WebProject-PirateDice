/**
 * 주사위 표시 컴포넌트
 * 테마: 황금 주사위 & 나무 주사위
 */

import { useState, useEffect } from 'react';

interface DiceDisplayProps {
  dice: number[];
  variant?: 'gold' | 'parchment' | 'hidden' | 'wild';
  size?: 'sm' | 'md' | 'lg';
  isRolling?: boolean;
  showAnimation?: boolean;
  highlightWildcards?: boolean;
}

/**
 * 주사위 눈을 표시하는 도트 패턴
 */
const DICE_DOTS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

const SIZE_CLASSES = {
  sm: { dice: 'w-10 h-10', dot: 'w-1.5 h-1.5', grid: 'w-6 h-6 gap-0.5' },
  md: { dice: 'w-14 h-14', dot: 'w-2 h-2', grid: 'w-8 h-8 gap-1' },
  lg: { dice: 'w-16 h-16', dot: 'w-2.5 h-2.5', grid: 'w-10 h-10 gap-1' },
};

function Dice({
  value,
  variant = 'parchment',
  size = 'md',
  isRolling = false,
  delay = 0,
}: {
  value: number;
  variant?: 'gold' | 'parchment' | 'hidden' | 'wild';
  size?: 'sm' | 'md' | 'lg';
  isRolling?: boolean;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isRolling) {
      setAnimating(true);
      // 굴리는 동안 랜덤 숫자 표시
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      // 딜레이 후 최종 값 표시
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setDisplayValue(value);
        setTimeout(() => setAnimating(false), 500);
      }, 800 + delay);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else {
      setDisplayValue(value);
    }
  }, [value, isRolling, delay]);

  const sizeClass = SIZE_CLASSES[size];

  if (variant === 'hidden') {
    return (
      <div className={`dice-hidden ${sizeClass.dice}`}>
        <span className="text-muted text-lg">?</span>
      </div>
    );
  }

  const dots = DICE_DOTS[displayValue] ?? [];
  const diceClass = variant === 'wild' ? 'dice-wild' : variant === 'gold' ? 'dice-gold' : 'dice';
  const dotColor = variant === 'wild' ? 'bg-cream' : 'bg-wood-dark';

  const animationClass = animating
    ? 'animate-dice-roll'
    : isRolling
    ? ''
    : 'animate-dice-bounce';

  return (
    <div
      className={`${diceClass} ${sizeClass.dice} ${animationClass} transition-transform`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`grid grid-cols-3 grid-rows-3 ${sizeClass.grid}`}>
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            return (
              <div
                key={`${row}-${col}`}
                className={`${sizeClass.dot} rounded-full transition-all duration-200 ${
                  hasDot ? dotColor : 'bg-transparent'
                }`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export function DiceDisplay({
  dice,
  variant = 'parchment',
  size = 'md',
  isRolling = false,
  showAnimation = true,
  highlightWildcards = true,
}: DiceDisplayProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {dice.map((value, index) => {
        // 1은 와일드카드이므로 빨간색으로 표시
        const diceVariant = highlightWildcards && value === 1 ? 'wild' : variant;
        return (
          <Dice
            key={index}
            value={value}
            variant={diceVariant}
            size={size}
            isRolling={isRolling}
            delay={showAnimation ? index * 100 : 0}
          />
        );
      })}
    </div>
  );
}

/**
 * 빨간 와일드카드 주사위
 */
export function WildcardDice({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className={`dice-wild ${sizeClass.dice}`}>
      <div className={`grid grid-cols-3 grid-rows-3 ${sizeClass.grid}`}>
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const hasDot = row === 1 && col === 1;
            return (
              <div
                key={`${row}-${col}`}
                className={`${sizeClass.dot} rounded-full ${
                  hasDot ? 'bg-cream' : 'bg-transparent'
                }`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * 모든 주사위 공개 디스플레이 (도전 결과용)
 */
interface AllDiceRevealProps {
  allDice: { playerId: string; nickname: string; dice: number[] }[];
  targetValue: number;
  isRevealing?: boolean;
}

export function AllDiceReveal({ allDice, targetValue, isRevealing = false }: AllDiceRevealProps) {
  const [revealed, setRevealed] = useState(false);

  // isRevealing이 변경될 때 상태 초기화
  useEffect(() => {
    if (isRevealing) {
      setRevealed(false); // 새로운 공개 시작 시 초기화
      const timeout = setTimeout(() => setRevealed(true), 1500);
      return () => clearTimeout(timeout);
    } else {
      setRevealed(false); // 공개 종료 시 초기화
    }
  }, [isRevealing]);

  return (
    <div className="space-y-4">
      {allDice.map((player, playerIndex) => (
        <div
          key={player.playerId}
          className="bg-ocean-deep/50 rounded-lg p-3 animate-slide-up"
          style={{ animationDelay: `${playerIndex * 200}ms` }}
        >
          <p className="text-treasure text-sm mb-2">{player.nickname}</p>
          <div className="flex gap-1 flex-wrap">
            {player.dice.map((value, diceIndex) => {
              const isTarget = value === targetValue || value === 1; // 1은 와일드카드
              // 1은 빨간 와일드카드로 표시
              const diceVariant = value === 1 ? 'wild' : 'parchment';
              return (
                <div
                  key={diceIndex}
                  className={`transition-all duration-300 ${
                    revealed && isTarget ? 'scale-110 ring-2 ring-treasure' : ''
                  }`}
                  style={{ animationDelay: `${(playerIndex * 5 + diceIndex) * 100}ms` }}
                >
                  <Dice
                    value={value}
                    size="sm"
                    variant={diceVariant}
                    isRolling={isRevealing && !revealed}
                    delay={(playerIndex * 5 + diceIndex) * 100}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
