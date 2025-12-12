/**
 * 오디오 컨트롤 컴포넌트
 * BGM/SFX 음소거 토글 버튼
 */

import { useState } from 'react';
import { useAudioContext } from '../hooks/useAudio';

export function AudioControl() {
  const {
    isAudioEnabled,
    enableAudio,
    isMuted,
    bgmMuted,
    sfxMuted,
    bgmVolume,
    sfxVolume,
    toggleBgmMute,
    toggleSfxMute,
    setBgmVolume,
    setSfxVolume,
    playSfx,
  } = useAudioContext();

  const [showPanel, setShowPanel] = useState(false);

  const handleClick = () => {
    if (!isAudioEnabled) {
      enableAudio();
    }
    setShowPanel(!showPanel);
    playSfx('BUTTON_CLICK');
  };

  return (
    <div className="relative">
      {/* 메인 버튼 - 클릭 시 설정 패널 열림 */}
      <button
        onClick={handleClick}
        className="btn-wood px-2 py-1 text-lg"
        title="오디오 설정"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* 설정 패널 */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 bg-wood-dark border-2 border-treasure rounded-lg p-3 shadow-lg z-50 min-w-48">
          <div className="space-y-3">
            {/* BGM 설정 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-cream text-sm">BGM</span>
                <button
                  onClick={() => {
                    toggleBgmMute();
                    playSfx('BUTTON_CLICK');
                  }}
                  className="text-lg"
                >
                  {bgmMuted ? '🔇' : '🎵'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={bgmVolume * 100}
                onChange={(e) => setBgmVolume(Number(e.target.value) / 100)}
                className="w-full accent-treasure"
                disabled={bgmMuted}
              />
            </div>

            {/* SFX 설정 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-cream text-sm">SFX</span>
                <button
                  onClick={() => {
                    toggleSfxMute();
                    playSfx('BUTTON_CLICK');
                  }}
                  className="text-lg"
                >
                  {sfxMuted ? '🔇' : '🔔'}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume * 100}
                onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
                className="w-full accent-treasure"
                disabled={sfxMuted}
              />
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => setShowPanel(false)}
              className="w-full btn-wood text-sm py-1"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
