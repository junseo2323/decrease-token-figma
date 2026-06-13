# 🎨 Optimized Figma React Code: BatteryPro

## 🤖 AI Pre-Analysis (Ollama · llama3.2)

> **Component Summary:** Repeating div components with varying layouts

| 항목 | 값 |
|---|---|
| 🎨 Colors | `#8e867f` `rgba(221,216,211,0.52)` `var(--line/solid/alternative)` |
| 📝 Texts | "홈", "소개 노트 수정" |

---


## 스크린샷 파일

- /Users/seojuno/dev/AI/decrease-token-figma/benchmarks/fixtures/ditto-battery-pro/reference.png

> 레이아웃 판단 전 반드시 위 이미지 파일을 Read 도구로 읽어라.

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
// 반복 컴포넌트 정의
// 기본값: text="홈", imageSrc="imgIcon", variant="text-[color:var(--interaction\\/inactive,#8e867f)]"
function RepeatedDiv({ text = "홈", imageSrc = "imgIcon", variant = "text-[color:var(--interaction\\/inactive,#8e867f)]" }: { text?: string; imageSrc?: string; variant?: string }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center py-[9px]" data-name="Tab 1">
                      <div className="content-stretch flex flex-col gap-[2px] items-center justify-center" data-name="Content">
                        <div className="content-stretch flex flex-col items-center justify-center" data-name="Icon">
                          <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="Icon">
                            <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                              <div className="flex flex-[1_0_0] items-center justify-center">
                                <div className="rotate-[-19.47deg]">
                                  <div  data-name="Ratio">
                                    <img alt="" className="block inset-0" src={imgRatio1} />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <img alt="" className="block inset-0" src={imageSrc} />
                          </div>
                        </div>
                        <p className={`[word-break:break-word] font-['Pretendard_JP:Medium'] leading-[1.273] not-italic text-[11px] text-center tracking-[0.3421px] whitespace-nowrap ${variant}`} style={{ fontFeatureSettings: '"ss10"' }}>
                          홈
                        </p>
                      </div>
                    </div>
  );
}

// 기본값: imageSrc="imgRatio2", imageSrc2="imgIconNormalStar1", variant="aspect-[20/20]"
function RepeatedDiv2({ imageSrc = "imgRatio2", imageSrc2 = "imgIconNormalStar1", variant = "aspect-[20/20]" }: { imageSrc?: string; imageSrc2?: string; variant?: string }) {
  return (
    <div className={`content-stretch flex flex-col items-center justify-center ${variant}`} data-name="Leading Icon">
                                  <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="Name=starFill, Fill=True">
                                    <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                                      <div className="flex flex-[1_0_0] items-center justify-center">
                                        <div className="rotate-[-19.47deg]">
                                          <div  data-name="Ratio">
                                            <img alt="" className="block inset-0" src={imageSrc} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <img alt="" className="block inset-0" src={imageSrc2} />
                                  </div>
                                </div>
  );
}

// 기본값: text="소개 노트 수정", variant="px-[8px] py-[6px] rounded-[8px]", variant2="bg-[var(--line\\/solid\\/alternative,rgba(221,216,211,0.52))] inset-0 rounded-[8px]", variant3="gap-[2px]", variant4="px-[2px]", variant5="leading-[1.429] text-[14px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))] tracking-[0.203px]", variant6="content-stretch flex inset-0 items-start rounded-[8px]", variant7="bg-[var(--label\\/neutral,rgba(47,43,39,0.88))] flex-[1_0_0] rounded-[6px]"
function RepeatedDiv3({ text = "소개 노트 수정", variant = "px-[8px] py-[6px] rounded-[8px]", variant2 = "bg-[var(--line\\/solid\\/alternative,rgba(221,216,211,0.52))] inset-0 rounded-[8px]", variant3 = "gap-[2px]", variant4 = "px-[2px]", variant5 = "leading-[1.429] text-[14px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))] tracking-[0.203px]", variant6 = "content-stretch flex inset-0 items-start rounded-[8px]", variant7 = "bg-[var(--label\\/neutral,rgba(47,43,39,0.88))] flex-[1_0_0] rounded-[6px]" }: { text?: string; variant?: string; variant2?: string; variant3?: string; variant4?: string; variant5?: string; variant6?: string; variant7?: string }) {
  return (
    <div className={`content-stretch flex items-center ${variant}`} data-name="┗ Main Action">
                        <div className={variant2} data-name="Background" />
                        <div className={`content-stretch flex items-center justify-center ${variant3}`} data-name="Wrapper">
                          <div className={`content-stretch flex items-center justify-center ${variant4}`} data-name="Content">
                            <p className={`[word-break:break-word] font-['Pretendard_JP:Medium'] not-italic whitespace-nowrap ${variant5}`} style={{ fontFeatureSettings: '"ss10"' }}>
                              소개 노트 수정
                            </p>
                          </div>
                        </div>
                        <div className={`overflow-clip ${variant6}`} data-name="Interaction">
                          <div className={`opacity-0 ${variant7}`} data-name="Interaction" />
                        </div>
                      </div>
  );
}

// 기본값: text="개굴개굴렌", variant="gap-[12px] items-start", variant2="", variant3="font-['Pretendard_JP:Bold'] leading-[1.334] text-[24px] text-[color:var(--label\\/normal,#1a1815)] text-center tracking-[-0.552px]"
function RepeatedDiv4({ text = "개굴개굴렌", variant = "gap-[12px] items-start", variant2 = "", variant3 = "font-['Pretendard_JP:Bold'] leading-[1.334] text-[24px] text-[color:var(--label\\/normal,#1a1815)] text-center tracking-[-0.552px]" }: { text?: string; variant?: string; variant2?: string; variant3?: string }) {
  return (
    <div className={`content-stretch flex ${variant}`} data-name="Section Header/Section Header">
                  <div className={`content-stretch flex items-center ${variant2}`} data-name="Title">
                    <p className={`[word-break:break-word] not-italic whitespace-nowrap ${variant3}`} style={{ fontFeatureSettings: '"ss10"' }}>
                      개굴개굴렌
                    </p>
                  </div>
                </div>
  );
}

// 기본값: text="5", text2="참여 주차", variant="flex-col gap-[var(--space-\\[2px\\],2px)] justify-center", variant2="leading-[1.4] text-[20px] text-[color:var(--label\\/normal,#1a1815)] tracking-[-0.24px]", variant3="font-['Pretendard_JP:Regular'] leading-[1.429] text-[14px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))] tracking-[0.203px]"
function RepeatedDiv5({ text = "5", text2 = "참여 주차", variant = "flex-col gap-[var(--space-\\[2px\\],2px)] justify-center", variant2 = "leading-[1.4] text-[20px] text-[color:var(--label\\/normal,#1a1815)] tracking-[-0.24px]", variant3 = "font-['Pretendard_JP:Regular'] leading-[1.429] text-[14px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))] tracking-[0.203px]" }: { text?: string; text2?: string; variant?: string; variant2?: string; variant3?: string }) {
  return (
    <div className={`content-stretch flex items-center ${variant}`}>
                      <p className={`font-['Pretendard_JP:SemiBold'] ${variant2}`} style={{ fontFeatureSettings: '"ss10"' }}>
                        5
                      </p>
                      <p className={variant3} style={{ fontFeatureSettings: '"ss10"' }}>
                        참여 주차
                      </p>
                    </div>
  );
}

// 화면 구성
import imgVariant from './assets/BatteryPro_imgVariant.png';

function BatteryPro({ className, darkMode = false, percentage = "100%" }: BatteryProProps) {
  const is100AndDarkMode = percentage === "100%" && darkMode;
  return (
    <div className={className || "h-[12px] relative w-[25px]"} id={is100AndDarkMode ? "node-90_1148" : "node-90_1132"}>
      <div className="inset-[0_9.36%_0_0]" id={is100AndDarkMode ? "node-90_1149" : "node-90_1133"} data-name="Border">
        <img alt="" className="block inset-0" src={is100AndDarkMode ? imgBorder1 : imgBorder} />
      </div>
      <div className="inset-[33.33%_0.01%_33.33%_94.68%]" id={is100AndDarkMode ? "node-90_1150" : "node-90_1134"} data-name="Cap">
        <img alt="" className="block inset-0" src={is100AndDarkMode ? imgCap1 : imgCap} />
      </div>
      <div className={`absolute inset-[16.67%_17.36%_16.67%_8%] rounded-[1.333px] ${is100AndDarkMode ? "bg-white" : "bg-black"}`} id={is100AndDarkMode ? "node-90_1151" : "node-90_1135"} data-name="Capacity" />
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
          <img alt="" className="block inset-0" src={imgBorder} />
        </div>
        <div className="inset-[33.33%_0.01%_33.33%_94.68%]" data-name="Cap">
          <img alt="" className="block inset-0" src={imgCap} />
        </div>
        <div className="bg-black inset-[16.67%_17.36%_16.67%_8%] rounded-[1.333px]" data-name="Capacity" />
      </div>
      <div className="inset-[12.5%_43.32%_12.5%_33.78%]" data-name="Wifi">
        <img alt="" className="block inset-0" src={imgWifi} />
      </div>
      <div className="inset-[16.63%_73.52%_12.56%_3.19%]" data-name="Cellular">
        <img alt="" className="block inset-0" src={imgCellular} />
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] content-stretch flex flex-col items-start" data-name="6.1 프로필">
      <div className="content-stretch flex flex-col gap-[var(--space-5,20px)] items-center px-[16px] py-[var(--space-4,16px)]" data-name="Content">
        <div className="content-stretch flex flex-col gap-[16px] items-center">
          <div className="content-stretch flex items-center justify-center rounded-[10000px]" data-name="Avatar/Avatar">
            <div className="content-stretch flex inset-0 items-center justify-center" data-name="Interaction">
              <div className="content-stretch flex inset-[-8px] items-center justify-center overflow-clip rounded-[10000px]" data-name="Interaction">
                <div className="bg-[var(--label\/normal,#1a1815)] flex-[1_0_0] opacity-0" data-name="Interaction" />
              </div>
            </div>
            <div className="bg-[var(--static\/white,white)] border border-[var(--line\/normal\/alternative,rgba(108,101,95,0.08))] border-solid content-stretch flex flex-[1_0_0] items-center justify-center overflow-clip rounded-[10000px]" data-name="Container">
              <div className="content-stretch flex flex-col items-start overflow-clip" data-name="Ratio">
                <div className="flex flex-[1_0_0] items-center justify-center">
                  <div className="rotate-[-19.47deg]">
                    <div  data-name="Ratio">
                      <img alt="" className="block inset-0" src={imgRatio} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="content-stretch flex inset-[-1px_calc(0%-1px)] items-center justify-center" data-name="Content">
                <div className="bg-[var(--background\/normal\/alternative,#ddd8d3)] flex-[1_0_0]" data-name="Variant">
                  <img alt="" className="inset-0 object-cover pointer-events-none" src={imgVariant} />
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[var(--space-2,8px)] items-center" data-name="Container">
            <RepeatedDiv4 />
            <p className="[word-break:break-word] font-['Pretendard_JP:Medium'] leading-[1.5] not-italic text-[16px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] text-center tracking-[0.0912px]" style={{ fontFeatureSettings: '"ss10"' }}>
              25~29세 · 남성 · 서울
            </p>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start" data-name="Action Area/Action Area">
          <div className="content-stretch flex flex-col items-start" data-name="Contents">
            <div className="content-stretch flex flex-col items-start" data-name="Actions">
              <div className="content-stretch flex flex-col gap-[16px] items-start p-[var(--space-0,0px)]" data-name="Container">
                <div className="content-stretch flex gap-[12px] items-center justify-center" data-name="Contents">
                  <div className="border border-[var(--line\/normal\/neutral,rgba(108,101,95,0.16))] border-solid content-stretch flex flex-[1_0_0] flex-col items-center justify-center overflow-clip px-[20px] py-[9px] rounded-[10px]" data-name="┗ Alternative Action">
                    <RepeatedDiv4 text="프로필 수정" variant="flex-col items-center justify-center" variant2="gap-[5px] justify-center" variant3="font-['Pretendard_JP:Medium'] leading-[1.467] text-[15px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))] tracking-[0.144px]" />
                    <div className="inset-[-1px] overflow-clip" data-name="Interaction">
                      <div className="bg-[var(--label\/normal,#1a1815)] inset-0 opacity-0" data-name="Interaction" />
                    </div>
                  </div>
                  <RepeatedDiv3 variant="border border-[var(--line\\/normal\\/neutral,rgba(108,101,95,0.16))] border-solid flex-[1_0_0] flex-col justify-center overflow-clip px-[20px] py-[9px] rounded-[10px]" variant2="inset-[-1px_-1px_calc(0%-1px)_-1px]" variant3="flex-col" variant4="gap-[5px]" variant5="leading-[1.467] text-[15px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))] tracking-[0.144px]" variant6="inset-[-1px_-1px_calc(0%-1px)_-1px]" variant7="bg-[var(--label\\/normal,#1a1815)] inset-0" />
                </div>
              </div>
              <div className="content-stretch flex flex-col items-center justify-center" data-name="Bottom Safe Area">
                <div  data-name="Filler">
                  <img alt="" className="block inset-0" src={imgFiller} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[var(--space-4,16px)] items-center p-[var(--space-4,16px)] rounded-[var(--radius\/radi-4,8px)]" data-name="Body">
        <div className="bg-[var(--background\/elevated\/alternative,#f3f1ef)] content-stretch flex flex-col gap-[var(--space-6,24px)] items-center pb-[var(--space-6,24px)] pt-[var(--space-8,32px)] rounded-[var(--radius\/radi-4,8px)]" data-name="Content">
          <div className="-translate-x-1/2" data-name="Deco">
            <img alt="" className="block inset-0" src={imgDeco} />
          </div>
          <div className="content-stretch flex flex-col gap-[var(--space-6,0px)] items-center justify-center px-[var(--space-4,16px)] rounded-[12px]" data-name="Container">
            <div className="content-stretch flex flex-col gap-[var(--space-1,4px)] items-start" data-name="Container">
              <div className="content-stretch flex items-center" data-name="Heading">
                <p className="[word-break:break-word] font-['Pretendard_JP:SemiBold'] leading-[1.429] not-italic text-[14px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.203px] whitespace-nowrap" style={{ fontFeatureSettings: '"ss10"' }}>
                  한 줄 소개
                </p>
              </div>
              <div className="content-stretch flex items-center px-[var(--space-0,0px)]">
                <p className="[word-break:break-word] flex-[1_0_0] font-['Pretendard_JP:Regular'] leading-[1.625] not-italic text-[16px] text-[color:var(--label\/normal,#1a1815)] tracking-[0.0912px]" style={{ fontFeatureSettings: '"ss10"' }}>
                  주말마다 한강 산책하는 걸 좋아해요!
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--background\/elevated\/alternative,#f3f1ef)] content-stretch flex flex-col gap-[var(--space-6,0px)] items-center overflow-clip py-[var(--space-4,16px)] rounded-[var(--radius\/radi-4,8px)]" data-name="Content">
          <div className="content-stretch flex flex-col gap-[var(--space-6,0px)] items-center justify-center px-[var(--space-4,16px)] rounded-[12px]" data-name="Container">
            <div className="content-stretch flex flex-col gap-[var(--space-4,16px)] items-start" data-name="Container">
              <div className="content-stretch flex items-center" data-name="Heading">
                <p className="[word-break:break-word] font-['Pretendard_JP:SemiBold'] leading-[1.429] not-italic text-[14px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.203px] whitespace-nowrap" style={{ fontFeatureSettings: '"ss10"' }}>
                  내 통계
                </p>
              </div>
              <div className="[word-break:break-word] content-stretch flex gap-[50px] items-center justify-center not-italic whitespace-nowrap">
                <RepeatedDiv5 />
                <RepeatedDiv5 text="3" text2="매칭 성사" />
                <RepeatedDiv5 text="2" text2="만남 횟수" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[var(--background\/elevated\/alternative,#f3f1ef)] content-stretch flex flex-col gap-[var(--space-4,16px)] items-center overflow-clip pb-[var(--space-5,20px)] pt-[var(--space-4,16px)] rounded-[var(--radius\/radi-4,8px)]" data-name="Content">
          <RepeatedDiv4 text="받은 평가" variant="flex-col gap-[var(--space-6,0px)] items-center justify-center px-[var(--space-4,16px)] rounded-[12px]" variant3="font-['Pretendard_JP:SemiBold'] leading-[1.429] text-[14px] text-[color:var(--label\\/alternative,rgba(47,43,39,0.61))] tracking-[0.203px]" />
          <div className="content-stretch flex flex-col gap-[18px] items-start">
            <div className="content-stretch flex items-end px-[var(--space-4,16px)]" data-name="Section Header/Section Header">
              <div className="content-stretch flex gap-[20px] items-center" data-name="Trailing Content">
                <div className="content-stretch flex items-center justify-center" data-name="Trailing Content">
                  <div className="content-stretch flex items-center justify-center py-[4px]" data-name="Button/Text">
                    <div className="content-stretch flex items-center justify-center" data-name="Wrapper">
                      <div className="content-stretch flex gap-[8px] items-center justify-center" data-name="Content">
                        <div className="flex flex-row items-center self-stretch">
                          <div className="content-stretch flex gap-[2px] items-center justify-center py-[2px]" data-name="Leading Icon">
                            <RepeatedDiv2 imageSrc="imgRatio1" imageSrc2="imgIconNormalStar" variant="" />
                            <RepeatedDiv2 />
                            <RepeatedDiv2 />
{/* ... 총 6개 - 전체 데이터: 아래 반복 인스턴스 데이터 참조 */}
                            
                            
                          </div>
                        </div>
                        <RepeatedDiv5 text="4.7" text2="(30)" variant="[word-break:break-word] gap-[4px] not-italic text-center whitespace-nowrap" variant2="leading-[1.412] text-[17px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))]" variant3="font-['Pretendard_JP:Medium'] leading-[1.334] text-[12px] text-[color:var(--label\\/alternative,rgba(47,43,39,0.61))] tracking-[0.3024px]" />
                      </div>
                    </div>
                    <div className="-translate-y-1/2 content-stretch flex flex-col items-center justify-center overflow-clip rounded-[6px]" data-name="Interaction">
                      <div className="bg-[var(--label\/normal,#1a1815)] flex-[1_0_0] opacity-0" data-name="Interaction" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-start flex flex-wrap gap-[8px] items-start px-[var(--space-4,16px)]">
              <RepeatedDiv3 text="대화가 편하고 좋았어요" />
              <RepeatedDiv3 text="약속 시간 잘 지켜요" />
              <RepeatedDiv3 text="친절하고 배려가 넘쳐서 좋아요" />
              <RepeatedDiv3 text="+27" variant5="leading-[1.385] text-[13px] text-[color:var(--label\\/alternative,rgba(47,43,39,0.61))] tracking-[0.2522px]" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] content-stretch flex flex-col items-start" data-name="Top Navigation/Top Navigation">
        <div className="content-stretch flex flex-col items-start" data-name="Container">
          <div className="content-stretch flex flex-col items-start" data-name="Bar">
            <div className="content-stretch flex items-start justify-center p-[16px]" data-name="Navigation">
              <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center justify-center" data-name="Content">
                <div className="content-stretch flex flex-[1_0_0] items-center justify-center" data-name="Title">
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-center px-[4px]" data-name="Wrapper">
                    <div className="[word-break:break-word] flex flex-col font-['Pretendard_JP:SemiBold'] justify-center leading-[0] not-italic overflow-hidden text-[17px] text-[color:var(--label\/strong,black)] text-center text-ellipsis whitespace-nowrap" style={{ fontFeatureSettings: '"ss10"' }}>
                      <p className="leading-[1.412] overflow-hidden text-ellipsis">내 프로필</p>
                    </div>
                  </div>
                  <div className="flex flex-row items-center self-stretch">
                    <div className="content-stretch flex items-center justify-center" data-name="Filler">
                      <div  data-name="Filler" />
                    </div>
                  </div>
                </div>
                <div className="-translate-y-1/2 content-stretch flex items-center justify-end" data-name="Trailing">
                  <div className="content-stretch flex gap-[16px] items-center justify-end" data-name="Trailing Button">
                    <div className="content-stretch flex items-center justify-center" data-name="Icon 1">
                      <div className="content-stretch flex flex-col items-center justify-center" data-name="Icon">
                        
                        <div className="inset-[-8px]" data-name="Interaction">
                          <div className="bg-[var(--label\/normal,#1a1815)] inset-0 opacity-0 rounded-[1000px]" data-name="Interaction" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div  data-name="Filler">
              <img alt="" className="block inset-0" src={imgFiller1} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[var(--background\/normal\/normal,#e9e6e2)]" data-name="Status Bar/Pro">
        <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] flex flex-col font-['SF_Pro_Text:Semibold'] justify-center leading-[0] not-italic text-[15.66px] text-black text-center tracking-[-0.28px] whitespace-nowrap">
          <p className="leading-[normal]">9:41</p>
        </div>
        <StatusPro  />
      </div>
      <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] content-stretch flex flex-col items-start" data-name="Bottom Action">
        <div className="content-stretch flex flex-col items-start justify-end" data-name="Bottom Navigation/Bottom Navigation">
          <div className="border-[var(--line\/normal\/neutral,rgba(108,101,95,0.16))] border-solid border-t inset-0" data-name="Divider" />
          <div className="backdrop-blur-[32px] content-stretch flex flex-col inset-0 items-start" data-name="Background">
            <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] flex-[1_0_0] opacity-[var(--opacity\/88,0.88)]" data-name="Background" />
          </div>
          <div className="content-stretch flex flex-col items-start" data-name="Container">
            <div className="content-stretch flex items-center justify-center" data-name="Content">
              <div className="content-stretch flex flex-[1_0_0] items-center justify-center" data-name="Container">
                <RepeatedDiv />
                <RepeatedDiv text="대화방" imageSrc="imgIcon1" />
                <RepeatedDiv text="프로필" imageSrc="imgIcon2" variant="text-[color:var(--primary\\/normal,#1a1815)]" />
              </div>
            </div>
          </div>
        </div>
        <div  data-name="Home bar/Pro">
          <div className="-translate-x-1/2 bg-[var(--theme\$\/alpha\/900,#1a1a1a)] rounded-[100px]" data-name="Home Indicator" />
        </div>
      </div>
    </div>
  );
}
```

## 반복 인스턴스 데이터: RepeatedDiv

기본값: `text="홈"`, `imageSrc="imgIcon"`, `variant="text-[color:var(--interaction\\/inactive,#8e867f)]"` (표의 `·`는 기본값과 동일)

| # | text | imageSrc | variant |
|---|---|---|---|
| 1 | `·` | `·` | `·` |
| 2 | `대화방` | `imgIcon1` | `·` |
| 3 | `프로필` | `imgIcon2` | `text-[color:var(--primary\/normal,#1a1815)]` |

## 반복 인스턴스 데이터: RepeatedDiv2

기본값: `imageSrc="imgRatio2"`, `imageSrc2="imgIconNormalStar1"`, `variant="aspect-[20/20]"` (표의 `·`는 기본값과 동일)

| # | imageSrc | imageSrc2 | variant |
|---|---|---|---|
| 1 | `imgRatio1` | `imgIconNormalStar` | `` |
| 2 | `·` | `·` | `·` |
| 3 | `·` | `·` | `·` |
| 4 | `·` | `·` | `·` |
| 5 | `·` | `·` | `` |
| 6 | `imgRatio1` | `imgIconVariant` | `flex-[1_0_0]` |

## 반복 인스턴스 데이터: RepeatedDiv3

기본값: `text="소개 노트 수정"`, `variant="px-[8px] py-[6px] rounded-[8px]"`, `variant2="bg-[var(--line\\/solid\\/alternative,rgba(221,216,211,0.52))] inset-0 rounded-[8px]"`, `variant3="gap-[2px]"`, `variant4="px-[2px]"`, `variant5="leading-[1.429] text-[14px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))] tracking-[0.203px]"`, `variant6="content-stretch flex inset-0 items-start rounded-[8px]"`, `variant7="bg-[var(--label\\/neutral,rgba(47,43,39,0.88))] flex-[1_0_0] rounded-[6px]"` (표의 `·`는 기본값과 동일)

| # | text | variant | variant2 | variant3 | variant4 | variant5 | variant6 | variant7 |
|---|---|---|---|---|---|---|---|---|
| 1 | `·` | `border border-[var(--line\/normal\/neutral,rgba(108,101,95,0.16))] border-solid flex-[1_0_0] flex-col justify-center overflow-clip px-[20px] py-[9px] rounded-[10px]` | `inset-[-1px_-1px_calc(0%-1px)_-1px]` | `flex-col` | `gap-[5px]` | `leading-[1.467] text-[15px] text-[color:var(--label\/neutral,rgba(47,43,39,0.88))] tracking-[0.144px]` | `inset-[-1px_-1px_calc(0%-1px)_-1px]` | `bg-[var(--label\/normal,#1a1815)] inset-0` |
| 2 | `대화가 편하고 좋았어요` | `·` | `·` | `·` | `·` | `·` | `·` | `·` |
| 3 | `약속 시간 잘 지켜요` | `·` | `·` | `·` | `·` | `·` | `·` | `·` |
| 4 | `친절하고 배려가 넘쳐서 좋아요` | `·` | `·` | `·` | `·` | `·` | `·` | `·` |
| 5 | `+27` | `·` | `·` | `·` | `·` | `leading-[1.385] text-[13px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.2522px]` | `·` | `·` |

## 반복 인스턴스 데이터: RepeatedDiv4

기본값: `text="개굴개굴렌"`, `variant="gap-[12px] items-start"`, `variant2=""`, `variant3="font-['Pretendard_JP:Bold'] leading-[1.334] text-[24px] text-[color:var(--label\\/normal,#1a1815)] text-center tracking-[-0.552px]"` (표의 `·`는 기본값과 동일)

| # | text | variant | variant2 | variant3 |
|---|---|---|---|---|
| 1 | `·` | `·` | `·` | `·` |
| 2 | `프로필 수정` | `flex-col items-center justify-center` | `gap-[5px] justify-center` | `font-['Pretendard_JP:Medium'] leading-[1.467] text-[15px] text-[color:var(--label\/neutral,rgba(47,43,39,0.88))] tracking-[0.144px]` |
| 3 | `받은 평가` | `flex-col gap-[var(--space-6,0px)] items-center justify-center px-[var(--space-4,16px)] rounded-[12px]` | `·` | `font-['Pretendard_JP:SemiBold'] leading-[1.429] text-[14px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.203px]` |

## 반복 인스턴스 데이터: RepeatedDiv5

기본값: `text="5"`, `text2="참여 주차"`, `variant="flex-col gap-[var(--space-\\[2px\\],2px)] justify-center"`, `variant2="leading-[1.4] text-[20px] text-[color:var(--label\\/normal,#1a1815)] tracking-[-0.24px]"`, `variant3="font-['Pretendard_JP:Regular'] leading-[1.429] text-[14px] text-[color:var(--label\\/neutral,rgba(47,43,39,0.88))] tracking-[0.203px]"` (표의 `·`는 기본값과 동일)

| # | text | text2 | variant | variant2 | variant3 |
|---|---|---|---|---|---|
| 1 | `·` | `·` | `·` | `·` | `·` |
| 2 | `3` | `매칭 성사` | `·` | `·` | `·` |
| 3 | `2` | `만남 횟수` | `·` | `·` | `·` |
| 4 | `4.7` | `(30)` | `[word-break:break-word] gap-[4px] not-italic text-center whitespace-nowrap` | `leading-[1.412] text-[17px] text-[color:var(--label\/neutral,rgba(47,43,39,0.88))]` | `font-['Pretendard_JP:Medium'] leading-[1.334] text-[12px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] tracking-[0.3024px]` |

