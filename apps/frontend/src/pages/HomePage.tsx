/**
 * 홈 페이지 - 닉네임 입력 및 게임 시작
 * 테마: 해적선 선착장
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioControl } from '../components/AudioControl';
import { useAudioContext } from '../hooks/useAudio';

export function HomePage() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();
  const { playSfx } = useAudioContext();

  const handleSubmit = (e: React.FormEvent) => {
    playSfx('BUTTON_CLICK');
    e.preventDefault();

    if (nickname.trim().length < 2) {
      alert('닉네임은 2자 이상이어야 합니다.');
      return;
    }

    sessionStorage.setItem('nickname', nickname.trim());
    navigate('/lobby');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 해적선 애니메이션 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 해적선 1 - 좌에서 우로 */}
        <div
          className="absolute text-2xl opacity-20 animate-sail-right"
          style={{ top: '15%', animationDuration: '25s', animationDelay: '0s' }}
        >
          ⛵
        </div>
        {/* 해적선 2 - 우에서 좌로 */}
        <div
          className="absolute text-3xl opacity-15 animate-sail-left"
          style={{ top: '35%', animationDuration: '30s', animationDelay: '5s' }}
        >
          🚢
        </div>
        {/* 해적선 3 - 좌에서 우로 */}
        <div
          className="absolute text-xl opacity-25 animate-sail-right"
          style={{ top: '60%', animationDuration: '20s', animationDelay: '10s' }}
        >
          ⛵
        </div>
        {/* 해적선 4 - 우에서 좌로 */}
        <div
          className="absolute text-2xl opacity-20 animate-sail-left"
          style={{ top: '80%', animationDuration: '35s', animationDelay: '3s' }}
        >
          🚢
        </div>
        {/* 해적선 5 - 좌에서 우로 (작은 배) */}
        <div
          className="absolute text-lg opacity-30 animate-sail-right"
          style={{ top: '45%', animationDuration: '22s', animationDelay: '8s' }}
        >
          ⛵
        </div>
      </div>

      {/* 오디오 컨트롤 - 우측 상단 */}
      <div className="absolute top-4 right-4 z-10">
        <AudioControl />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* 로고 & 타이틀 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-wave">⚓</div>
          <h1 className="title-pirate text-5xl mb-2">Pirate Dice</h1>
          <p className="text-muted text-lg">보물을 건 블러핑 주사위 대결</p>
        </div>

        {/* 양피지 스타일 폼 */}
        <form onSubmit={handleSubmit} className="panel-parchment space-y-6">
          <div className="text-center mb-4">
            <span className="text-2xl">🏴‍☠️</span>
            <h2 className="text-wood-dark font-bold text-xl mt-2">선원 등록</h2>
          </div>

          <div>
            <label htmlFor="nickname" className="block text-wood-dark font-medium mb-2">
              해적 이름
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 bg-parchment-dark/30 border-2 border-wood-accent rounded-lg
                         text-wood-dark placeholder-wood-accent/60
                         focus:outline-none focus:border-treasure focus:bg-parchment"
              maxLength={12}
            />
          </div>

          <button type="submit" className="btn-treasure w-full py-3 text-lg">
            💰 모험 시작
          </button>
        </form>

        {/* 장식 요소 */}
        <div className="flex justify-center gap-4 mt-8 text-2xl opacity-60">
          <span className="animate-float">🪙</span>
          <span className="animate-float" style={{ animationDelay: '0.5s' }}>💎</span>
          <span className="animate-float" style={{ animationDelay: '1s' }}>🪙</span>
        </div>
      </div>
    </div>
  );
}
