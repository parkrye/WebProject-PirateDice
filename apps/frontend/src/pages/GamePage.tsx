/**
 * 게임 페이지 - 메인 게임 화면
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { PlayerCard } from '../components/PlayerCard';
import { DiceDisplay } from '../components/DiceDisplay';
import { BettingPanel } from '../components/BettingPanel';
import { GameStatus } from '../components/GameStatus';
import { WaitingRoom } from '../components/WaitingRoom';
import type { GameStatus as GameStatusType } from '@pirate-dice/types';
import { GAME_CONFIG } from '@pirate-dice/constants';

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

export function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();

  const [gameStatus, setGameStatus] = useState<GameStatusType>('waiting');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [myDice, setMyDice] = useState<number[]>([]);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [currentBet, setCurrentBet] = useState<CurrentBet | null>(null);
  const [round, setRound] = useState(0);
  const [hostId, setHostId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const playerId = sessionStorage.getItem('playerId');
  const nickname = sessionStorage.getItem('nickname');

  const isMyTurn = currentTurnPlayerId === playerId;
  const isFirstTurn = currentBet === null;
  const isHost = hostId === playerId;
  const canStart = players.length >= GAME_CONFIG.MIN_PLAYERS &&
                   players.every(p => p.isReady);

  useEffect(() => {
    if (!playerId || !nickname || !roomId) {
      navigate('/');
      return;
    }

    if (!socket) return;

    // 방 참가 및 초기 데이터 수신
    socket.emit('room:join', { roomId, playerId }, (response: {
      success: boolean;
      room?: {
        hostId: string;
        players: PlayerInfo[];
        status: GameStatusType;
      }
    }) => {
      if (response?.success && response.room) {
        setHostId(response.room.hostId);
        setPlayers(response.room.players);
        setGameStatus(response.room.status);

        const myPlayer = response.room.players.find(p => p.id === playerId);
        if (myPlayer) {
          setIsReady(myPlayer.isReady);
        }
      }
    });

    // 플레이어 입장
    socket.on('player:joined', (data: {
      playerId: string;
      nickname: string;
      playerCount: number;
      players?: PlayerInfo[];
    }) => {
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
      setGameStatus('playing');
      setPlayers(data.players.map(p => ({ ...p, isAlive: true, isReady: true })));
      setCurrentTurnPlayerId(data.firstPlayerId);
    });

    socket.on('round:started', (data: { round: number; yourDice: number[] }) => {
      setRound(data.round);
      setMyDice(data.yourDice);
      setCurrentBet(null);
    });

    socket.on('turn:changed', (data: {
      currentPlayerId: string;
      currentBet: CurrentBet | null
    }) => {
      setCurrentTurnPlayerId(data.currentPlayerId);
      setCurrentBet(data.currentBet);
    });

    socket.on('challenge:result', (data: { result: unknown }) => {
      console.log('Challenge result:', data.result);
    });

    socket.on('player:eliminated', (data: { playerId: string }) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === data.playerId ? { ...p, isAlive: false } : p
        )
      );
    });

    socket.on('game:ended', (data: { winnerNickname: string }) => {
      setGameStatus('finished');
      alert(`${data.winnerNickname}님이 승리했습니다!`);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data);
      alert(data.message);
    });

    return () => {
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('player:ready');
      socket.off('game:canStart');
      socket.off('game:started');
      socket.off('round:started');
      socket.off('turn:changed');
      socket.off('challenge:result');
      socket.off('player:eliminated');
      socket.off('game:ended');
      socket.off('error');
    };
  }, [socket, roomId, playerId, nickname, navigate]);

  const handleReady = () => {
    if (!socket || !roomId) return;
    socket.emit('game:ready', { roomId });
    setIsReady(true);
  };

  const handleStartGame = () => {
    if (!socket || !roomId) return;
    socket.emit('game:start', { roomId });
  };

  const handleBet = (diceValue: number, diceCount: number) => {
    if (!socket || !roomId) return;
    socket.emit('game:bet', { roomId, diceValue, diceCount });
  };

  const handleChallenge = () => {
    if (!socket || !roomId) return;
    socket.emit('game:challenge', { roomId });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {/* 헤더 */}
      <header className="text-center mb-4">
        <h1 className="title-pirate">🏴‍☠️ Pirate Dice</h1>
        <p className="text-muted mt-2">
          {gameStatus === 'waiting'
            ? '선원들을 모으는 중...'
            : `⚓ 라운드 ${round}`}
        </p>
      </header>

      {/* 게임 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {gameStatus === 'waiting' ? (
          <WaitingRoom
            roomId={roomId ?? ''}
            players={players}
            currentPlayerId={playerId ?? ''}
            isHost={isHost}
            isReady={isReady}
            canStart={canStart}
            onReady={handleReady}
            onStartGame={handleStartGame}
          />
        ) : (
          <>
            {/* 다른 플레이어들 */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {players
                .filter((p) => p.id !== playerId)
                .map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isCurrentTurn={currentTurnPlayerId === player.id}
                  />
                ))}
            </div>

            {/* 중앙 베팅 현황 */}
            <GameStatus currentBet={currentBet} players={players} />

            {/* 내 주사위 */}
            <div className="mt-8">
              <h3 className="text-treasure text-center mb-2">🎲 내 주사위</h3>
              <DiceDisplay dice={myDice} />
            </div>

            {/* 베팅 패널 */}
            {isMyTurn && (
              <BettingPanel
                currentBet={currentBet}
                onBet={handleBet}
                onChallenge={handleChallenge}
                canChallenge={!isFirstTurn}
              />
            )}

            {/* 대기 중 표시 */}
            {!isMyTurn && (
              <div className="mt-6 text-center text-muted">
                <p className="animate-pulse">
                  ⏳ {players.find(p => p.id === currentTurnPlayerId)?.nickname}의 차례입니다...
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
