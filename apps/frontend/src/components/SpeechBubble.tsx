/**
 * 말풍선 컴포넌트
 * 플레이어의 채팅 메시지를 말풍선으로 표시
 */

interface SpeechBubbleProps {
  message: string;
  position?: 'top' | 'bottom';
}

export function SpeechBubble({ message, position = 'top' }: SpeechBubbleProps) {
  const positionClasses = position === 'top'
    ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
    : 'top-full mt-2 left-1/2 -translate-x-1/2';

  const tailClasses = position === 'top'
    ? 'top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-parchment'
    : 'bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-parchment';

  return (
    <div
      className={`absolute ${positionClasses} z-30 animate-bounce-in`}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        {/* 말풍선 본체 */}
        <div className="bg-parchment text-wood-dark px-3 py-2 rounded-lg shadow-lg
                      text-xs sm:text-sm font-medium whitespace-nowrap max-w-[180px] sm:max-w-[220px] truncate">
          {message}
        </div>
        {/* 말풍선 꼬리 */}
        <div className={`absolute w-0 h-0 ${tailClasses}`} />
      </div>
    </div>
  );
}
