export interface ContentBadgeContentBadgeProps {
  className?: string;
  size?: 'XSmall' | 'Medium';
  text: string;
}

/**
 * ContentBadgeContentBadge - 데이트 배지 컴포넌트
 */
export function ContentBadgeContentBadge({ className, size = 'XSmall', text }: ContentBadgeContentBadgeProps) {
  const isMedium = size === 'Medium';
  
  return (
    <div
      className={`inline-flex items-center justify-center ${className || ''}`}
      style={{
        backgroundColor: 'rgba(108,101,95,0.08)',
        height: isMedium ? '28px' : '20px',
        paddingLeft: isMedium ? '8px' : '6px',
        paddingRight: isMedium ? '8px' : '6px',
        borderRadius: isMedium ? '8px' : '6px',
      }}
    >
      <div
        className="flex items-center justify-center relative shrink-0"
        style={{ gap: isMedium ? '4px' : '2px' }}
      >
        <div
          className="flex flex-col font-['Pretendard_JP:Medium',sans-serif] justify-center leading-[0] not-italic whitespace-nowrap"
          style={{
            fontSize: isMedium ? '13px' : '11px',
            color: 'rgba(47,43,39,0.61)',
            letterSpacing: isMedium ? '0.2522px' : '0.3421px',
            fontFeatureSettings: "'ss10'",
            lineHeight: isMedium ? '1.385' : '1.273',
          }}
        >
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

export default ContentBadgeContentBadge;
