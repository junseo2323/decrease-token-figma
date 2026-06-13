# 🎨 Optimized Figma React Code: BatteryPro

## 🤖 AI Pre-Analysis (Ollama · llama3.2)

> **Component Summary:** This React skeleton code contains four UI components: RepeatedDiv, RepeatedDiv2, RepeatedDiv3, and two screen composition components BatteryPro and StatusPro. The RepeatedDiv and RepeatedDiv2 have similar structure with nested divs.

| 항목 | 값 |
|---|---|
| 🎨 Colors | `#1a1815` `rgba(47,43,39,0.88)` `var(--label/neutral)` `var(--opacity)` `#ffffff` `#1a1815` `#000000` |
| 📝 Texts | "매주 색다른 퀴즈를 풀어요", "1", "●○○○○", "WiFi", "Battery/Pro" |

---


## 스크린샷 파일

- /Users/seojuno/dev/AI/decrease-token-figma/benchmarks/fixtures/ditto-842-7750/reference.png

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
// 기본값: text="매주 색다른 퀴즈를 풀어요", variant="pb-[20px]"
function RepeatedDiv({ text = "매주 색다른 퀴즈를 풀어요", variant = "pb-[20px]" }: { text?: string; variant?: string }) {
  return (
    <div className={`content-stretch flex flex-[1_0_0] flex-col items-start justify-center ${variant}`} data-name="Contents">
                      <div className="content-stretch flex items-start" data-name="Wrapper">
                        <div className="content-stretch flex flex-col items-start justify-center" data-name="Label">
                          <div className="content-stretch flex items-center pr-[6px]" data-name="Wrapper">
                            <p className="[word-break:break-word] font-['Pretendard_JP:Medium'] leading-[1.5] not-italic text-[16px] text-[color:var(--label\/neutral,rgba(47,43,39,0.88))] tracking-[0.0912px] whitespace-nowrap" style={{ fontFeatureSettings: '"ss10"' }}>
                              매주 색다른 퀴즈를 풀어요
                            </p>
                          </div>
                        </div>
                        <div  data-name="Filler" />
                      </div>
                      <div  data-name="Filler" />
                    </div>
  );
}

// 기본값: imageSrc="imgContent1", variant="opacity-[var(--opacity\\/16,1)]"
function RepeatedDiv2({ imageSrc = "imgContent1", variant = "opacity-[var(--opacity\\/16,1)]" }: { imageSrc?: string; variant?: string }) {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip rounded-[1000px]" data-name="Dot ●○○○○">
                      <div className={`flex-[1_0_0] ${variant}`} data-name="Content">
                        <img alt="" className="block inset-0" src={imageSrc} />
                      </div>
                    </div>
  );
}

// 기본값: text="1"
function RepeatedDiv3({ text = "1" }: { text?: string }) {
  return (
    <div className="bg-[var(--primary\/normal,#1a1815)] content-stretch flex items-center justify-center overflow-clip rounded-[1000px]" data-name="Badge">
                          <div className="[word-break:break-word] flex flex-col font-['Pretendard_JP:SemiBold'] justify-center leading-[0] not-italic text-[12px] text-[color:var(--static\/white,white)] text-center tracking-[0.3024px] whitespace-nowrap" style={{ fontFeatureSettings: '"ss10"' }}>
                            <p className="leading-[1.334]">{text}</p>
                          </div>
                        </div>
  );
}

// 화면 구성
import img21 from './assets/BatteryPro_img21.png';

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

export default function Component11OnboardingTutorial() {
  return (
    <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] content-stretch flex flex-col items-start" data-name="1.1 Onboarding_Tutorial_1">
      <div  data-name="Status Bar/Pro">
        <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] flex flex-col font-['SF_Pro_Text:Semibold'] justify-center leading-[0] not-italic text-[15.66px] text-black text-center tracking-[-0.28px] whitespace-nowrap">
          <p className="leading-[normal]">9:41</p>
        </div>
        <StatusPro  />
      </div>
      <div className="content-stretch flex flex-col items-start" data-name="Top Navigation/Top Navigation">
        <div className="content-stretch flex flex-col items-start" data-name="Container">
          <div className="content-stretch flex flex-col items-start" data-name="Bar">
            <div className="content-stretch flex items-start justify-center p-[16px]" data-name="Navigation">
              <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center justify-center" data-name="Content">
                <div className="content-stretch flex flex-[1_0_0] items-center justify-center" data-name="Title">
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-center px-[4px]" data-name="Wrapper" />
                  <div className="flex flex-row items-center self-stretch">
                    <div className="content-stretch flex items-center justify-center" data-name="Filler">
                      <div  data-name="Filler" />
                    </div>
                  </div>
                </div>
                <div className="-translate-y-1/2 content-stretch flex items-center justify-end" data-name="Trailing">
                  <div className="content-stretch flex flex-col items-center justify-center" data-name="Icon/Normal/Close">
                    <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                      <div className="flex flex-[1_0_0] items-center justify-center">
                        <div className="rotate-[-19.47deg]">
                          <div  data-name="Ratio">
                            <img alt="" className="block inset-0" src={imgRatio} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <img alt="" className="block inset-0" src={imgIconNormalClose} />
                  </div>
                </div>
              </div>
            </div>
            <div  data-name="Filler">
              <img alt="" className="block inset-0" src={imgFiller} />
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-center" data-name="Body">
        <div className="bg-[var(--background\/normal\/normal,#e9e6e2)] content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-6,0px)] items-center justify-center" data-name="Actions">
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[var(--space-8,32px)] items-center justify-center" data-name="Container">
            <div className="content-stretch flex flex-col gap-[16px] items-center" data-name="Container">
              <div  data-name="logo">
                <div className="inset-[0_0_-1.06%_0]">
                  <img alt="" className="block" src={imgLogo} />
                </div>
              </div>
              <div className="[word-break:break-word] flex flex-col font-['Pretendard_JP:SemiBold'] justify-center leading-[0] not-italic text-[18px] text-[color:var(--label\/normal,#1a1815)] text-center tracking-[-0.0036px] whitespace-nowrap">
                <p className="leading-[1.445]">퀴즈로 만나는 새로운 인연</p>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[var(--space-1,4px)] items-center" data-name="Container">
              <div  data-name="제목_없는_아트워크-2 1">
                <div className="inset-0 overflow-hidden pointer-events-none">
                  <img alt=""  src={img21} />
                </div>
              </div>
              <div className="content-stretch flex gap-[6px] items-center" data-name="Pagination/Dot">
                <RepeatedDiv2 imageSrc="imgContent" variant="" />
                <RepeatedDiv2 />
                <RepeatedDiv2 />
              </div>
            </div>
            <div className="content-stretch flex flex-col items-center justify-center" data-name="Progress Tracker/Normal Vertical">
              <div className="content-stretch flex gap-[var(--space-2,8px)] isolate items-start" data-name="Stepper 1">
                <div className="content-stretch flex flex-col isolate items-start pr-[8px] self-stretch" data-name="Stepper">
                  <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-center" data-name="Stepper 1">
                    <RepeatedDiv3 />
                    <div className="content-stretch flex flex-[1_0_0] flex-col items-start" data-name="Divider">
                      <div className="content-stretch flex flex-[1_0_0] items-center justify-center" data-name="Container">
                        <div className="content-stretch flex inset-[-1px_0] items-center justify-center" data-name="Divider">
                          <div className="bg-[var(--line\/solid\/normal,#c7c0b9)]" data-name="Divider" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <RepeatedDiv />
              </div>
              <div className="content-stretch flex gap-[var(--space-2,8px)] isolate items-start" data-name="Stepper 2">
                <div className="content-stretch flex flex-col isolate items-start pr-[8px] self-stretch" data-name="Stepper">
                  <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-center" data-name="Stepper 2">
                    <RepeatedDiv3 text="2" />
                    <div className="content-stretch flex flex-[1_0_0] flex-col items-start" data-name="Divider">
                      <div className="content-stretch flex flex-[1_0_0] items-center justify-center" data-name="Container">
                        <div className="content-stretch flex inset-[-1px_0] items-center justify-center" data-name="Divider">
                          <div className="bg-[var(--line\/solid\/normal,#c7c0b9)]" data-name="Divider" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <RepeatedDiv text="나와 같은 답을 고른 사람에게 대화를 신청해요" />
              </div>
              <div className="content-stretch flex gap-[var(--space-2,8px)] isolate items-start" data-name="Stepper 3">
                <div className="content-stretch flex flex-col isolate items-start pr-[8px] self-stretch" data-name="Stepper">
                  <div className="content-stretch flex flex-[1_0_0] flex-col isolate items-center" data-name="Stepper 1">
                    <RepeatedDiv3 text="3" />
                  </div>
                </div>
                <RepeatedDiv text="대화를 통해 만남을 이어가요" variant="" />
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[var(--space-4,16px)] items-center justify-center px-[var(--space-4,16px)]" data-name="Actions">
          <div className="border border-[var(--primary\/normal,#1a1815)] border-solid content-stretch flex flex-col items-center justify-center overflow-clip px-[28px] py-[12px] rounded-[12px]" data-name="Button/Outlined">
            <div className="content-stretch flex flex-col items-center justify-center" data-name="Wrapper">
              <div className="content-stretch flex gap-[6px] items-center justify-center" data-name="Content">
                <div className="flex flex-row items-center self-stretch">
                  <div className="content-stretch flex items-center justify-center" data-name="Leading Icon">
                    <div className="content-stretch flex flex-col items-center justify-center" data-name="Leading Icon">
                      <div className="content-stretch flex flex-[1_0_0] flex-col items-center justify-center" data-name="Name=logoKakao">
                        <div className="content-stretch flex flex-[1_0_0] flex-col items-start overflow-clip" data-name="Ratio">
                          <div className="flex flex-[1_0_0] items-center justify-center">
                            <div className="rotate-[-19.47deg]">
                              <div  data-name="Ratio">
                                <img alt="" className="block inset-0" src={imgRatio} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="inset-[13.14%_10.71%_13.15%_10.72%]" data-name="Color">
                          <img alt="" className="block inset-0" src={imgColor} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="[word-break:break-word] font-['Pretendard_JP:SemiBold'] leading-[1.5] not-italic text-[16px] text-[color:var(--label\/normal,#1a1815)] tracking-[0.0912px] whitespace-nowrap" style={{ fontFeatureSettings: '"ss10"' }}>
                  카카오로 계속하기
                </p>
              </div>
            </div>
            <div className="inset-[-1px] overflow-clip" data-name="Interaction">
              <div className="bg-[var(--primary\/normal,#1a1815)] inset-0 opacity-0" data-name="Interaction" />
            </div>
          </div>
          <p className="[word-break:break-word] font-['Pretendard_JP:Regular'] leading-[0] not-italic text-[0px] text-[color:var(--label\/alternative,rgba(47,43,39,0.61))] text-center tracking-[0.3024px]" style={{ fontFeatureSettings: '"ss10"' }}>
            <span className="leading-[1.334] text-[12px]" style={{ fontFeatureSettings: '"ss10"' }}>{`회원가입 시 `}</span>
            <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-['Pretendard_JP:SemiBold'] leading-[1.334] text-[12px] underline" style={{ fontFeatureSettings: '"ss10"' }}>
              이용약관
            </span>
            <span className="leading-[1.334] text-[12px]" style={{ fontFeatureSettings: '"ss10"' }}>{` 및 `}</span>
            <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-from-font decoration-solid font-['Pretendard_JP:Bold'] leading-[1.334] text-[12px] underline" style={{ fontFeatureSettings: '"ss10"' }}>
              개인정보처리방침
            </span>
            <span className="leading-[1.334] text-[12px]" style={{ fontFeatureSettings: '"ss10"' }}>
              에 동의하는 것으로 간주됩니다.
            </span>
          </p>
        </div>
      </div>
      <div  data-name="Home bar/Pro">
        <div className="-translate-x-1/2 bg-[var(--theme\$\/alpha\/900,#1a1a1a)] rounded-[100px]" data-name="Home Indicator" />
      </div>
    </div>
  );
}
```

## 반복 인스턴스 데이터: RepeatedDiv

기본값: `text="매주 색다른 퀴즈를 풀어요"`, `variant="pb-[20px]"` (표의 `·`는 기본값과 동일)

| # | text | variant |
|---|---|---|
| 1 | `·` | `·` |
| 2 | `나와 같은 답을 고른 사람에게 대화를 신청해요` | `·` |
| 3 | `대화를 통해 만남을 이어가요` | `` |

## 반복 인스턴스 데이터: RepeatedDiv2

기본값: `imageSrc="imgContent1"`, `variant="opacity-[var(--opacity\\/16,1)]"` (표의 `·`는 기본값과 동일)

| # | imageSrc | variant |
|---|---|---|
| 1 | `imgContent` | `` |
| 2 | `·` | `·` |
| 3 | `·` | `·` |

## 반복 인스턴스 데이터: RepeatedDiv3

기본값: `text="1"` (표의 `·`는 기본값과 동일)

| # | text |
|---|---|
| 1 | `·` |
| 2 | `2` |
| 3 | `3` |

