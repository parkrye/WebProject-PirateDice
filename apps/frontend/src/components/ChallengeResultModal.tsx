/**
 * 도전 결과 모달 컴포넌트
 * 단계별 연출: 선언 -> 도전자 -> 주사위 공개 -> 카운트 -> 결과
 */

import { useState, useEffect } from 'react';

interface ChallengeResult {
  challengerId: string;
  challengerNickname: string;
  targetId: string;
  targetNickname: string;
  bet: {
    diceValue: number;
    diceCount: number;
  };
  actualCount: number;
  challengerWins: boolean;
  loserPlayerIds: string[];
  allDice: { playerId: string; nickname: string; dice: number[] }[];
}

interface ChallengeResultModalProps {
  result: ChallengeResult | null;
  onClose: () => void;
}

// 연출 단계
type Phase =
  | 'declaration'      // 1. 베팅 선언 표시
  | 'challenger'       // 2. 도전자 등장
  | 'reveal'          // 3. 주사위 순차 공개
  | 'count'           // 4. 카운트 애니메이션
  | 'result';         // 5. 결과 발표

export function ChallengeResultModal({ result, onClose }: ChallengeResultModalProps) {
  const [phase, setPhase] = useState<Phase>('declaration');
  const [revealingPlayerIndex, setRevealingPlayerIndex] = useState(-1);
  const [revealedDiceCount, setRevealedDiceCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  // result가 변경될 때 상태 초기화
  useEffect(() => {
    if (result) {
      setPhase('declaration');
      setRevealingPlayerIndex(-1);
      setRevealedDiceCount(0);
      setDisplayCount(0);
    }
  }, [result]);

  useEffect(() => {
    if (!result) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const totalPlayers = result.allDice.length;

    // 1. 베팅 선언 (1.5초)
    timers.push(setTimeout(() => setPhase('challenger'), 1500));

    // 2. 도전자 등장 (1.5초)
    timers.push(setTimeout(() => {
      setPhase('reveal');
      setRevealingPlayerIndex(0);
      setRevealedDiceCount(0);
    }, 3000));

    // 3. 각 플레이어 주사위 순차 공개
    let currentTime = 3000;
    for (let playerIdx = 0; playerIdx < totalPlayers; playerIdx++) {
      const playerDice = result.allDice[playerIdx]?.dice ?? [];

      // 플레이어 시작
      timers.push(setTimeout(() => {
        setRevealingPlayerIndex(playerIdx);
        setRevealedDiceCount(0);
      }, currentTime));

      // 각 주사위 하나씩 공개 (0.4초 간격)
      for (let diceIdx = 0; diceIdx <= playerDice.length; diceIdx++) {
        timers.push(setTimeout(() => {
          setRevealedDiceCount(diceIdx);
        }, currentTime + (diceIdx * 400)));
      }

      currentTime += (playerDice.length + 1) * 400 + 300; // 플레이어 간 간격
    }

    // 4. 카운트 페이즈 (currentTime + 0.5초)
    timers.push(setTimeout(() => {
      setPhase('count');
      setRevealingPlayerIndex(totalPlayers); // 모든 플레이어 공개 완료

      // 카운트 애니메이션
      const countDuration = 1200;
      const steps = 15;
      const stepTime = countDuration / steps;
      let currentStep = 0;

      const countInterval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setDisplayCount(Math.round(easedProgress * result.actualCount));

        if (currentStep >= steps) {
          clearInterval(countInterval);
        }
      }, stepTime);

      timers.push(countInterval as unknown as ReturnType<typeof setTimeout>);
    }, currentTime + 500));

    // 5. 결과 발표 (카운트 후 1.5초)
    timers.push(setTimeout(() => setPhase('result'), currentTime + 2200));

    // 6. 자동 닫기 (결과 후 4초)
    timers.push(setTimeout(() => onClose(), currentTime + 6200));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [result, onClose]);

  if (!result) return null;

  const isSuccess = result.actualCount >= result.bet.diceCount;
  const winnerNickname = result.challengerWins ? result.challengerNickname : result.targetNickname;
  const loserNickname = result.challengerWins ? result.targetNickname : result.challengerNickname;

  // 주사위가 타겟 값이거나 와일드카드(1)인지 확인
  const isTargetDice = (value: number) => value === result.bet.diceValue || value === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">

        {/* 1단계: 베팅 선언 표시 */}
        {phase === 'declaration' && (
          <div className="text-center animate-bounce-in">
            <div className="text-5xl mb-4">📜</div>
            <h2 className="text-2xl font-bold text-treasure mb-4">
              {result.targetNickname}의 선언
            </h2>
            <div className="panel-parchment inline-block px-8 py-6">
              <p className="text-wood-dark text-3xl font-bold">
                "{result.bet.diceValue}이(가) {result.bet.diceCount}개 이상!"
              </p>
            </div>
          </div>
        )}

        {/* 2단계: 도전자 등장 */}
        {phase === 'challenger' && (
          <div className="text-center animate-bounce-in">
            <div className="text-6xl mb-4 animate-shake">⚔️</div>
            <h2 className="text-3xl font-bold text-danger mb-4">도전!</h2>
            <div className="flex items-center justify-center gap-8">
              {/* 도전자 */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-danger/30 border-4 border-danger flex items-center justify-center mb-2 animate-pulse">
                  <span className="text-3xl">⚔️</span>
                </div>
                <p className="text-danger font-bold text-xl">{result.challengerNickname}</p>
                <p className="text-muted text-sm">도전자</p>
              </div>

              <div className="text-4xl text-muted">VS</div>

              {/* 베팅자 */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-treasure/30 border-4 border-treasure flex items-center justify-center mb-2">
                  <span className="text-3xl">🎲</span>
                </div>
                <p className="text-treasure font-bold text-xl">{result.targetNickname}</p>
                <p className="text-muted text-sm">베팅자</p>
              </div>
            </div>
            <p className="text-cream mt-6 text-lg">
              정말 {result.bet.diceValue}이(가) {result.bet.diceCount}개 있을까?
            </p>
          </div>
        )}

        {/* 3~5단계: 주사위 공개, 카운트, 결과 */}
        {(phase === 'reveal' || phase === 'count' || phase === 'result') && (
          <div className="panel-wood animate-scale-in p-4 sm:p-6">
            {/* 헤더 */}
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-treasure-glow mb-1">
                🎲 주사위 공개
              </h2>
              <p className="text-muted text-sm">
                "{result.bet.diceValue}이(가) {result.bet.diceCount}개 이상" 확인 중...
              </p>
            </div>

            {/* 플레이어별 주사위 공개 */}
            <div className="space-y-3">
              {result.allDice.map((player, playerIndex) => {
                const isRevealed = playerIndex < revealingPlayerIndex ||
                  (playerIndex === revealingPlayerIndex && phase !== 'reveal');
                const isCurrentlyRevealing = playerIndex === revealingPlayerIndex && phase === 'reveal';

                return (
                  <div
                    key={player.playerId}
                    className={`bg-ocean-deep/60 rounded-lg p-3 transition-all duration-300 ${
                      playerIndex <= revealingPlayerIndex ? 'opacity-100' : 'opacity-30'
                    } ${isCurrentlyRevealing ? 'ring-2 ring-treasure' : ''}`}
                  >
                    {/* 플레이어 이름 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {player.playerId === result.challengerId ? '⚔️' : '🏴‍☠️'}
                      </span>
                      <span className={`font-medium ${
                        player.playerId === result.targetId ? 'text-treasure' : 'text-cream'
                      }`}>
                        {player.nickname}
                        {player.playerId === result.targetId && (
                          <span className="text-xs ml-1 text-muted">(베팅자)</span>
                        )}
                      </span>
                    </div>

                    {/* 주사위들 */}
                    <div className="flex gap-1 flex-wrap">
                      {player.dice.map((value, diceIndex) => {
                        const shouldShow = isRevealed ||
                          (isCurrentlyRevealing && diceIndex < revealedDiceCount);
                        const isTarget = isTargetDice(value);
                        const shouldHighlight = (phase === 'count' || phase === 'result') && isTarget;

                        return (
                          <div
                            key={diceIndex}
                            className={`transition-all duration-300 ${
                              shouldShow ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                            } ${shouldHighlight ? 'scale-110 ring-2 ring-treasure animate-pulse' : ''}`}
                          >
                            {shouldShow ? (
                              <DiceIcon value={value} isWild={value === 1} size="sm" />
                            ) : (
                              <div className="w-10 h-10 bg-wood-dark rounded-lg border-2 border-wood-accent flex items-center justify-center">
                                <span className="text-muted">?</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 카운트 표시 */}
            {(phase === 'count' || phase === 'result') && (
              <div className="mt-4 text-center animate-slide-up">
                <div className="bg-ocean-deep/80 rounded-xl p-4 border border-treasure/30">
                  <p className="text-muted text-sm mb-1">
                    {result.bet.diceValue} + 와일드카드(1) 총 개수
                  </p>
                  <div className="text-4xl font-bold text-treasure-glow mb-1">
                    {displayCount}개
                  </div>
                  <p className="text-sm">
                    베팅: <span className="text-treasure">{result.bet.diceCount}개</span> 이상
                  </p>
                </div>
              </div>
            )}

            {/* 결과 발표 */}
            {phase === 'result' && (
              <div className="mt-4 animate-bounce-in">
                {/* 결과 배너 */}
                <div
                  className={`rounded-xl p-4 text-center ${
                    isSuccess
                      ? 'bg-gradient-to-r from-success/20 via-success/30 to-success/20 border-2 border-success'
                      : 'bg-gradient-to-r from-danger/20 via-danger/30 to-danger/20 border-2 border-danger'
                  }`}
                >
                  <div className="text-3xl mb-1">
                    {isSuccess ? '✅' : '❌'}
                  </div>
                  <p className="text-xl font-bold text-cream mb-1">
                    {isSuccess ? '베팅 성공!' : '베팅 실패!'}
                  </p>
                  <p className="text-sm text-muted">
                    실제로 {result.actualCount}개 (베팅: {result.bet.diceCount}개)
                  </p>
                </div>

                {/* 승자/패자 표시 */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-success/20 rounded-xl p-3 text-center animate-winner-glow">
                    <div className="text-2xl mb-1">🏆</div>
                    <p className="text-success font-bold mb-1">승리!</p>
                    <p className="text-cream font-medium">{winnerNickname}</p>
                  </div>
                  <div className="bg-danger/20 rounded-xl p-3 text-center animate-loser-shake">
                    <div className="text-2xl mb-1">💀</div>
                    <p className="text-danger font-bold mb-1">패배</p>
                    <p className="text-cream font-medium">{loserNickname}</p>
                    <p className="text-muted text-xs mt-1">주사위 -1</p>
                  </div>
                </div>

                {/* 닫기 버튼 */}
                <div className="mt-4 text-center">
                  <button onClick={onClose} className="btn-wood px-6">
                    계속하기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 주사위 아이콘 컴포넌트
 */
function DiceIcon({ value, isWild, size = 'md' }: { value: number; isWild: boolean; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';
  const bgClass = isWild
    ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-900 text-cream'
    : 'bg-parchment border-parchment-dark text-wood-dark';

  // 도트 패턴
  const dots: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };

  const dotPositions = dots[value] ?? [];
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const gridSize = size === 'sm' ? 'w-6 h-6 gap-0.5' : 'w-7 h-7 gap-0.5';
  const dotColor = isWild ? 'bg-cream' : 'bg-wood-dark';

  return (
    <div className={`${sizeClass} ${bgClass} rounded-lg border-2 flex items-center justify-center shadow-dice`}>
      <div className={`grid grid-cols-3 grid-rows-3 ${gridSize}`}>
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const hasDot = dotPositions.some(([r, c]) => r === row && c === col);
            return (
              <div
                key={`${row}-${col}`}
                className={`${dotSize} rounded-full ${hasDot ? dotColor : 'bg-transparent'}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * 게임 종료 모달
 */
interface GameEndModalProps {
  winnerNickname: string;
  onClose: () => void;
}

export function GameEndModal({ winnerNickname, onClose }: GameEndModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative z-10 text-center animate-bounce-in">
        <div className="relative">
          <div className="text-8xl mb-4 animate-float">👑</div>
          <div className="absolute inset-0 text-8xl animate-pulse opacity-50">👑</div>
        </div>

        <h1 className="text-4xl font-bold text-treasure-glow mb-4 animate-glow">
          게임 종료!
        </h1>

        <div className="panel-wood p-8 animate-scale-in">
          <p className="text-2xl text-cream mb-2">최후의 승자</p>
          <p className="text-4xl font-bold text-treasure animate-winner-glow inline-block px-6 py-2">
            🏴‍☠️ {winnerNickname} 🏴‍☠️
          </p>
          <p className="text-muted mt-4">모든 보물을 차지했습니다!</p>
        </div>

        <button
          onClick={onClose}
          className="btn-treasure mt-8 text-xl px-12 py-4"
        >
          로비로 돌아가기
        </button>
      </div>
    </div>
  );
}

/**
 * 라운드 시작 알림
 */
interface RoundStartOverlayProps {
  round: number;
  onComplete: () => void;
}

export function RoundStartOverlay({ round, onComplete }: RoundStartOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none animate-fade-in">
      {/* 반투명 배경 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 컨텐츠 */}
      <div className="relative z-10 text-center animate-bounce-in">
        <div className="panel-wood px-12 py-8 rounded-xl">
          <div className="text-6xl mb-4">⚓</div>
          <h2 className="text-4xl font-bold text-treasure-glow">
            라운드 {round}
          </h2>
          <p className="text-xl text-cream mt-2 animate-fade-in">
            주사위를 굴립니다...
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 베팅 알림 토스트
 */
interface BetNotificationProps {
  playerNickname: string;
  diceValue: number;
  diceCount: number;
}

export function BetNotification({ playerNickname, diceValue, diceCount }: BetNotificationProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 animate-slide-up">
      <div className="bg-ocean-deep/90 border border-treasure/50 rounded-xl px-6 py-3 shadow-treasure">
        <p className="text-cream text-center">
          <span className="text-treasure font-bold">{playerNickname}</span>의 베팅:
          <br />
          <span className="text-xl font-bold">
            "{diceValue}이(가) {diceCount}개 이상"
          </span>
        </p>
      </div>
    </div>
  );
}
