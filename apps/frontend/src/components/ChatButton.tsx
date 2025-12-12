/**
 * 채팅 버튼 컴포넌트
 * 카테고리 선택 -> 템플릿 선택 -> 메시지 전송
 */

import { useState } from 'react';
import {
  CHAT_CATEGORIES,
  getTemplatesByCategory,
  type ChatCategory,
  type ChatTemplate,
} from '@pirate-dice/constants';

interface ChatButtonProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

type MenuState = 'closed' | 'categories' | 'templates';

export function ChatButton({ onSendMessage, disabled = false }: ChatButtonProps) {
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory | null>(null);

  const handleChatButtonClick = () => {
    if (menuState === 'closed') {
      setMenuState('categories');
    } else {
      setMenuState('closed');
      setSelectedCategory(null);
    }
  };

  const handleCategorySelect = (category: ChatCategory) => {
    setSelectedCategory(category);
    setMenuState('templates');
  };

  const handleTemplateSelect = (template: ChatTemplate) => {
    onSendMessage(template.message);
    setMenuState('closed');
    setSelectedCategory(null);
  };

  const handleBack = () => {
    setMenuState('categories');
    setSelectedCategory(null);
  };

  const handleCancel = () => {
    setMenuState('closed');
    setSelectedCategory(null);
  };

  const templates = selectedCategory ? getTemplatesByCategory(selectedCategory) : [];
  const selectedCategoryInfo = CHAT_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="relative">
      {/* 채팅 버튼 */}
      <button
        onClick={handleChatButtonClick}
        disabled={disabled}
        className={`btn-wood flex items-center gap-1 text-xs sm:text-sm ${
          menuState !== 'closed' ? 'ring-2 ring-treasure' : ''
        }`}
        aria-label="채팅"
      >
        <span>💬</span>
        <span className="hidden sm:inline">채팅</span>
      </button>

      {/* 카테고리 메뉴 */}
      {menuState === 'categories' && (
        <div className="absolute bottom-full left-0 mb-2 w-36 sm:w-40 bg-wood-dark border-2 border-wood-accent rounded-lg shadow-panel overflow-hidden z-50 animate-slide-up">
          <div className="p-1.5 sm:p-2 border-b border-wood-accent bg-wood-light/50">
            <span className="text-treasure text-xs sm:text-sm font-bold">카테고리 선택</span>
          </div>
          <div className="p-1 sm:p-1.5">
            {CHAT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-cream text-xs sm:text-sm
                         hover:bg-wood-light/50 active:bg-wood-light rounded transition-colors
                         flex items-center gap-2"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
            <button
              onClick={handleCancel}
              className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-muted text-xs sm:text-sm
                       hover:bg-danger/20 active:bg-danger/30 rounded transition-colors
                       flex items-center gap-2 mt-1 border-t border-wood-accent/50 pt-1.5 sm:pt-2"
            >
              <span>❌</span>
              <span>취소</span>
            </button>
          </div>
        </div>
      )}

      {/* 템플릿 메뉴 */}
      {menuState === 'templates' && selectedCategoryInfo && (
        <div className="absolute bottom-full left-0 mb-2 w-48 sm:w-56 bg-wood-dark border-2 border-wood-accent rounded-lg shadow-panel overflow-hidden z-50 animate-slide-up">
          <div className="p-1.5 sm:p-2 border-b border-wood-accent bg-wood-light/50 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-muted hover:text-cream transition-colors p-1"
              aria-label="뒤로"
            >
              ←
            </button>
            <span className="text-treasure text-xs sm:text-sm font-bold flex items-center gap-1">
              <span>{selectedCategoryInfo.icon}</span>
              <span>{selectedCategoryInfo.name}</span>
            </span>
            <div className="w-6" /> {/* 균형용 빈 공간 */}
          </div>
          <div className="p-1 sm:p-1.5 max-h-48 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="w-full text-left px-2 sm:px-3 py-2 sm:py-2.5 text-cream text-xs sm:text-sm
                         hover:bg-wood-light/50 active:bg-wood-light rounded transition-colors"
              >
                "{template.message}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 오버레이 (메뉴 열린 상태에서 바깥 클릭 시 닫기) */}
      {menuState !== 'closed' && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleCancel}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
