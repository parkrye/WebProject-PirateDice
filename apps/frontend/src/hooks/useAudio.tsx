/**
 * 오디오 관리 훅
 * BGM 및 SFX 재생 관리
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { BGM, SFX, AUDIO_VOLUME } from '@pirate-dice/constants';

type BgmKey = keyof typeof BGM;
type SfxKey = keyof typeof SFX;

interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  bgmMuted: boolean;
  sfxMuted: boolean;
}

const STORAGE_KEY = 'pirate-dice-audio-settings';

/** localStorage에서 설정 로드 */
function loadSettings(): AudioSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return {
    bgmVolume: AUDIO_VOLUME.BGM,
    sfxVolume: AUDIO_VOLUME.SFX,
    bgmMuted: false,
    sfxMuted: false,
  };
}

/** localStorage에 설정 저장 */
function saveSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * 오디오 관리 훅
 */
export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(loadSettings);
  const [currentBgm, setCurrentBgm] = useState<BgmKey | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxPoolRef = useRef<Map<string, HTMLAudioElement[]>>(new Map());

  // 설정 변경 시 저장
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // BGM 볼륨 적용
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = settings.bgmMuted ? 0 : settings.bgmVolume;
    }
  }, [settings.bgmVolume, settings.bgmMuted]);

  /**
   * 사용자 인터랙션으로 오디오 활성화
   * (브라우저 정책상 사용자 인터랙션 후에만 오디오 재생 가능)
   */
  const enableAudio = useCallback(() => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
    }
  }, [isAudioEnabled]);

  /**
   * BGM 재생
   */
  const playBgm = useCallback((key: BgmKey) => {
    if (!isAudioEnabled) return;

    const path = BGM[key];
    if (!path) return;

    // 같은 BGM이 이미 재생 중이면 무시
    if (currentBgm === key && bgmRef.current && !bgmRef.current.paused) {
      return;
    }

    // 기존 BGM 정지
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }

    // 새 BGM 재생
    const audio = new Audio(path);
    audio.loop = key !== 'VICTORY'; // VICTORY는 1회 재생
    audio.volume = settings.bgmMuted ? 0 : settings.bgmVolume;

    audio.play().catch(err => {
      console.warn('BGM 재생 실패:', err);
    });

    bgmRef.current = audio;
    setCurrentBgm(key);
  }, [isAudioEnabled, currentBgm, settings.bgmVolume, settings.bgmMuted]);

  /**
   * BGM 정지
   */
  const stopBgm = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      bgmRef.current = null;
    }
    setCurrentBgm(null);
  }, []);

  /**
   * BGM 일시정지
   */
  const pauseBgm = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
    }
  }, []);

  /**
   * BGM 재개
   */
  const resumeBgm = useCallback(() => {
    if (bgmRef.current && isAudioEnabled) {
      bgmRef.current.play().catch(err => {
        console.warn('BGM 재개 실패:', err);
      });
    }
  }, [isAudioEnabled]);

  /**
   * SFX 재생
   */
  const playSfx = useCallback((key: SfxKey) => {
    if (!isAudioEnabled || settings.sfxMuted) return;

    const path = SFX[key];
    if (!path) return;

    // SFX 풀에서 재생 가능한 오디오 찾기 또는 새로 생성
    let pool = sfxPoolRef.current.get(path);
    if (!pool) {
      pool = [];
      sfxPoolRef.current.set(path, pool);
    }

    // 재생 가능한 오디오 찾기
    let audio = pool.find(a => a.paused || a.ended);

    if (!audio) {
      // 풀 크기 제한 (메모리 관리)
      if (pool.length >= 5) {
        audio = pool[0];
        audio.currentTime = 0;
      } else {
        audio = new Audio(path);
        pool.push(audio);
      }
    }

    audio.volume = settings.sfxVolume;
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn('SFX 재생 실패:', err);
    });
  }, [isAudioEnabled, settings.sfxVolume, settings.sfxMuted]);

  /**
   * BGM 볼륨 설정
   */
  const setBgmVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, bgmVolume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  /**
   * SFX 볼륨 설정
   */
  const setSfxVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, sfxVolume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  /**
   * BGM 음소거 토글
   */
  const toggleBgmMute = useCallback(() => {
    setSettings(prev => ({ ...prev, bgmMuted: !prev.bgmMuted }));
  }, []);

  /**
   * SFX 음소거 토글
   */
  const toggleSfxMute = useCallback(() => {
    setSettings(prev => ({ ...prev, sfxMuted: !prev.sfxMuted }));
  }, []);

  /**
   * 전체 음소거 토글
   */
  const toggleMuteAll = useCallback(() => {
    setSettings(prev => {
      const newMuted = !(prev.bgmMuted && prev.sfxMuted);
      return { ...prev, bgmMuted: newMuted, sfxMuted: newMuted };
    });
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
      sfxPoolRef.current.clear();
    };
  }, []);

  return {
    // 상태
    isAudioEnabled,
    currentBgm,
    bgmVolume: settings.bgmVolume,
    sfxVolume: settings.sfxVolume,
    bgmMuted: settings.bgmMuted,
    sfxMuted: settings.sfxMuted,
    isMuted: settings.bgmMuted && settings.sfxMuted,

    // 액션
    enableAudio,
    playBgm,
    stopBgm,
    pauseBgm,
    resumeBgm,
    playSfx,
    setBgmVolume,
    setSfxVolume,
    toggleBgmMute,
    toggleSfxMute,
    toggleMuteAll,
  };
}

/**
 * 오디오 컨텍스트 (전역 상태 공유용)
 */
import { createContext, useContext, type ReactNode } from 'react';

type AudioContextType = ReturnType<typeof useAudio>;

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audio = useAudio();

  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context;
}
