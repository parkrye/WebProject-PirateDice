/**
 * 도전 결과 모달 컴포넌트
 * 승자/패자 연출과 모든 주사위 공개
 */

import { useState, useEffect } from 'react';
import { AllDiceReveal } from './DiceDisplay';

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

type Phase = 'challenge' | 'reveal' | 'count' | 'result';

export function ChallengeResultModal({ result, onClose }: ChallengeResultModalProps) {
  const [phase, setPhase] = useState<Phase>('challenge');
  const [displayCount, setDisplayCount] = useState(0);

  // result가 변경될 때 상태 초기화
  useEffect(() => {
    if (result) {
      setPhase('challenge');
      setDisplayCount(0);
    }
  }, [result]);

  useEffect(() => {
    if (!result) return;

    // 페이즈 순서대로 진행
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 1. 도전 선언 (1초)
    timers.push(setTimeout(() => setPhase('reveal'), 1000));

    // 2. 주사위 공개 (2.5초)
    timers.push(setTimeout(() => setPhase('count'), 3500));

    // 3. 카운트 애니메이션 (1.5초)
    timers.push(setTimeout(() => {
      // 숫자 카운트 애니메이션
      const countDuration = 1500;
      const steps = 20;
      const stepTime = countDuration / steps;
      let currentStep = 0;

      const countInterval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setDisplayCount(Math.round(easedProgress * result.actualCount));

        if (currentStep >= steps) {
          clearInterval(countInterval);
        }
      }, stepTime);

      timers.push(countInterval as unknown as ReturnType<typeof setTimeout>);
    }, 3500));

    // 4. 결과 발표 (카운트 후 0.5초)
    timers.push(setTimeout(() => setPhase('result'), 5500));

    // 5. 자동 닫기 (결과 후 4초)
    timers.push(setTimeout(() => onClose(), 9500));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [result, onClose]);

  if (!result) return null;

  const isSuccess = result.actualCount >= result.bet.diceCount;
  const winnerNickname = result.challengerWins ? result.challengerNickname : result.targetNickname;
  const loserNickname = result.challengerWins ? result.targetNickname : result.challengerNickname;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 도전 선언 페이즈 */}
        {phase === 'challenge' && (
          <div className="text-center animate-bounce-in">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="text-3xl font-bold text-danger mb-2">도전!</h2>
            <p className="text-xl text-cream">
              <span className="text-treasure">{result.challengerNickname}</span>이(가)
              <br />
              <span className="text-treasure">{result.targetNickname}</span>의 베팅에 도전합니다!
            </p>
            <div className="mt-4 text-lg text-muted">
              "{result.bet.diceValue}이(가) {result.bet.diceCount}개 이상"
            </div>
          </div>
        )}

        {/* 주사위 공개 페이즈 */}
        {(phase === 'reveal' || phase === 'count' || phase === 'result') && (
          <div className="panel-wood animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-treasure-glow mb-2">
                🎲 모든 주사위 공개!
              </h2>
              <p className="text-muted">
                "{result.bet.diceValue}이(가) {result.bet.diceCount}개 이상" 인지 확인합니다
              </p>
            </div>

            {/* 모든 주사위 표시 */}
            <AllDiceReveal
              allDice={result.allDice}
              targetValue={result.bet.diceValue}
              isRevealing={phase === 'reveal'}
            />

            {/* 카운트 표시 */}
            {(phase === 'count' || phase === 'result') && (
              <div className="mt-6 text-center animate-slide-up">
                <div className="bg-ocean-deep/70 rounded-xl p-6 border border-treasure/30">
                  <p className="text-muted mb-2">
                    {result.bet.diceValue} (+ 와일드카드 1)의 총 개수
                  </p>
                  <div className="text-5xl font-bold text-treasure-glow mb-2">
                    {displayCount}개
                  </div>
                  <p className="text-lg">
                    베팅: <span className="text-treasure">{result.bet.diceCount}개</span> 이상
                  </p>
                </div>
              </div>
            )}

            {/* 결과 발표 */}
            {phase === 'result' && (
              <div className="mt-6 animate-bounce-in">
                {/* 결과 배너 */}
                <div
                  className={`rounded-xl p-6 text-center ${
                    isSuccess
                      ? 'bg-gradient-to-r from-success/20 via-success/30 to-success/20 border-2 border-success'
                      : 'bg-gradient-to-r from-danger/20 via-danger/30 to-danger/20 border-2 border-danger'
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {isSuccess ? '✅' : '❌'}
                  </div>
                  <p className="text-2xl font-bold text-cream mb-2">
                    {isSuccess ? '베팅 성공!' : '베팅 실패!'}
                  </p>
                  <p className="text-lg text-muted">
                    실제로 {result.actualCount}개가 있었습니다
                  </p>
                </div>

                {/* 승자/패자 표시 */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {/* 승자 */}
                  <div className="bg-success/20 rounded-xl p-4 text-center animate-winner-glow">
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="text-success font-bold text-lg mb-1">승리!</p>
                    <p className="text-cream text-xl">{winnerNickname}</p>
                  </div>

                  {/* 패자 */}
                  <div className="bg-danger/20 rounded-xl p-4 text-center animate-loser-shake">
                    <div className="text-3xl mb-2">💀</div>
                    <p className="text-danger font-bold text-lg mb-1">패배...</p>
                    <p className="text-cream text-xl">{loserNickname}</p>
                    <p className="text-muted text-sm mt-1">주사위 1개 잃음</p>
                  </div>
                </div>
              </div>
            )}

            {/* 닫기 버튼 */}
            {phase === 'result' && (
              <div className="mt-6 text-center">
                <button
                  onClick={onClose}
                  className="btn-wood px-8"
                >
                  계속하기
                </button>
              </div>
            )}
          </div>
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
        {/* 승리 효과 */}
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
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-bounce-in">
        <div className="text-6xl mb-4">⚓</div>
        <h2 className="text-4xl font-bold text-treasure-glow">
          라운드 {round}
        </h2>
        <p className="text-xl text-cream mt-2 animate-fade-in">
          주사위를 굴립니다...
        </p>
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
