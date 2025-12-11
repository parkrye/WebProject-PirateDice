/**
 * 주사위 표시 컴포넌트
 * 테마: 황금 주사위 & 나무 주사위
 */

interface DiceDisplayProps {
  dice: number[];
  variant?: 'gold' | 'parchment' | 'hidden';
  size?: 'sm' | 'md' | 'lg';
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
}: {
  value: number;
  variant?: 'gold' | 'parchment' | 'hidden';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass = SIZE_CLASSES[size];

  if (variant === 'hidden') {
    return (
      <div className={`dice-hidden ${sizeClass.dice}`}>
        <span className="text-muted text-lg">?</span>
      </div>
    );
  }

  const dots = DICE_DOTS[value] ?? [];
  const diceClass = variant === 'gold' ? 'dice-gold' : 'dice';
  const dotColor = variant === 'gold' ? 'bg-wood-dark' : 'bg-wood-dark';

  return (
    <div className={`${diceClass} ${sizeClass.dice}`}>
      <div className={`grid grid-cols-3 grid-rows-3 ${sizeClass.grid}`}>
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const hasDot = dots.some(([r, c]) => r === row && c === col);
            return (
              <div
                key={`${row}-${col}`}
                className={`${sizeClass.dot} rounded-full ${
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
}: DiceDisplayProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {dice.map((value, index) => (
        <Dice key={index} value={value} variant={variant} size={size} />
      ))}
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
