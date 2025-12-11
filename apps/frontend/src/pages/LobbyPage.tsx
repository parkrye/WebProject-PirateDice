/**
 * 로비 페이지 - 게임방 목록 및 생성
 * 테마: 해적 선술집
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PublicGameRoomInfo } from '@pirate-dice/entities';

export function LobbyPage() {
  const [rooms, setRooms] = useState<PublicGameRoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const nickname = sessionStorage.getItem('nickname');

  useEffect(() => {
    if (!nickname) {
      navigate('/');
      return;
    }

    fetchRooms();
  }, [nickname, navigate]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    try {
      const playerId = crypto.randomUUID();
      sessionStorage.setItem('playerId', playerId);

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: playerId,
          hostNickname: nickname,
        }),
      });

      const data = await response.json();
      navigate(`/game/${data.roomId}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('방 생성에 실패했습니다.');
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const playerId = crypto.randomUUID();
      sessionStorage.setItem('playerId', playerId);

      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          nickname,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message);
        return;
      }

      navigate(`/game/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('방 참가에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="title-pirate text-3xl md:text-4xl flex items-center gap-2 justify-center md:justify-start">
              <span>🏴‍☠️</span> 해적 선술집
            </h1>
            <p className="text-muted mt-1">
              어서오게, <span className="text-treasure">{nickname}</span> 선장!
            </p>
          </div>
          <button onClick={createRoom} className="btn-treasure flex items-center gap-2">
            <span>⚓</span> 배 띄우기
          </button>
        </div>

        {/* 게임방 목록 */}
        <div className="panel-wood">
          <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-wood-accent">
            <h2 className="text-xl text-treasure-glow flex items-center gap-2">
              <span>🗺️</span> 모험 목록
            </h2>
            <button
              onClick={fetchRooms}
              className="btn-wood text-sm flex items-center gap-1"
            >
              <span>🔄</span> 새로고침
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted">
              <div className="text-4xl animate-wave mb-2">⚓</div>
              <p>항해 중...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4 opacity-50">🏝️</div>
              <p className="text-cream">아직 출항한 배가 없습니다.</p>
              <p className="text-muted text-sm mt-2">
                새로운 모험을 시작해보세요!
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="flex justify-between items-center p-4
                             bg-ocean-deep/50 rounded-lg border border-wood-accent/50
                             hover:border-treasure/50 hover:bg-ocean-mid/50
                             transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏴‍☠️</span>
                    <div>
                      <p className="text-cream font-medium">
                        {room.hostNickname} 선장의 배
                      </p>
                      <p className="text-muted text-sm flex items-center gap-2">
                        <span>👥 {room.playerCount}/{room.maxPlayers}명</span>
                        <span className="text-treasure">💰</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => joinRoom(room.id)}
                    className="btn-wood flex items-center gap-1"
                  >
                    <span>⛵</span> 승선
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 하단 장식 */}
        <div className="flex justify-center gap-6 mt-8 text-3xl opacity-40">
          <span>⚓</span>
          <span>🧭</span>
          <span>🗡️</span>
        </div>
      </div>
    </div>
  );
}
