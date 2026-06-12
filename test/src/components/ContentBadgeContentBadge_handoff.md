# 🎨 Optimized Figma React Code: ContentBadgeContentBadge

## 🤖 AI Pre-Analysis (Ollama · llama3.2)

> **Component Summary:** ContentBadgeContentBadge

| 항목 | 값 |
|---|---|
| 🎨 Colors | `rgba(108,101,95,0.08)` `var(--fill/normal,rgba(108,101,95,0.08))` `var(--label/alternative,rgba(47,43,39,0.61))` `#000000` `rgba(47,43,39,0.61)` |
| 📝 Texts | "text", "┗ Icon Variant ᠎", "Ratio" |

---

> 🚨 **[매우 중요] LLM 행동 교정 지시사항 (CRITICAL INSTRUCTION)** 🚨
> 너는 지금 전달받은 스크린샷과 아래의 뼈대 코드를 결합하여 완벽한 UI를 구현해야 한다. 코드를 작성하기 전, 반드시 아래의 5가지 원칙을 100% 준수해라.
>
> 1. **레이아웃(배치)은 '비전' 기반:** 요소들의 가로/세로 배치(flex, grid 등)와 전체적인 여백의 비율은 함께 전달된 **'스크린샷 이미지'를 눈으로 직접 확인**하고 구성해라.
> 2. **정확한 수치(디자인 토큰)는 '텍스트' 기반:** 색상, 폰트 크기, 패딩, 둥글기 값은 네가 임의로 기본 클래스(bg-gray-100 등)로 때려 맞추지 마라. **반드시 아래 '뼈대 코드'에 하드코딩되어 있는 정확한 값(Hex 코드, 패딩 수치 등)을 100% 그대로 복사해서 사용해라.**
> 3. **문구 및 데이터 보존:** 뼈대 코드에 있는 실제 텍스트(서비스 고유 명사 등)는 절대 환각으로 지어내지 말고 그대로 적용해라.
> 4. **에셋 변수명 리팩토링 필수:** 상단에 import 된 무의미한 변수명(`imgVariant` 등)은 컴포넌트에 적용할 때 반드시 `avatarImage`, `logoIcon` 등 역할에 맞는 시맨틱한 이름으로 변경해라.
> 5. **인라인 SVG 금지:** 주석 처리된 `{/* SVG Icon: 이름 */}` 부분은 무조건 `lucide-react` 컴포넌트로 대체하라. 픽셀이 조금 다르다는 이유로 절대 `<svg>` 태그를 직접 하드코딩하지 마라.

```tsx
import imgVariant from './assets/ContentBadgeContentBadge_imgVariant.png';

function ContentBadgeContentBadge({ className, color = "Neutral", leadingIcon = false, size = "XSmall", text = "텍스트", trailingIcon = false, variant = "Solid" }: ContentBadgeContentBadgeProps) {
  const isSolidAndMediumAndNeutral = variant === "Solid" && size === "Medium" && color === "Neutral";
  const isSolidAndXSmallAndNeutral = variant === "Solid" && size === "XSmall" && color === "Neutral";
  return (
    <div className={className || `${String.raw`bg-[var(--fill\/normal,rgba(108,101,95,0.08))] content-stretch flex items-center justify-center relative `}${isSolidAndMediumAndNeutral ? "h-[28px] px-[8px] rounded-[8px]" : "h-[20px] px-[6px] rounded-[6px]"}`} id={isSolidAndMediumAndNeutral ? "node-817_5848" : "node-817_5847"}>
      <div className={`content-stretch flex items-center justify-center relative shrink-0 ${isSolidAndMediumAndNeutral ? "gap-[4px]" : "gap-[2px]"}`} data-name="Content" id={isSolidAndMediumAndNeutral ? "node-817_5866" : "node-817_5862"}>
        {isSolidAndXSmallAndNeutral && leadingIcon && (
          <div className="content-stretch flex flex-col items-center justify-center" data-name="Leading Icon">
            <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                  <div className="rotate-[-19.47deg]">
                    <div  data-name="Ratio">
                      <img alt="" className="block" src={imgLeadingIcon} />
                    </div>
                  </div>
                </div>
              </div>
              <img alt="" className="block" src={imgLeadingIcon1} />
            </div>
          </div>
        )}
        {isSolidAndXSmallAndNeutral && (
          <div className="flex flex-col font-['Pretendard_JP:Medium',sans-serif] justify-center leading-[0] not-italic text-[11px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.3421px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
            <p className="leading-[1.273]">{text}</p>
          </div>
        )}
        {isSolidAndXSmallAndNeutral && trailingIcon && (
          <div className="content-stretch flex flex-col items-center justify-center" data-name="Trailing Icon">
            <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                  <div className="rotate-[-19.47deg]">
                    <div  data-name="Ratio">
                      <img alt="" className="block" src={imgLeadingIcon} />
                    </div>
                  </div>
                </div>
              </div>
              <img alt="" className="block" src={imgLeadingIcon1} />
            </div>
          </div>
        )}
        {isSolidAndMediumAndNeutral && leadingIcon && (
          <div className="content-stretch flex flex-col items-center justify-center" data-name="Leading Icon">
            <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                  <div className="rotate-[-19.47deg]">
                    <div  data-name="Ratio">
                      <img alt="" className="block" src={imgLeadingIcon} />
                    </div>
                  </div>
                </div>
              </div>
              <img alt="" className="block" src={imgLeadingIcon1} />
            </div>
          </div>
        )}
        {isSolidAndMediumAndNeutral && (
          <div className="flex flex-col font-['Pretendard_JP:Medium',sans-serif] justify-center leading-[0] not-italic text-[13px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.2522px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
            <p className="leading-[1.385]">{text}</p>
          </div>
        )}
        {isSolidAndMediumAndNeutral && trailingIcon && (
          <div className="content-stretch flex flex-col items-center justify-center" data-name="Trailing Icon">
            <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
              <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                  <div className="rotate-[-19.47deg]">
                    <div  data-name="Ratio">
                      <img alt="" className="block" src={imgLeadingIcon} />
                    </div>
                  </div>
                </div>
              </div>
              <img alt="" className="block" src={imgLeadingIcon1} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
type MessageBubbleProps = {
  className?: string;
  date?: boolean;
  delivery?: boolean;
  profile?: boolean;
  tail?: boolean;
  text?: string;
  type?: "Sender" | "Recipient" | "Error";
};

function MessageBubble({ className, date = true, delivery = true, profile = true, tail = true, text = "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ 웃겨요 어이없어!", type = "Recipient" }: MessageBubbleProps) {
  return (
    <div className={className || "content-stretch flex flex-col gap-[var(--space-5,20px)] items-center relative w-[369px]"}>
      {date && <ContentBadgeContentBadge className="bg-[var(--fill\/normal,rgba(108,101,95,0.08))] content-stretch flex items-center justify-center px-[8px] rounded-[8px]" size="Medium" text="2026년 3월 13일 금요일" />}
      <div className="content-stretch flex gap-[12px] items-start" data-name="Bubbles">
        {profile && (
          <div className="content-stretch flex items-center justify-center rounded-[10000px]" data-name="Avatar/Avatar">
            <div className="content-stretch flex inset-0 items-center justify-center" data-name="Interaction">
              <div className="content-stretch flex inset-[-8px] items-center justify-center overflow-clip rounded-[10000px]" data-name="Interaction">
                <div className="bg-[var(--label\/normal,#1a1815)] flex-[1_0_0] opacity-0" data-name="Interaction" />
              </div>
            </div>
            <div className="bg-[var(--static\/white,white)] border border-[var(--line\/normal\/alternative,rgba(108,101,95,0.08))] border-solid content-stretch flex flex-[1_0_0] items-center justify-center overflow-clip rounded-[10000px]" data-name="Container">
              <div className="content-stretch flex flex-col items-start overflow-clip" data-name="Ratio">
                <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                  <div className="rotate-[-19.47deg]">
                    <div  data-name="Ratio">
                      <img alt="" className="block" src={imgRatio} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex items-center justify-center" data-name="Content">
                <div className="bg-[var(--background\/normal\/alternative,#ddd8d3)] flex-[1_0_0]" data-name="Variant">
                  <img alt="" className="inset-0 object-cover pointer-events-none" src={imgVariant} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-2,8px)] items-start" data-name="Container">
          {profile && (
            <div className="content-stretch flex gap-[12px] items-end" data-name="Section Header/Section Header">
              <div className="content-stretch flex flex-[1_0_0] items-center" data-name="Title">
                <p className="flex-[1_0_0] font-['Pretendard_JP:SemiBold',sans-serif] leading-[1.429] not-italic text-[14px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.203px]" style={{ fontFeatureSettings: "'ss10'" }}>
                  사부작사부작
                </p>
              </div>
            </div>
          )}
          <div className="content-stretch flex gap-[var(--space-2,8px)] items-end" data-name="Container">
            <div className="bg-[var(--static\/white,white)] content-stretch flex items-center justify-center p-[8px] rounded-bl-[12px] rounded-br-[12px] rounded-tr-[12px]" data-name="Chat">
              <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.6] not-italic text-[15px] text-[color:var(--label\/normal,#1a1815)] tracking-[0.144px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                {text}
              </p>
            </div>
            {delivery && (
              <div className="content-stretch flex flex-col gap-[var(--space-\[2px\],2px)] items-start justify-end" data-name="Container">
                <div className="content-stretch flex items-center justify-center overflow-clip" data-name="Textinput/Resource/Textfield/Trailing Content">
                  <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="Icon">
                    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                        <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                          <div className="rotate-[-19.47deg]">
                            <div  data-name="Ratio">
                              <img alt="" className="block" src={imgRatio1} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <img alt="" className="block" src={imgIconVariant} />
                    </div>
                  </div>
                </div>
                <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.273] not-italic text-[11px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.3421px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                  19:33
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
type BatteryProProps = {
  className?: string;
  darkMode?: boolean;
  percentage?: "100%" | "50%" | "20%" | "10%";
};

function BatteryPro({ className, darkMode = false, percentage = "100%" }: BatteryProProps) {
  const is100AndDarkMode = percentage === "100%" && darkMode;
  return (
    <div className={className || "h-[12px] relative w-[25px]"} id={is100AndDarkMode ? "node-90_1148" : "node-90_1132"}>
      <div className="inset-[0_9.36%_0_0]" data-name="Border" id={is100AndDarkMode ? "node-90_1149" : "node-90_1133"}>
        <img alt="" className="block" src={is100AndDarkMode ? imgBorder1 : imgBorder} />
      </div>
      <div className="inset-[33.33%_0.01%_33.33%_94.68%]" data-name="Cap" id={is100AndDarkMode ? "node-90_1150" : "node-90_1134"}>
        <img alt="" className="block" src={is100AndDarkMode ? imgCap1 : imgCap} />
      </div>
      <div className={`absolute inset-[16.67%_17.36%_16.67%_8%] rounded-[1.333px] ${is100AndDarkMode ? "bg-white" : "bg-black"}`} data-name="Capacity" id={is100AndDarkMode ? "node-90_1151" : "node-90_1135"} />
    </div>
  );
}
type StatusProProps = {
  className?: string;
  connection?: "WiFi";
  darkMode?: boolean;
};

function StatusPro({ className, connection = "WiFi", darkMode = false }: StatusProProps) {
  return (
    <div className={className || "h-[16px] relative w-[73px]"}>
      <div  data-name="Battery/Pro">
        <div className="inset-[0_9.36%_0_0]" data-name="Border">
          <img alt="" className="block" src={imgBorder} />
        </div>
        <div className="inset-[33.33%_0.01%_33.33%_94.68%]" data-name="Cap">
          <img alt="" className="block" src={imgCap} />
        </div>
        <div className="bg-black inset-[16.67%_17.36%_16.67%_8%] rounded-[1.333px]" data-name="Capacity" />
      </div>
      <div className="inset-[12.5%_43.32%_12.5%_33.78%]" data-name="Wifi">
        <img alt="" className="block" src={imgWifi} />
      </div>
      <div className="inset-[16.63%_73.52%_12.56%_3.19%]" data-name="Cellular">
        <img alt="" className="block" src={imgCellular} />
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] content-stretch flex flex-col items-start" data-name="4.1 1:1 채팅_기본">
      <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] content-stretch flex flex-col items-start" data-name="Fixed Scroll">
        <div  data-name="Status Bar/Pro">
          <div className="-translate-x-1/2 -translate-y-1/2 flex flex-col font-['SF_Pro_Text:Semibold',sans-serif] justify-center leading-[0] not-italic text-[15.66px] text-black text-center tracking-[-0.28px] whitespace-nowrap">
            <p className="leading-[normal]">9:41</p>
          </div>
          <StatusPro  />
        </div>
        <div className="content-stretch flex flex-col items-start" data-name="Top Navigation/Top Navigation">
          <div className="content-stretch flex flex-col items-start" data-name="Container">
            <div className="content-stretch flex flex-col items-start" data-name="Bar">
              <div className="content-stretch flex items-start justify-center pt-[16px] px-[16px]" data-name="Navigation">
                <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center justify-center" data-name="Content">
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-center" data-name="Title">
                    <div className="flex flex-row items-center self-stretch">
                      <div className="content-stretch flex items-center justify-center" data-name="Filler">
                        <div  data-name="Filler" />
                      </div>
                    </div>
                    <div className="content-stretch flex flex-[1_0_0] items-center justify-center px-[4px]" data-name="Wrapper">
                      <div className="flex flex-col font-['Pretendard_JP:SemiBold',sans-serif] justify-center leading-[0] not-italic overflow-hidden text-[17px] text-[color:var(--label\/strong,black)] text-center text-ellipsis whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                        <p className="leading-[1.412] overflow-hidden">사부작사부작</p>
                      </div>
                    </div>
                    <div className="flex flex-row items-center self-stretch">
                      <div className="content-stretch flex items-center justify-center" data-name="Filler">
                        <div  data-name="Filler" />
                      </div>
                    </div>
                  </div>
                  <div className="-translate-y-1/2 content-stretch flex gap-[16px] items-center" data-name="Leading">
                    <div className="content-stretch flex items-center justify-center" data-name="Normal">
                      <div className="content-stretch flex items-center" data-name="Leading Button">
                        <div className="content-stretch flex flex-col items-center justify-center" data-name="Back">
                          <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="Icon">
                            <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
                              <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                                <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                                  <div className="rotate-[-19.47deg]">
                                    <div  data-name="Ratio">
                                      <img alt="" className="block" src={imgRatio2} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <img alt="" className="block" src={imgIconVariant1} />
                            </div>
                          </div>
                          <div className="inset-[-8px]" data-name="Interaction">
                            <div className="bg-[var(--label\/normal,#1a1815)] inset-0 opacity-0 rounded-[1000px]" data-name="Interaction" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="-translate-y-1/2 content-stretch flex items-center justify-end" data-name="Trailing">
                    <div className="content-stretch flex gap-[16px] items-center justify-end" data-name="Trailing Button">
                      <div className="content-stretch flex items-center justify-center" data-name="Icon 1">
                        <div className="content-stretch flex flex-col items-center justify-center" data-name="Icon">
                          <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="Icon">
                            <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
                              <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                                <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                                  <div className="rotate-[-19.47deg]">
                                    <div  data-name="Ratio">
                                      <img alt="" className="block" src={imgRatio2} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <img alt="" className="block" src={imgIconVariant2} />
                            </div>
                          </div>
                          <div className="inset-[-8px]" data-name="Interaction">
                            <div className="bg-[var(--label\/normal,#1a1815)] inset-0 opacity-0 rounded-[1000px]" data-name="Interaction" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex flex-col items-start" data-name="Tool">
                <div className="content-stretch flex flex-col items-start" data-name="Tool">
                  <div className="content-stretch flex items-start justify-center" data-name="Container">
                    <div className="content-stretch flex flex-[1_0_0] items-start" data-name="Tab">
                      <div className="content-stretch flex flex-[1_0_0] items-center" data-name="Container">
                        <div className="content-stretch flex flex-[1_0_0] items-center justify-center" data-name="Content">
                          <div className="flex flex-[1_0_0] flex-row items-center self-stretch">
                            <div className="content-stretch flex flex-[1_0_0] items-center overflow-clip" data-name="Fill">
                              <div className="content-stretch flex flex-[1_0_0] items-center" data-name="Content">
                                <div className="content-stretch flex flex-[1_0_0] items-center justify-center pb-[10px]" data-name="Tab 1">
                                  <div className="content-stretch flex flex-col inset-[0_-12px] items-start overflow-clip" data-name="Interaction">
                                    <div className="bg-[var(--label\/normal,#1a1815)] flex-[1_0_0] opacity-0" data-name="Interaction" />
                                  </div>
                                  <div className="content-stretch flex flex-[1_0_0] gap-[10px] items-center justify-center" data-name="Container">
                                    <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.429] not-italic text-[14px] text-[color:var(--label\/assistive,rgba(47,43,39,0.28))] text-center tracking-[0.203px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                                      남은 시간 70시간 32분
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div  data-name="Filler">
                <img alt="" className="block" src={imgFiller} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-center p-[var(--space-4,16px)]" data-name="Body">
        <div className="content-stretch flex flex-col gap-[var(--space-\[10px\],10px)] items-start" data-name="Container">
          <MessageBubble className="content-stretch flex flex-col gap-[var(--space-5,20px)] items-center" delivery={false} />
          <div className="content-stretch flex gap-[var(--space-3,12px)] items-start pl-[52px]" data-name="MessageBubble">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-2,0px)] items-start" data-name="Container">
              <div className="content-stretch flex gap-[var(--space-2,8px)] items-end" data-name="Container">
                <div className="bg-[var(--static\/white,white)] content-stretch flex items-center justify-center p-[8px] rounded-[12px]" data-name="Chat">
                  <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.6] not-italic text-[15px] text-[color:var(--label\/normal,#1a1815)] tracking-[0.144px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                    다른 취미는요?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[var(--space-3,12px)] items-start pl-[52px]" data-name="MessageBubble">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-2,0px)] items-start" data-name="Container">
              <div className="content-stretch flex gap-[var(--space-2,8px)] items-end" data-name="Container">
                <div className="bg-[var(--static\/white,white)] content-stretch flex items-center justify-center p-[8px] rounded-[12px]" data-name="Chat">
                  <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.6] not-italic text-[15px] text-[color:var(--label\/normal,#1a1815)] tracking-[0.144px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                    저는 주로 혼자 영화관 가는 걸 좋아해요! 뭔가 낭만 있달까..ㅎㅎ
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[var(--space-\[2px\],2px)] items-start justify-end" data-name="Container">
                  <div className="content-stretch flex items-center justify-center overflow-clip" data-name="Textinput/Resource/Textfield/Trailing Content" />
                  <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.273] not-italic text-[11px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.3421px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                    19:33
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[var(--space-\[10px\],10px)] items-end" data-name="Container">
          <div className="content-stretch flex gap-[var(--space-3,12px)] items-start" data-name="MessageBubble">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-5,20px)] items-center" data-name="Container">
              <div className="bg-[var(--fill\/normal,rgba(108,101,95,0.08))] content-stretch flex items-center justify-center px-[8px] rounded-[8px]" data-name="Content Badge/Content Badge">
                <div className="content-stretch flex gap-[4px] items-center justify-center" data-name="Content">
                  <div className="flex flex-col font-['Pretendard_JP:Medium',sans-serif] justify-center leading-[0] not-italic text-[13px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.2522px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                    <p className="leading-[1.385]">2026년 3월 14일 토요일</p>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex gap-[var(--space-3,12px)] items-start" data-name="MessageBubble">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-2,0px)] items-start" data-name="Container">
                  <div className="content-stretch flex gap-[var(--space-2,8px)] items-end justify-end" data-name="Container">
                    <div className="bg-[var(--fill\/strong,rgba(108,101,95,0.16))] content-stretch flex items-center justify-center p-[8px] rounded-bl-[12px] rounded-br-[12px] rounded-tl-[12px]" data-name="Chat">
                      <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.6] not-italic text-[15px] text-[color:var(--label\/normal,#1a1815)] tracking-[0.144px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                        ㅋㅋㅋㅋ왜요!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[var(--space-3,12px)] items-start" data-name="MessageBubble">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-2,0px)] items-start" data-name="Container">
              <div className="content-stretch flex gap-[var(--space-2,8px)] items-end justify-end" data-name="Container">
                <div className="bg-[var(--fill\/strong,rgba(108,101,95,0.16))] content-stretch flex items-center justify-center p-[8px] rounded-[12px]" data-name="Chat">
                  <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.6] not-italic text-[15px] text-[color:var(--label\/normal,#1a1815)] tracking-[0.144px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                    헉 저도 영화 보는 거 좋아해요
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[var(--space-3,12px)] items-start" data-name="MessageBubble">
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-2,0px)] items-start" data-name="Container">
              <div className="content-stretch flex gap-[var(--space-2,8px)] items-end justify-end" data-name="Container">
                <div className="content-stretch flex flex-col gap-[var(--space-\[2px\],2px)] items-end justify-end" data-name="Container">
                  <div className="content-stretch flex items-center justify-center overflow-clip" data-name="Textinput/Resource/Textfield/Trailing Content">
                    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="Icon">
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                          <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                            <div className="rotate-[-19.47deg]">
                              <div  data-name="Ratio">
                                <img alt="" className="block" src={imgRatio1} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <img alt="" className="block" src={imgIconVariant3} />
                      </div>
                    </div>
                  </div>
                  <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.273] not-italic text-[11px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.3421px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                    01:23
                  </p>
                </div>
                <div className="bg-[var(--fill\/strong,rgba(108,101,95,0.16))] content-stretch flex items-center justify-center p-[8px] rounded-[12px]" data-name="Chat">
                  <p className="font-['Pretendard_JP:Medium',sans-serif] leading-[1.6] not-italic text-[15px] text-[color:var(--label\/normal,#1a1815)] tracking-[0.144px]" style={{ fontFeatureSettings: "'ss10'" }}>
                    제가 낭만 없이 못 사는 사람인데... 딱히볼 거 없는 시기에도 주기적으로 영화관은 가요!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] content-stretch flex flex-col items-center py-[var(--space-4,16px)]" data-name="Bottom">
        <div className="content-stretch flex flex-col gap-[8px] isolate items-start" data-name="Textinput/Textfield">
          <div className="content-stretch flex isolate items-center" data-name="Input">
            <div className="content-stretch flex flex-[1_0_0] items-center" data-name="Wrapper">
              <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center justify-center p-[12px] rounded-[12px]" data-name="Container">
                <div className="content-stretch flex flex-col inset-0 items-center justify-center" data-name="Interaction">
                  <div className="content-stretch flex flex-[1_0_0] flex-col items-start" data-name="Interaction">
                    <div className="border border-[var(--line\/normal\/neutral,rgba(108,101,95,0.16))] border-solid inset-0 rounded-[12px]" data-name="Inner Border" />
                    <div className="bg-[rgba(0,0,0,0)] inset-0 rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)]" data-name="Drop Shadow" />
                  </div>
                </div>
                <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center justify-center" data-name="Content">
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-center px-[4px]" data-name="Text">
                    <p className="flex-[1_0_0] font-['Pretendard_JP:Regular',sans-serif] leading-[1.5] not-italic overflow-hidden text-[16px] text-[color:var(--label\/assistive,rgba(47,43,39,0.28))] text-ellipsis tracking-[0.0912px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss10'" }}>
                      텍스트를 입력해 주세요.
                    </p>
                  </div>
                  <div className="content-stretch flex items-center justify-center overflow-clip" data-name="Trailing Content">
                    <div className="content-stretch flex items-center justify-end" data-name="Trailing Content">
                      <div className="bg-[var(--primary\/normal,#1a1815)] content-stretch flex flex-col items-center justify-center overflow-clip p-[7px] rounded-[1000px]" data-name="Button/Icon/Solid">
                        <div className="content-stretch flex flex-col items-center justify-center" data-name="Icon">
                          <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="┗ Icon Variant ᠎">
                            <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                              <div className="flex flex-[1_0_0] items-center justify-center" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
                                <div className="rotate-[-19.47deg]">
                                  <div  data-name="Ratio">
                                    <img alt="" className="block" src={imgRatio3} />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <img alt="" className="block" src={imgIconVariant4} />
                          </div>
                        </div>
                        <div className="inset-0 overflow-clip" data-name="Interaction">
                          <div className="bg-[var(--label\/normal,#1a1815)] inset-[0_-41.02%_0_0] opacity-0" data-name="Interaction" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--background\/normal\/normal,#e9e6e2)]" data-name="Home bar/Pro">
          <div className="-translate-x-1/2 bg-[var(--theme\$\/alpha\/900,#1a1a1a)] rounded-[100px]" data-name="Home Indicator" />
        </div>
      </div>
    </div>
  );
}
```
