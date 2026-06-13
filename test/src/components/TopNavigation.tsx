import { ChevronLeft, MoreHorizontal } from 'lucide-react';

export interface TopNavigationProps {
  className?: string;
  title: string;
  timerText?: string;
}

/**
 * TopNavigation - 상단 네비게이션 바
 */
export function TopNavigation({ className, title, timerText = '남은 시간 70 시간 32 분' }: TopNavigationProps) {
  return (
    <div className={`flex flex-col w-full ${className || ''}`}>
      {/* Navigation Bar */}
      <div className="flex items-start justify-center pt-[16px] px-[16px]">
        <div className="flex flex-1 gap-[16px] items-center justify-center">
          {/* Title */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-1 items-center justify-center px-[4px]">
              <div
                className="flex flex-col justify-center leading-[0] not-italic overflow-hidden text-[17px] text-black text-center text-ellipsis whitespace-nowrap"
                style={{
                  fontFamily: "'Pretendard_JP:SemiBold',sans-serif",
                  fontFeatureSettings: "'ss10'",
                  lineHeight: '1.412',
                }}
              >
                <p className="leading-[1.412] overflow-hidden">{title}</p>
              </div>
            </div>
          </div>
          
          {/* Back Button */}
          <div className="-translate-y-1/2 flex gap-[16px] items-center">
            <button className="flex flex-col items-center justify-center" aria-label="Back">
              <div className="flex flex-1 flex-col items-center justify-center">
                <ChevronLeft className="w-6 h-6 text-black" />
              </div>
              <div className="absolute inset-[-8px]">
                <div className="absolute inset-0 opacity-0 rounded-[1000px] bg-black" />
              </div>
            </button>
          </div>
          
          {/* Menu Button */}
          <div className="-translate-y-1/2 flex items-center justify-end">
            <button className="flex flex-col items-center justify-center" aria-label="More options">
              <div className="flex flex-1 flex-col items-center justify-center">
                <MoreHorizontal className="w-6 h-6 text-black" />
              </div>
              <div className="absolute inset-[-8px]">
                <div className="absolute inset-0 opacity-0 rounded-[1000px] bg-black" />
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Timer */}
      <div className="flex items-center justify-center pb-[10px]">
        <p
          className="font-['Pretendard_JP:Medium',sans-serif] text-[14px] text-[rgba(47,43,39,0.28)] text-center tracking-[0.203px] whitespace-nowrap"
          style={{
            fontFeatureSettings: "'ss10'",
            lineHeight: '1.429',
          }}
        >
          {timerText}
        </p>
      </div>
      
      {/* Divider */}
      <div className="h-[1px] w-full bg-[rgba(108,101,95,0.16)]" />
    </div>
  );
}

export default TopNavigation;
