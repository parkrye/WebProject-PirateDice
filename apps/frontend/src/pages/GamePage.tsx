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
import type { GameStatus as GameStatusType } from '@pirate-dice/types';

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
  const [isHost, setIsHost] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const playerId = sessionStorage.getItem('playerId');
  const nickname = sessionStorage.getItem('nickname');

  const isMyTurn = currentTurnPlayerId === playerId;
  const isFirstTurn = currentBet === null;

  useEffect(() => {
    if (!playerId || !nickname || !roomId) {
      navigate('/');
      return;
    }

    if (!socket) return;

    // 방 참가
    socket.emit('room:join', { roomId, playerId });

    // 이벤트 리스너 설정
    socket.on('player:joined', (data) => {
      console.log('Player joined:', data);
    });

    socket.on('game:canStart', (data) => {
      setCanStart(data.canStart);
    });

    socket.on('game:started', (data) => {
      setGameStatus('playing');
      setPlayers(data.players);
      setCurrentTurnPlayerId(data.firstPlayerId);
      setIsHost(data.players.find((p: PlayerInfo) => p.order === 0)?.id === playerId);
    });

    socket.on('round:started', (data) => {
      setRound(data.round);
      setMyDice(data.yourDice);
      setCurrentBet(null);
    });

    socket.on('turn:changed', (data) => {
      setCurrentTurnPlayerId(data.currentPlayerId);
      setCurrentBet(data.currentBet);
    });

    socket.on('challenge:result', (data) => {
      console.log('Challenge result:', data.result);
      // TODO: 결과 표시 모달
    });

    socket.on('player:eliminated', (data) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === data.playerId ? { ...p, isAlive: false } : p
        )
      );
    });

    socket.on('game:ended', (data) => {
      setGameStatus('finished');
      alert(`${data.winnerNickname}님이 승리했습니다!`);
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      alert(data.message);
    });

    return () => {
      socket.off('player:joined');
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
        <h1 className="text-2xl font-bold text-gold">Pirate Dice</h1>
        <p className="text-gray-400">
          {gameStatus === 'waiting'
            ? '플레이어를 기다리는 중...'
            : `라운드 ${round}`}
        </p>
      </header>

      {/* 게임 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {gameStatus === 'waiting' ? (
          <div className="text-center">
            <p className="text-gray-100 mb-4">
              방 코드: <span className="text-gold font-bold">{roomId}</span>
            </p>

            {!isReady ? (
              <button onClick={handleReady} className="btn-primary mb-4">
                준비 완료
              </button>
            ) : (
              <p className="text-green-500 mb-4">준비 완료!</p>
            )}

            {isHost && canStart && (
              <button onClick={handleStartGame} className="btn-primary">
                게임 시작
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 다른 플레이어들 */}
            <div className="flex gap-4 mb-8">
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
          </>
        )}
      </main>
    </div>
  );
}
