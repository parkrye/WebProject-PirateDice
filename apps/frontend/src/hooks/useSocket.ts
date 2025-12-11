/**
 * Socket.io 연결 훅
 */

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';

let socket: Socket | null = null;

export function useSocket(): Socket | null {
  useEffect(() => {
    if (!socket) {
      socket = io(ENV.SOCKET_URL || window.location.origin, {
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
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
