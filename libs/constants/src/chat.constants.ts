/**
 * 채팅 상수 정의
 * 빠른 채팅 카테고리 및 템플릿 메시지
 */

/** 채팅 카테고리 타입 */
export type ChatCategory = 'provoke' | 'threat' | 'bluff' | 'emotion' | 'greeting';

/** 채팅 카테고리 정보 */
export interface ChatCategoryInfo {
  id: ChatCategory;
  name: string;
  icon: string;
}

/** 채팅 템플릿 */
export interface ChatTemplate {
  id: string;
  category: ChatCategory;
  message: string;
}

/** 채팅 카테고리 목록 */
export const CHAT_CATEGORIES: ChatCategoryInfo[] = [
  { id: 'provoke', name: '도발', icon: '😏' },
  { id: 'threat', name: '위협', icon: '💀' },
  { id: 'bluff', name: '허세', icon: '🎭' },
  { id: 'emotion', name: '감정', icon: '😤' },
  { id: 'greeting', name: '인사', icon: '👋' },
];

/** 카테고리별 채팅 템플릿 */
export const CHAT_TEMPLATES: ChatTemplate[] = [
  // 도발
  { id: 'provoke_1', category: 'provoke', message: '감히 내게 도전하려고?' },
  { id: 'provoke_2', category: 'provoke', message: '그게 최선이야?' },
  { id: 'provoke_3', category: 'provoke', message: '어디 한번 해보시지!' },
  { id: 'provoke_4', category: 'provoke', message: '겁쟁이 같으니!' },

  // 위협
  { id: 'threat_1', category: 'threat', message: '주사위를 전부 잃게 될 거야...' },
  { id: 'threat_2', category: 'threat', message: '널 바다에 던져버리겠어!' },
  { id: 'threat_3', category: 'threat', message: '후회하게 될 거다!' },
  { id: 'threat_4', category: 'threat', message: '이번 판은 내 거야!' },

  // 허세
  { id: 'bluff_1', category: 'bluff', message: '내 패가 완벽해!' },
  { id: 'bluff_2', category: 'bluff', message: '도전 못 하겠지?' },
  { id: 'bluff_3', category: 'bluff', message: '난 거짓말을 안 해.' },
  { id: 'bluff_4', category: 'bluff', message: '100% 확신해!' },

  // 감정
  { id: 'emotion_1', category: 'emotion', message: '제길!' },
  { id: 'emotion_2', category: 'emotion', message: '운이 좋았어...' },
  { id: 'emotion_3', category: 'emotion', message: '믿을 수가 없어!' },
  { id: 'emotion_4', category: 'emotion', message: '좋았어!' },

  // 인사
  { id: 'greeting_1', category: 'greeting', message: '요호호!' },
  { id: 'greeting_2', category: 'greeting', message: '행운을 빌어!' },
  { id: 'greeting_3', category: 'greeting', message: '좋은 게임이었어!' },
  { id: 'greeting_4', category: 'greeting', message: '다음엔 내가 이길 거야!' },
];

/** 카테고리별 템플릿 가져오기 */
export function getTemplatesByCategory(category: ChatCategory): ChatTemplate[] {
  return CHAT_TEMPLATES.filter(t => t.category === category);
}

/** 말풍선 표시 시간 (ms) */
export const CHAT_BUBBLE_DURATION = 4000;
