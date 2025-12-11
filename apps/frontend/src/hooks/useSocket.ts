/**
 * Socket.io 연결 훅
 */

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket(): Socket | null {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io({
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });
    }

    return () => {
      // 컴포넌트 언마운트 시 연결 유지 (다른 페이지에서도 사용)
    };
  }, []);

  return socket;
}

/**
 * 소켓 연결 해제
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
