/**
 * 게임 페이지 - 메인 게임 화면
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useAudioContext } from '../hooks/useAudio';
import { PlayerCard } from '../components/PlayerCard';
import { DiceDisplay } from '../components/DiceDisplay';
import { BettingPanel } from '../components/BettingPanel';
import { GameStatus } from '../components/GameStatus';
import { WaitingRoom } from '../components/WaitingRoom';
import { ChatButton } from '../components/ChatButton';
import { AudioControl } from '../components/AudioControl';
import {
  ChallengeResultModal,
  GameEndModal,
  RoundStartOverlay,
  BetNotification,
} from '../components/ChallengeResultModal';
import type { GameStatus as GameStatusType } from '@pirate-dice/types';
import { GAME_CONFIG, CHAT_BUBBLE_DURATION } from '@pirate-dice/constants';

interface PlayerInfo {
  id: string;
  nickname: string;
  diceCount: number;
  order: number;
  isAlive: boolean;
  isReady: boolean;
}

interface CurrentBet {
  playerId: string;
  diceValue: number;
  diceCount: number;
}

// 백엔드에서 오는 원본 도전 결과
interface BackendChallengeResult {
  winner: 'bettor' | 'challenger';
  resultType: 'bettor_wins' | 'challenger_wins' | 'exact_match';
  challengerId: string;
  bettorId: string;
  loserPlayerIds: string[];
  diceToLose: number;
  actualCount: number;
  bettedCount: number;
  bettedValue: number;
  revealedDice: Record<string, number[]>;
}

// 프론트엔드 모달용 도전 결과
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

export function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const { playBgm, stopBgm, playSfx } = useAudioContext();

  // 기본 게임 상태
  const [gameStatus, setGameStatus] = useState<GameStatusType>('waiting');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [myDice, setMyDice] = useState<number[]>([]);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [currentBet, setCurrentBet] = useState<CurrentBet | null>(null);
  const [round, setRound] = useState(0);
  const [hostId, setHostId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 연출 관련 상태
  const [isRolling, setIsRolling] = useState(false);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);
  const [showRoundStart, setShowRoundStart] = useState(false);
  const [lastBet, setLastBet] = useState<{ nickname: string; diceValue: number; diceCount: number } | null>(null);
  const [gameWinner, setGameWinner] = useState<string | null>(null);

  // 채팅 메시지 상태 (playerId -> message)
  const [chatMessages, setChatMessages] = useState<Record<string, string>>({});

  // 도전 타임 상태
  const [challengePhase, setChallengePhase] = useState<{
    active: boolean;
    bettorId: string;
    bettorNickname: string;
    bet: { diceValue: number; diceCount: number };
    timeRemaining: number;
    passedPlayerIds: string[];
  } | null>(null);

  // 탈락 상태
  const [isEliminated, setIsEliminated] = useState(false);

  // 현재 라운드에서 묵시한 플레이어 (도전 불가)
  const [roundPassedPlayerIds, setRoundPassedPlayerIds] = useState<string[]>([]);

  // 도전 연출 중 대기할 데이터 (연출 완료 후 처리)
  const [pendingRoundData, setPendingRoundData] = useState<{
    round: number;
    yourDice: number[];
    isEliminated?: boolean;
  } | null>(null);
  const [pendingGameEnd, setPendingGameEnd] = useState<string | null>(null);

  const playerId = sessionStorage.getItem('playerId');
  const nickname = sessionStorage.getItem('nickname');

  // useRef로 최신 상태 참조 (이벤트 핸들러에서 사용)
  const playersRef = useRef<PlayerInfo[]>([]);
  const currentBetRef = useRef<CurrentBet | null>(null);
  const challengeResultRef = useRef<ChallengeResult | null>(null);
  const playSfxRef = useRef(playSfx);
  const playBgmRef = useRef(playBgm);
  const stopBgmRef = useRef(stopBgm);

  // ref 동기화
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    currentBetRef.current = currentBet;
  }, [currentBet]);

  useEffect(() => {
    challengeResultRef.current = challengeResult;
  }, [challengeResult]);

  useEffect(() => {
    playSfxRef.current = playSfx;
    playBgmRef.current = playBgm;
    stopBgmRef.current = stopBgm;
  }, [playSfx, playBgm, stopBgm]);

  // BGM 관리 - 게임 상태에 따라 변경
  useEffect(() => {
    if (gameStatus === 'waiting') {
      playBgm('LOBBY');
    } else if (gameStatus === 'playing') {
      playBgm('GAME');
    } else if (gameStatus === 'finished') {
      playBgm('VICTORY');
    }
    return () => {
      stopBgm();
    };
  }, [gameStatus, playBgm, stopBgm]);

  const isMyTurn = currentTurnPlayerId === playerId;
  const isFirstTurn = currentBet === null;
  const isHost = hostId === playerId;
  const canStart = players.length >= GAME_CONFIG.MIN_PLAYERS &&
                   players.every(p => p.isReady);

  // 도전 타임 중 도전/묵시 가능 여부
  const canChallengeOrPass = challengePhase?.active &&
    playerId &&
    challengePhase.bettorId !== playerId &&
    !challengePhase.passedPlayerIds.includes(playerId) &&
    !isEliminated;

  // 베팅 알림 자동 숨김
  useEffect(() => {
    if (lastBet) {
      const timer = setTimeout(() => setLastBet(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastBet]);

  // 도전 타임 카운트다운
  useEffect(() => {
    if (!challengePhase?.active || challengePhase.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setChallengePhase(prev => {
        if (!prev) return null;
        const newTime = prev.timeRemaining - 1000;
        // 3초 경고음
        if (newTime === 3000) {
          playSfxRef.current('TIMER_WARNING');
        }
        if (newTime <= 0) {
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challengePhase?.active]);

  // 도전 결과 모달 닫기 및 대기 데이터 처리
  const handleCloseChallengeResult = useCallback(() => {
    setChallengeResult(null);

    // 대기 중인 게임 종료 처리
    if (pendingGameEnd) {
      setGameWinner(pendingGameEnd);
      setPendingGameEnd(null);
      return;
    }

    // 대기 중인 라운드 데이터 처리
    if (pendingRoundData) {
      setRoundPassedPlayerIds([]); // 새 라운드 시작 시 묵시 목록 초기화
      if (pendingRoundData.isEliminated) {
        setIsEliminated(true);
        setMyDice([]);
      } else {
        playSfx('ROUND_START');
        setRound(pendingRoundData.round);
        setCurrentBet(null);
        setShowRoundStart(true);
        setIsRolling(true);

        setTimeout(() => {
          playSfx('DICE_ROLL');
          setMyDice(pendingRoundData.yourDice);
        }, 500);

        setTimeout(() => {
          setIsRolling(false);
        }, 2000);
      }
      setPendingRoundData(null);
    }
  }, [pendingGameEnd, pendingRoundData, playSfx]);

  // 게임 종료 모달 닫기 - 대기방으로 리셋
  const handleCloseGameEnd = useCallback(() => {
    if (!roomId) {
      navigate('/lobby');
      return;
    }

    // 서버에 게임 리셋 요청
    socket.emit('game:reset', { roomId }, (response: { success: boolean; error?: string }) => {
      if (!response?.success) {
        console.error('Game reset failed:', response?.error);
        navigate('/lobby');
      }
      // 성공 시 game:reset 이벤트로 상태 업데이트됨
    });

    setGameWinner(null);
  }, [roomId, socket, navigate]);

  // 라운드 시작 오버레이 완료
  const handleRoundStartComplete = useCallback(() => {
    setShowRoundStart(false);
  }, []);

  useEffect(() => {
    if (!playerId || !nickname || !roomId) {
      navigate('/');
      return;
    }

    // 방 참가 함수
    const joinRoom = () => {
      console.log('Emitting room:join, socket connected:', socket.connected);
      socket.emit('room:join', { roomId, playerId }, (response: {
        success: boolean;
        room?: {
          hostId: string;
          players: PlayerInfo[];
          status: GameStatusType;
        }
      }) => {
        console.log('room:join response:', response);
        if (response?.success && response.room) {
          console.log('Setting players:', response.room.players);
          setHostId(response.room.hostId);
          setPlayers(response.room.players);
          setGameStatus(response.room.status);

          const myPlayer = response.room.players.find(p => p.id === playerId);
          if (myPlayer) {
            setIsReady(myPlayer.isReady);
          }
        } else {
          console.error('room:join failed:', response);
        }
      });
    };

    // 소켓이 이미 연결되어 있으면 바로 방 참가, 아니면 연결 후 참가
    if (socket.connected) {
      joinRoom();
    } else {
      socket.once('connect', joinRoom);
    }

    // 방 동기화 이벤트 (콜백 응답 백업)
    socket.on('room:synced', (data: {
      hostId: string;
      status: GameStatusType;
      players: PlayerInfo[];
    }) => {
      console.log('room:synced received:', data);
      setHostId(data.hostId);
      setPlayers(data.players);
      setGameStatus(data.status);

      const myPlayer = data.players.find(p => p.id === playerId);
      if (myPlayer) {
        setIsReady(myPlayer.isReady);
      }
    });

    // 플레이어 입장
    socket.on('player:joined', (data: {
      playerId: string;
      nickname: string;
      playerCount: number;
      players?: PlayerInfo[];
    }) => {
      console.log('player:joined received:', data);
      playSfxRef.current('PLAYER_JOIN');
      if (data.players) {
        setPlayers(data.players);
      } else {
        setPlayers(prev => {
          if (prev.find(p => p.id === data.playerId)) return prev;
          return [...prev, {
            id: data.playerId,
            nickname: data.nickname,
            diceCount: 0,
            order: prev.length,
            isAlive: true,
            isReady: false,
          }];
        });
      }
    });

    // 플레이어 퇴장
    socket.on('player:left', (data: { playerId: string; playerCount: number }) => {
      playSfxRef.current('PLAYER_LEAVE');
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
    });

    // 플레이어 준비 상태 변경
    socket.on('player:ready', (data: { playerId: string; isReady: boolean }) => {
      setPlayers(prev => prev.map(p =>
        p.id === data.playerId ? { ...p, isReady: data.isReady } : p
      ));
    });

    // 게임 시작 가능 여부
    socket.on('game:canStart', () => {
      // canStart는 이제 로컬에서 계산하므로 이 이벤트는 무시해도 됨
    });

    socket.on('game:started', (data: {
      players: PlayerInfo[];
      firstPlayerId: string;
    }) => {
      playSfxRef.current('GAME_START');
      setGameStatus('playing');
      setPlayers(data.players.map(p => ({ ...p, isAlive: true, isReady: true })));
      setCurrentTurnPlayerId(data.firstPlayerId);
    });

    // 라운드 시작 - 주사위 굴리기 애니메이션
    socket.on('round:started', (data: { round: number; yourDice: number[]; isEliminated?: boolean }) => {
      // 이전 연출 상태 초기화
      setLastBet(null);
      setChallengePhase(null);
      setRoundPassedPlayerIds([]); // 새 라운드 시작 시 묵시 목록 초기화

      // 도전 연출 중이면 대기
      if (challengeResultRef.current) {
        setPendingRoundData(data);
        return;
      }

      // 탈락 여부 확인
      if (data.isEliminated) {
        setIsEliminated(true);
        setMyDice([]);
        return;
      }

      playSfxRef.current('ROUND_START');
      setRound(data.round);
      setCurrentBet(null);
      setShowRoundStart(true);
      setIsRolling(true);

      // 딜레이 후 주사위 설정 및 굴리기 애니메이션
      setTimeout(() => {
        playSfxRef.current('DICE_ROLL');
        setMyDice(data.yourDice);
      }, 500);

      // 굴리기 애니메이션 종료
      setTimeout(() => {
        setIsRolling(false);
      }, 2000);
    });

    // 턴 변경 - 베팅 알림 표시
    socket.on('turn:changed', (data: {
      currentPlayerId: string | null;
      currentBet: CurrentBet | null;
    }) => {
      // 내 턴이면 알림음
      if (data.currentPlayerId === playerId) {
        playSfxRef.current('MY_TURN');
      }

      setCurrentTurnPlayerId(data.currentPlayerId);

      // 새 베팅이 있으면 알림 표시
      if (data.currentBet && data.currentBet !== currentBetRef.current) {
        playSfxRef.current('BET_PLACE');
        const bettor = playersRef.current.find(p => p.id === data.currentBet?.playerId);
        if (bettor && data.currentBet.playerId !== playerId) {
          setLastBet({
            nickname: bettor.nickname,
            diceValue: data.currentBet.diceValue,
            diceCount: data.currentBet.diceCount,
          });
        }
      }

      setCurrentBet(data.currentBet);

      // 도전 타임 종료 시 상태 초기화
      if (data.currentPlayerId) {
        setChallengePhase(null);
      }
    });

    // 도전 타임 시작
    socket.on('challenge:phase:started', (data: {
      bettorId: string;
      bettorNickname: string;
      bet: { diceValue: number; diceCount: number };
      timeoutMs: number;
    }) => {
      playSfxRef.current('CHALLENGE_PHASE');
      setChallengePhase({
        active: true,
        bettorId: data.bettorId,
        bettorNickname: data.bettorNickname,
        bet: data.bet,
        timeRemaining: data.timeoutMs,
        passedPlayerIds: [],
      });
    });

    // 플레이어 패스
    socket.on('player:passed', (data: {
      playerId: string;
      nickname: string;
      passedPlayerIds: string[];
    }) => {
      playSfxRef.current('PASS');
      setChallengePhase(prev => {
        if (!prev) return null;
        return { ...prev, passedPlayerIds: data.passedPlayerIds };
      });
      // 라운드 묵시 목록에도 추가 (다음 턴에서 도전 불가)
      setRoundPassedPlayerIds(data.passedPlayerIds);
    });

    // 도전 타임 종료
    socket.on('challenge:phase:ended', () => {
      setChallengePhase(null);
    });

    // 도전 결과 - 모달 표시
    socket.on('challenge:result', (data: { result: BackendChallengeResult }) => {
      console.log('Challenge result:', data.result);
      playSfxRef.current('CHALLENGE');

      // 백엔드 결과를 프론트엔드 모달 형식으로 변환
      const backendResult = data.result;
      const currentPlayers = playersRef.current;

      // 도전자와 베팅자 정보 찾기 (백엔드에서 전달받은 ID 사용)
      const challengerPlayer = currentPlayers.find(p => p.id === backendResult.challengerId);
      const bettorPlayer = currentPlayers.find(p => p.id === backendResult.bettorId);

      // allDice 배열 생성
      const allDice = Object.entries(backendResult.revealedDice).map(([id, dice]) => {
        const player = currentPlayers.find(p => p.id === id);
        return {
          playerId: id,
          nickname: player?.nickname ?? 'Unknown',
          dice,
        };
      });

      const transformedResult: ChallengeResult = {
        challengerId: backendResult.challengerId,
        challengerNickname: challengerPlayer?.nickname ?? 'Unknown',
        targetId: backendResult.bettorId,
        targetNickname: bettorPlayer?.nickname ?? 'Unknown',
        bet: {
          diceValue: backendResult.bettedValue,
          diceCount: backendResult.bettedCount,
        },
        actualCount: backendResult.actualCount,
        challengerWins: backendResult.winner === 'challenger',
        loserPlayerIds: backendResult.loserPlayerIds,
        allDice,
      };

      // 결과 사운드 (연출 후 재생 - 약간의 딜레이)
      setTimeout(() => {
        if (backendResult.winner === 'challenger') {
          playSfxRef.current('CHALLENGE_WIN');
        } else {
          playSfxRef.current('CHALLENGE_LOSE');
        }
      }, 2000);

      setChallengeResult(transformedResult);
    });

    socket.on('player:eliminated', (data: { playerId: string }) => {
      playSfxRef.current('PLAYER_ELIMINATED');
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === data.playerId ? { ...p, isAlive: false } : p
        )
      );
    });

    // 게임 종료 - 도전 연출 중이면 대기
    socket.on('game:ended', (data: { winnerNickname: string }) => {
      setGameStatus('finished');

      // 도전 연출 중이면 대기
      if (challengeResultRef.current) {
        setPendingGameEnd(data.winnerNickname);
        return;
      }

      setGameWinner(data.winnerNickname);
    });

    // 게임 리셋 - 대기방으로 복귀
    socket.on('game:reset', (data: {
      players: PlayerInfo[];
      hostId: string;
    }) => {
      setGameStatus('waiting');
      setPlayers(data.players);
      setHostId(data.hostId);
      setIsReady(false);
      setMyDice([]);
      setCurrentBet(null);
      setCurrentTurnPlayerId(null);
      setRound(0);
      setChallengeResult(null);
      setChallengePhase(null);
      setIsEliminated(false);
      setPendingRoundData(null);
      setPendingGameEnd(null);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data);
      alert(data.message);
    });

    // 채팅 메시지 수신
    socket.on('chat:message', (data: { playerId: string; message: string }) => {
      // 다른 사람의 채팅만 효과음
      if (data.playerId !== playerId) {
        playSfxRef.current('CHAT_MESSAGE');
      }
      setChatMessages(prev => ({ ...prev, [data.playerId]: data.message }));

      // 일정 시간 후 메시지 제거
      setTimeout(() => {
        setChatMessages(prev => {
          const newMessages = { ...prev };
          if (newMessages[data.playerId] === data.message) {
            delete newMessages[data.playerId];
          }
          return newMessages;
        });
      }, CHAT_BUBBLE_DURATION);
    });

    return () => {
      socket.off('connect', joinRoom);
      socket.off('room:synced');
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('player:ready');
      socket.off('game:canStart');
      socket.off('game:started');
      socket.off('round:started');
      socket.off('turn:changed');
      socket.off('challenge:phase:started');
      socket.off('player:passed');
      socket.off('challenge:phase:ended');
      socket.off('challenge:result');
      socket.off('player:eliminated');
      socket.off('game:ended');
      socket.off('game:reset');
      socket.off('error');
      socket.off('chat:message');
    };
  }, [socket, roomId, playerId, nickname, navigate]);

  const handleReady = () => {
    if (!roomId) return;
    playSfx('BUTTON_CLICK');
    console.log('Sending game:ready event:', { roomId });
    socket.emit('game:ready', { roomId }, (response: { success: boolean; isReady?: boolean; error?: string }) => {
      console.log('game:ready response:', response);
      if (response?.success && response.isReady !== undefined) {
        setIsReady(response.isReady);
      } else if (!response?.success) {
        console.error('Failed to set ready state:', response?.error);
        alert(`준비 상태 변경 실패: ${response?.error || '알 수 없는 오류'}`);
      }
    });
  };

  const handleStartGame = () => {
    if (!roomId) return;
    playSfx('BUTTON_CLICK');
    socket.emit('game:start', { roomId }, (response: { success: boolean }) => {
      if (!response?.success) {
        console.error('Failed to start game');
      }
    });
  };

  const handleBet = (diceValue: number, diceCount: number) => {
    if (!roomId) return;
    playSfx('BUTTON_CLICK');
    socket.emit('game:bet', { roomId, diceValue, diceCount });
  };

  const handleChallenge = () => {
    if (!roomId) return;
    playSfx('BUTTON_CLICK');
    socket.emit('game:challenge', { roomId });
  };

  const handlePass = () => {
    if (!roomId) return;
    playSfx('BUTTON_CLICK');
    socket.emit('game:pass', { roomId });
  };

  const handleLeave = () => {
    if (!roomId) return;
    playSfx('BUTTON_CLICK');
    socket.emit('room:leave', { roomId }, (response: { success: boolean; error?: string }) => {
      if (response?.success) {
        navigate('/lobby');
      } else {
        console.error('Failed to leave room:', response?.error);
        if (response?.error === 'GAME_IN_PROGRESS') {
          alert('게임 중에는 방을 나갈 수 없습니다.');
        } else {
          alert('방 나가기 실패');
        }
      }
    });
  };

  const handleSendChat = (message: string) => {
    if (!roomId) return;
    socket.emit('chat:send', { roomId, message });
  };

  const handleRunaway = () => {
    if (!roomId) return;
    playSfx('BUTTON_CLICK');
    if (!confirm('정말 도망치시겠습니까? 게임에서 탈락하고 로비로 이동합니다.')) {
      return;
    }
    socket.emit('game:runaway', { roomId }, (response: { success: boolean; error?: string }) => {
      if (response?.success) {
        navigate('/lobby');
      } else {
        console.error('Failed to run away:', response?.error);
        alert('도망치기 실패: ' + (response?.error || '알 수 없는 오류'));
      }
    });
  };

  return (
    <div className="min-h-screen min-h-dvh p-2 sm:p-4 flex flex-col safe-area-inset">
      {/* 헤더 */}
      <header className="text-center mb-2 sm:mb-4 flex-shrink-0 relative">
        {/* 좌측: 도망치기 버튼 (게임 중에만) */}
        {gameStatus === 'playing' && (
          <button
            onClick={handleRunaway}
            className="absolute top-0 left-0 btn-wood px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm"
            title="게임에서 탈락하고 로비로 이동"
          >
            🏃 도망
          </button>
        )}
        <h1 className="title-pirate">🏴‍☠️ Pirate Dice</h1>
        <p className="text-muted text-xs sm:text-sm mt-1 sm:mt-2">
          {gameStatus === 'waiting'
            ? '선원들을 모으는 중...'
            : `⚓ 라운드 ${round}`}
        </p>
        {/* 오디오 컨트롤 - 우측 상단 */}
        <div className="absolute top-0 right-0">
          <AudioControl />
        </div>
      </header>

      {/* 게임 영역 */}
      <main className="flex-1 flex flex-col items-center justify-start sm:justify-center overflow-y-auto">
        {gameStatus === 'waiting' ? (
          <WaitingRoom
            roomId={roomId ?? ''}
            players={players}
            currentPlayerId={playerId ?? ''}
            isHost={isHost}
            isReady={isReady}
            canStart={canStart}
            onReady={handleReady}
            onLeave={handleLeave}
            onStartGame={handleStartGame}
          />
        ) : (
          <div className="w-full max-w-4xl px-2">
            {/* 다른 플레이어들 */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-8">
              {players
                .filter((p) => p.id !== playerId)
                .map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isCurrentTurn={currentTurnPlayerId === player.id}
                    chatMessage={chatMessages[player.id]}
                  />
                ))}
            </div>

            {/* 중앙 베팅 현황 */}
            <GameStatus currentBet={currentBet} players={players} />

            {/* 내 주사위 */}
            <div className="mt-4 sm:mt-8 relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-treasure text-sm sm:text-base">
                  {isEliminated ? '💀 탈락' : '🎲 내 주사위'}
                </h3>
                <ChatButton onSendMessage={handleSendChat} />
              </div>
              {/* 내 말풍선 - 오른편에 위치 */}
              {playerId && chatMessages[playerId] && (
                <div className="absolute top-1/2 -translate-y-1/2 right-0 sm:right-4 z-30 animate-bounce-in">
                  <div className="bg-parchment text-wood-dark px-3 py-2 rounded-lg shadow-lg
                                text-xs sm:text-sm font-medium whitespace-nowrap max-w-32 sm:max-w-48 truncate">
                    {chatMessages[playerId]}
                  </div>
                </div>
              )}
              {isEliminated ? (
                <div className="text-center py-8">
                  <p className="text-danger text-lg font-bold mb-2">모든 주사위를 잃었습니다</p>
                  <p className="text-muted text-sm">게임이 끝날 때까지 관전 중입니다...</p>
                </div>
              ) : (
                <DiceDisplay dice={myDice} isRolling={isRolling} />
              )}
            </div>

            {/* 도전 타임 패널 */}
            {challengePhase?.active && !isRolling && (
              <div className="mt-4 animate-slide-up">
                <div className="panel-wood p-4">
                  {/* 타이머 */}
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-treasure">
                      ⏱️ {Math.ceil(challengePhase.timeRemaining / 1000)}초
                    </div>
                    <p className="text-cream text-sm mt-1">
                      <span className="text-treasure">{challengePhase.bettorNickname}</span>의 베팅:
                      <span className="font-bold ml-1">
                        "{challengePhase.bet.diceValue}이(가) {challengePhase.bet.diceCount}개 이상"
                      </span>
                    </p>
                  </div>

                  {/* 도전/묵시 버튼 */}
                  {canChallengeOrPass ? (
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleChallenge}
                        className="btn-danger px-6 py-3 text-lg font-bold"
                      >
                        ⚔️ 도전!
                      </button>
                      <button
                        onClick={handlePass}
                        className="btn-wood px-6 py-3 text-lg"
                      >
                        🤐 묵시
                      </button>
                    </div>
                  ) : challengePhase.bettorId === playerId ? (
                    <p className="text-center text-muted">
                      다른 플레이어들의 결정을 기다리는 중...
                    </p>
                  ) : challengePhase.passedPlayerIds.includes(playerId ?? '') ? (
                    <p className="text-center text-muted">
                      ✓ 묵시했습니다
                    </p>
                  ) : isEliminated ? (
                    <p className="text-center text-muted">
                      관전 중...
                    </p>
                  ) : null}

                  {/* 묵시한 플레이어 표시 */}
                  {challengePhase.passedPlayerIds.length > 0 && (
                    <div className="mt-3 text-center text-muted text-sm">
                      묵시: {challengePhase.passedPlayerIds.map(id => {
                        const p = players.find(pl => pl.id === id);
                        return p?.nickname ?? 'Unknown';
                      }).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 베팅 패널 - 도전 타임이 아닐 때만 */}
            {isMyTurn && !isRolling && !challengePhase?.active && !isEliminated && (
              <div className="animate-slide-up w-full">
                <BettingPanel
                  currentBet={currentBet}
                  onBet={handleBet}
                  onChallenge={handleChallenge}
                  canChallenge={!isFirstTurn && !roundPassedPlayerIds.includes(playerId ?? '')}
                />
              </div>
            )}

            {/* 대기 중 표시 - 도전 타임이 아닐 때만 */}
            {!isMyTurn && !isRolling && !challengePhase?.active && !isEliminated && (
              <div className="mt-4 sm:mt-6 text-center text-muted">
                <p className="animate-pulse text-sm sm:text-base">
                  ⏳ {players.find(p => p.id === currentTurnPlayerId)?.nickname}의 차례입니다...
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 라운드 시작 오버레이 */}
      {showRoundStart && (
        <RoundStartOverlay round={round} onComplete={handleRoundStartComplete} />
      )}

      {/* 베팅 알림 */}
      {lastBet && (
        <BetNotification
          playerNickname={lastBet.nickname}
          diceValue={lastBet.diceValue}
          diceCount={lastBet.diceCount}
        />
      )}

      {/* 도전 결과 모달 */}
      <ChallengeResultModal
        result={challengeResult}
        onClose={handleCloseChallengeResult}
      />

      {/* 게임 종료 모달 */}
      {gameWinner && (
        <GameEndModal
          winnerNickname={gameWinner}
          onClose={handleCloseGameEnd}
        />
      )}
    </div>
  );
}
