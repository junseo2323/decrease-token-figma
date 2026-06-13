import ContentBadgeContentBadge from './ContentBadgeContentBadge';
import MessageBubble from './MessageBubble';
import StatusPro from './StatusPro';
import TopNavigation from './TopNavigation';
import ChatInput from './ChatInput';

export interface ChatScreenProps {
  className?: string;
  title?: string;
  timerText?: string;
}

/**
 * ChatScreen - 1:1 채팅 메인 화면
 * Figma handoff.md 기반으로 자동 생성
 */
export function ChatScreen({ className, title = '사부작사부작', timerText = '남은 시간 70 시간 32 분' }: ChatScreenProps) {
  return (
    <div className={`flex flex-col items-start bg-[#e9e6e2] min-h-screen ${className || ''}`}>
      {/* Status Bar */}
      <StatusPro time="9:41" showWifi={true} showCellular={true} batteryLevel="full" />
      
      {/* Top Navigation */}
      <TopNavigation title={title} timerText={timerText} />
      
      {/* Chat Messages */}
      <div className="flex flex-1 flex-col gap-[24px] items-center p-[16px] w-full overflow-y-auto">
        {/* Date Badge */}
        <div className="flex justify-center w-full">
          <ContentBadgeContentBadge size="Medium" text="2026 년 3 월 13 일 금요일" />
        </div>
        
        {/* Messages */}
        <MessageBubble
          type="recipient"
          text="다른 취미는요?"
          time="19:33"
          showProfile={true}
          senderName="사부작사부작"
        />
        
        <MessageBubble
          type="sender"
          text="저는 주로 혼자 영화관 가는 걸 좋아해요! 뭔가 낭만 있달까..ㅎㅎ"
          time="19:33"
          showProfile={false}
        />
        
        <MessageBubble
          type="recipient"
          text="ㅋㅋㅋㅋ왜요!"
          time="01:23"
          showProfile={false}
        />
        
        <MessageBubble
          type="recipient"
          text="헉 저도 영화 보는 거 좋아해요"
          time="01:23"
          showProfile={false}
        />
        
        <MessageBubble
          type="recipient"
          text="제가 낭만 없이 못 사는 사람인데... 딱히볼 거 없는 시기에도 주기적으로 영화관은 가요!"
          time="01:23"
          showProfile={false}
        />
      </div>
      
      {/* Chat Input */}
      <ChatInput placeholder="텍스트를 입력해 주세요." />
    </div>
  );
}

export default ChatScreen;
