import { CheckCheck } from 'lucide-react';

export interface MessageBubbleProps {
  className?: string;
  type?: 'sender' | 'recipient';
  text: string;
  time?: string;
  showProfile?: boolean;
  senderName?: string;
}

/**
 * MessageBubble - 채팅 메시지 버블
 */
export function MessageBubble({
  className,
  type = 'recipient',
  text,
  time = '19:33',
  showProfile = true,
  senderName = '사부작사부작'
}: MessageBubbleProps) {
  const isSender = type === 'sender';
  
  return (
    <div className={`flex gap-[12px] items-start w-full ${isSender ? 'flex-row-reverse' : ''} ${className || ''}`}>
      {/* Profile Avatar */}
      {!isSender && showProfile && (
        <div className="flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full border border-[rgba(108,101,95,0.08)] bg-white overflow-hidden flex items-center justify-center"
            style={{ borderRadius: '10000px' }}
          >
            <div className="content-stretch flex flex-col items-start overflow-clip w-full h-full">
              <div className="flex flex-[1_0_0] items-center justify-center">
                <div className="rotate-[-19.47deg]">
                  <div>
                    <img alt="" className="block w-full h-full object-cover" src="https://via.placeholder.com/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Message Content */}
      <div className={`flex flex-col gap-[8px] items-start ${isSender ? 'items-end' : ''} flex-1`}>
        {/* Sender Name */}
        {!isSender && showProfile && (
          <p
            className="font-['Pretendard_JP:SemiBold',sans-serif] text-[14px] text-[rgba(47,43,39,0.61)] leading-[1.429] tracking-[0.203px]"
            style={{ fontFeatureSettings: "'ss10'" }}
          >
            {senderName}
          </p>
        )}
        
        {/* Bubble + Time */}
        <div className={`flex gap-[8px] items-end ${isSender ? 'flex-row-reverse' : ''}`}>
          {/* Chat Bubble */}
          <div
            className="px-[8px] py-[8px]"
            style={{
              backgroundColor: isSender ? 'rgba(108,101,95,0.16)' : 'white',
              borderRadius: isSender ? '12px 12px 0 12px' : '12px 12px 12px 0',
            }}
          >
            <p
              className="font-['Pretendard_JP:Medium',sans-serif] text-[15px] text-[#1a1815] leading-[1.6] tracking-[0.144px] whitespace-nowrap"
              style={{ fontFeatureSettings: "'ss10'" }}
            >
              {text}
            </p>
          </div>
          
          {/* Time + Delivery */}
          <div className="flex flex-col gap-[2px] items-center justify-end">
            {isSender && (
              <div className="flex items-center justify-center">
                <CheckCheck className="w-4 h-4 text-[rgba(47,43,39,0.61)]" />
              </div>
            )}
            <p
              className="font-['Pretendard_JP:Medium',sans-serif] text-[11px] text-[rgba(47,43,39,0.61)] leading-[1.273] tracking-[0.3421px] whitespace-nowrap"
              style={{ fontFeatureSettings: "'ss10'" }}
            >
              {time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
