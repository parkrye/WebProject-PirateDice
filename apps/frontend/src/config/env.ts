/**
 * 환경 설정
 * Vite는 import.meta.env를 사용하여 환경변수에 접근
 */

export const ENV = {
  // 백엔드 API URL (프로덕션에서는 배포된 백엔드 URL 사용)
  API_URL: import.meta.env.VITE_API_URL || '',

  // Socket.io URL (API URL과 동일하게 사용)
  SOCKET_URL: import.meta.env.VITE_API_URL || '',

  // 개발 모드 여부
  IS_DEV: import.meta.env.DEV,
} as const;
