/**
 * Socket.io 연결 훅
 */

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';

let socketInstance: Socket | null = null;

/**
 * 소켓 인스턴스 가져오기 (없으면 생성)
 */
function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(ENV.SOCKET_URL || window.location.origin, {
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  return socketInstance;
}

export function useSocket(): Socket {
  const [socket] = useState<Socket>(() => getSocket());

  useEffect(() => {
    // 연결되지 않았으면 연결
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // 컴포넌트 언마운트 시 연결 유지 (다른 페이지에서도 사용)
    };
  }, [socket]);

  return socket;
}

/**
 * 소켓 연결 해제
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
