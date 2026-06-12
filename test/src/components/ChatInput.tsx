import React, { useState } from 'react';
import { Send } from 'lucide-react';

export interface ChatInputProps {
  className?: string;
  placeholder?: string;
  onSendMessage?: (message: string) => void;
}

/**
 * ChatInput - 채팅 입력창
 */
export function ChatInput({ className, placeholder = '텍스트를 입력해 주세요.', onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  return (
    <div className={`flex flex-col gap-[8px] isolate items-start px-[16px] py-[16px] bg-[#e9e6e2] w-full ${className || ''}`}>
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="flex flex-1 items-center">
          <div className="flex flex-1 gap-[12px] items-center justify-center p-[12px] rounded-[12px] relative">
            {/* Border & Shadow */}
            <div className="flex flex-col absolute inset-0 items-center justify-center">
              <div className="flex flex-1 flex-col items-start">
                <div className="absolute inset-0 rounded-[12px] border border-[rgba(108,101,95,0.16)] border-solid" />
                <div className="absolute inset-0 rounded-[12px] bg-[rgba(0,0,0,0)] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex flex-1 gap-[8px] items-center justify-center relative">
              {/* Input */}
              <div className="flex flex-1 items-center justify-center px-[4px]">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 font-['Pretendard_JP:Regular',sans-serif] text-[16px] text-[rgba(47,43,39,0.28)] placeholder:text-[rgba(47,43,39,0.28)] outline-none overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{
                    fontFeatureSettings: "'ss10'",
                    lineHeight: '1.5',
                    letterSpacing: '0.0912px',
                  }}
                />
              </div>
              
              {/* Send Button */}
              <button
                type="submit"
                disabled={!message.trim()}
                className="flex flex-col items-center justify-center overflow-clip p-[7px] rounded-[1000px] bg-[#1a1815] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-[18px] h-[18px] text-white" />
                <div className="absolute inset-0 overflow-clip">
                  <div className="absolute inset-[0_-41.02%_0_0] opacity-0 bg-black" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Home Indicator */}
      <div className="flex justify-center w-full">
        <div
          className="-translate-x-1/2 rounded-[100px] bg-[#1a1a1a]"
          style={{ width: '134px', height: '5px' }}
        />
      </div>
    </div>
  );
}

export default ChatInput;
