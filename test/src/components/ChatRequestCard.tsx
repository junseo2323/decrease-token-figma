import { ChevronRight } from 'lucide-react';

interface ChatRequestCardProps {
  avatarUrl?: string;
  name?: string;
  details?: string[];
  statusMessage?: string;
  avatarBadgeUrl?: string; // e.g., premium or level badge overlapping avatar
  statusIconUrl?: string; // status badge icon like a star or heart next to statusMessage
}

export default function ChatRequestCard({
  avatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  name = "사부작사부작",
  details = ["25~29세 · 여성 · 서울", "느긋한 집순이"],
  statusMessage = "상대가 대화를 신청했어요",
  avatarBadgeUrl = "https://api.dicebear.com/7.x/shapes/svg?seed=badge",
  statusIconUrl = "https://api.dicebear.com/7.x/shapes/svg?seed=status",
}: ChatRequestCardProps) {
  return (
    <div className="bg-[var(--fill\/normal,rgba(108,101,95,0.08))] flex flex-col items-start p-[16px] relative rounded-[12px] w-full">
      <div className="flex gap-[16px] items-start justify-center relative shrink-0 w-full mb-1">
        {/* Avatar Section */}
        <div className="flex items-center justify-center relative rounded-[1000px] shrink-0 w-[80px] h-[80px]">
          {/* Avatar Interaction/Inner Ring (Optional) */}
          <div className="absolute flex inset-[-8px] items-center justify-center overflow-hidden rounded-[1000px]">
            <div className="bg-[#1a1815] flex-1 h-full opacity-0 hover:opacity-[0.04] transition-opacity cursor-pointer"></div>
          </div>
          
          <div className="bg-white border border-[rgba(108,101,95,0.08)] border-solid flex flex-1 h-full items-center justify-center overflow-hidden relative rounded-[1000px]">
            {/* Avatar Badge Overlap (Ratio) */}
            <div className="flex flex-col h-full items-start overflow-hidden relative z-10 shrink-0">
              <div className="flex flex-1 items-center justify-center relative w-[100px]">
                <div className="flex-none h-full -rotate-[19.47deg]">
                  <div className="h-full relative w-[70.711px]">
                     {/* Decorative Badge overlay */}
                     <img alt="badge" className="absolute block max-w-none w-full h-full mix-blend-overlay opacity-30 object-cover" src={avatarBadgeUrl} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Avatar Image */}
            <div className="absolute flex inset-[-1px_calc(0%-1px)] items-center justify-center">
              <div className="bg-[#ddd8d3] flex-1 h-full relative">
                <img alt={name} className="absolute inset-0 max-w-none object-cover pointer-events-none w-full h-full" src={avatarUrl} />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content Section */}
        <div className="flex flex-1 items-start justify-center relative">
          <div className="flex flex-1 flex-col gap-[4px] items-start relative w-full">
            
            {/* Header: Title and Trailing Icon */}
            <div className="flex gap-[12px] items-start relative shrink-0 w-full">
              <div className="flex flex-1 items-center relative">
                <p className="flex-1 font-['Pretendard_JP:SemiBold',sans-serif] font-semibold leading-[1.412] relative text-[17px] text-[#1a1815]" style={{ fontFeatureSettings: "'ss10'" }}>
                  {name}
                </p>
              </div>
              
              {/* Trailing Icon Button */}
              <div className="flex gap-[20px] h-[24px] items-center relative shrink-0 cursor-pointer group">
                <div className="flex items-start relative shrink-0">
                  <div className="flex flex-col h-[24px] items-center justify-center relative shrink-0">
                    <div className="flex flex-1 flex-col items-center justify-center relative z-10">
                       <ChevronRight className="w-5 h-5 text-[rgba(47,43,39,0.4)] group-hover:text-[rgba(47,43,39,0.8)] transition-colors" />
                    </div>
                    {/* Interaction State (Hover Background) */}
                    <div className="absolute inset-[-8px]">
                      <div className="absolute bg-[rgba(47,43,39,0.08)] inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[100px]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details List */}
            {details.map((detail, index) => (
              <p key={index} className="font-['Pretendard_JP:Medium',sans-serif] font-medium leading-[1.385] relative shrink-0 text-[13px] text-[rgba(47,43,39,0.61)] tracking-[0.2522px] w-full" style={{ fontFeatureSettings: "'ss10'" }}>
                {detail}
              </p>
            ))}

          </div>
        </div>
      </div>
      
      {/* Bottom Status Section */}
      <div className="flex flex-col items-end relative shrink-0 w-full mt-2">
        <div className="flex gap-[2px] items-center justify-center relative shrink-0">
          <div className="flex flex-row items-center self-stretch">
            {/* Status Icon */}
            <div className="flex h-full items-center justify-center py-[2px] relative shrink-0">
              <div className="flex flex-col h-[12px] w-[12px] items-center justify-center relative shrink-0">
                 <img alt="status-icon" className="block max-w-none w-full h-full object-contain" src={statusIconUrl} />
              </div>
            </div>
          </div>
          
          {/* Status Text Wrapper */}
          <div className="flex items-center justify-center px-[4px] relative shrink-0">
            <p className="font-['Pretendard_JP:Medium',sans-serif] font-medium leading-[1.334] relative shrink-0 text-[12px] text-[#557a55] tracking-[0.3024px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
              {statusMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
