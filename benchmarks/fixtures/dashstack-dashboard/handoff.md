# 🎨 Optimized Figma React Code: Dashboard

## 🤖 AI Pre-Analysis (Ollama · llama3.2)

> **Component Summary:** Reusable UI components for dashboard layout

| Item | Value |
|---|---|
| Colors | `#f5f6fa` `#202224` `#282d32` `#rgba(41,44,47,0.4)` |
| Texts | "Logout", "Repeated", "Profit", "2026" |

---


## Screenshot Files

- /Users/seojuno/dev/AI/decrease-token-figma/benchmarks/fixtures/dashstack-dashboard/reference.png

> Before deciding layout, read the image file paths above with the Read tool.

---


> 🚨 **CRITICAL IMPLEMENTATION INSTRUCTIONS** 🚨
> Combine the attached screenshot with the skeleton code below to implement a pixel-faithful React UI. Before writing code, follow these rules exactly.
>
> 1. **Layout comes from vision:** Determine horizontal/vertical arrangement, flex/grid choices, alignment, and spacing rhythm by inspecting the screenshot directly.
> 2. **Design-token values come from text:** Do not guess with approximate defaults such as `bg-gray-100`. Copy exact hardcoded values from the skeleton code, including hex colors, padding, font sizes, and border radii.
> 3. **Preserve copy and data:** Use the visible text and product-specific strings from the skeleton exactly. Do not invent replacement content.
> 4. **Rename asset variables semantically:** When applying imported assets with mechanical names such as `imgVariant`, rename them in implementation to role-based names such as `avatarImage` or `logoIcon`.
> 5. **No raw inline SVG:** Replace commented `{/* SVG Icon: name */}` placeholders with `lucide-react` components. Do not hardcode raw `<svg>` tags just because the pixels differ slightly.
> 6. **Styling conversion:** Treat `className`/Tailwind utilities in the skeleton, such as `text-[#282d32]`, `p-4`, and `rounded-lg`, as design-token carriers. Carry the Tailwind utility classes into the final implementation, preserving bracket token values exactly instead of substituting approximate colors or spacing.
> 7. **Intermediate-representation comments:** JSX comments used for reuse guidance, such as `{/* ... */}`, are handoff notes only. Remove them or convert them naturally to the target syntax in the final React output.

```tsx
// Repeated component definitions
// Defaults: text="Logout", variant="inset-[86.82%_83.33%_8.5%_0]"
function RepeatedDiv({ text = "Logout", variant = "inset-[86.82%_83.33%_8.5%_0]" }: { text?: string; variant?: string }) {
  return (
    <div className={variant} data-name="Navigation / Sidebar Item / Light">
              <div className="contents inset-0" data-name="Products">
                <div className="bg-white inset-0 opacity-0" data-name="Hide Bg" />
                <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[normal] text-[#202224] text-[14px] tracking-[0.3px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
                  Logout
                </p>
                <p className="[word-break:break-word] font-['Gilroy:Medium'] leading-[normal] not-italic text-[#202224] text-[22px] text-center whitespace-nowrap">{`\uF2C6`}</p>
              </div>
            </div>
  );
}

// Defaults: text="Repeated", imageSrc="imgOval1", variant="inset-[92.34%_59.24%_5.79%_34.51%]", variant2="font-['Nunito_Sans:Bold'] font-bold", variant3="inset-[92.71%_64.65%_6.17%_34.51%]"
function RepeatedDiv2({ text = "Repeated", imageSrc = "imgOval1", variant = "inset-[92.34%_59.24%_5.79%_34.51%]", variant2 = "font-['Nunito_Sans:Bold'] font-bold", variant3 = "inset-[92.71%_64.65%_6.17%_34.51%]" }: { text?: string; imageSrc?: string; variant?: string; variant2?: string; variant3?: string }) {
  return (
    <div className={`contents ${variant}`} data-name="Group">
                <p className={`[word-break:break-word] leading-[20px] text-[#282d32] text-[16px] whitespace-nowrap ${variant2}`} style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
                  Repeated
                </p>
                <div className={variant3} data-name="Oval">
                  <img alt="" className="block inset-0" src={imageSrc} />
                </div>
              </div>
  );
}

// Defaults: imageSrc="imgLine3", variant="inset-[70.7%_63.65%_15.65%_26.22%]", variant2="inset-[35%_0]"
function RepeatedDiv3({ imageSrc = "imgLine3", variant = "inset-[70.7%_63.65%_15.65%_26.22%]", variant2 = "inset-[35%_0]" }: { imageSrc?: string; variant?: string; variant2?: string }) {
  return (
    <div className={variant} data-name="Profit">
              <div className={variant2}>
                <img alt="" className="block" src={imageSrc} />
              </div>
            </div>
  );
}

// Screen composition
import imgALLEFVINICIUS343875Unsplash1 from './assets/Dashboard_imgALLEFVINICIUS343875Unsplash1.png';
import imgUkFlag1 from './assets/Dashboard_imgUkFlag1.png';

function Dashboard() {
  return (
    <div className="bg-white" data-name="Dashboard  # 2">
      <div className="inset-[0_-0.07%_0_16.6%]" data-name="Main Bg Color">
        <div className="bg-[#f5f6fa] inset-0" data-name="Main Bg" />
      </div>
      <div className="inset-[0_0.03%_0_16.6%]" data-name="Separator">
        <img alt="" className="block inset-0" src={imgSeparator} />
      </div>
      <div className="contents inset-[63.08%_2.08%_2.8%_72.92%]" data-name="Featured Product">
        <div className="bg-white inset-[63.08%_2.08%_2.8%_72.92%] rounded-[14px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" data-name="Bg" />
        <RepeatedDiv3 imageSrc="imgProfit" variant="inset-[71.68%_3.4%_7.01%_75.83%]" variant2="inset-[-0.31%_-0.23%]" />
        <RepeatedDiv3 imageSrc="imgSales" variant="inset-[70.84%_4.79%_12.52%_75.83%]" variant2="inset-[-0.39%_-0.25%]" />
        <RepeatedDiv3 imageSrc="imgLine2" variant="inset-[92.52%_3.19%_7.38%_76.11%]" />
{/* ... 14 total items. See repeated instance data below for the full dataset. */}
        
        
        
        
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          2026
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          2018
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          2017
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          2016
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          2015
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] text-right whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          0
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] text-right whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          25
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] text-right whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          50
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] text-right whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          75
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(41,44,47,0.4)] text-right whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          100
        </p>
        <div className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[0] text-[#202224] text-[22px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          <p className="leading-[20px] mb-0">Sales Analytics</p>
          <p className="leading-[20px]">​</p>
        </div>
      </div>
      <div className="contents inset-[63.08%_29.17%_2.8%_45.83%]" data-name="Featured Product">
        <div className="bg-white inset-[63.08%_29.17%_2.8%_45.83%] rounded-[14px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" data-name="Bg" />
        <div className="inset-[78.22%_30.28%_17.94%_66.88%]" data-name="Right arrow">
          <img alt="" className="block inset-0" src={imgRightArrow} />
        </div>
        <div className="flex inset-[78.22%_50.21%_17.94%_46.94%] items-center justify-center" style={{ containerType: "size" }}>
          <div className="-scale-x-100">
            <div  data-name="Left">
              <img alt="" className="block inset-0" src={imgLeft} />
            </div>
          </div>
        </div>
        <div className="inset-[69.35%_36.53%_13.28%_53.26%]" data-name="Bitmap" />
        <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[20px] text-[#282d32] text-[18px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          Beats Headphone 2026
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[20px] opacity-70 text-[#4880ff] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          $89.00
        </p>
        <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[20px] text-[#202224] text-[22px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          Featured Product
        </p>
      </div>
      <div className="contents inset-[63.08%_56.25%_2.8%_18.75%]" data-name="Customers">
        <div className="bg-white inset-[63.08%_56.25%_2.8%_18.75%] rounded-[14px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" data-name="Bg" />
        <div className="contents inset-[70.7%_63.65%_15.65%_26.22%]" data-name="body">
          
          
        </div>
        <div className="contents inset-[88.04%_68.96%_5.79%_21.6%]" data-name="New Customers">
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[20px] opacity-80 text-[#282d32] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            New Customers
          </p>
          <div className="inset-[92.71%_77.57%_6.17%_21.6%]" data-name="Oval">
            <img alt="" className="block inset-0" src={imgOval} />
          </div>
          <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[normal] text-[#202224] text-[28px] tracking-[1px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            34,249
          </p>
        </div>
        <div className="contents inset-[88.04%_59.24%_5.79%_34.51%]" data-name="Repeated">
          <RepeatedDiv2 variant2="font-['Nunito_Sans:SemiBold'] font-semibold opacity-80" />
          <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[normal] text-[#202224] text-[28px] text-center tracking-[1px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            1420
          </p>
        </div>
        <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[20px] text-[#202224] text-[22px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          Customers
        </p>
      </div>
      <div className="contents inset-[15.61%_2.22%_39.72%_18.75%]" data-name="Revenue">
        
        <RepeatedDiv2 text="Profit" imageSrc="imgOval2" variant="inset-[55.51%_34.86%_42.62%_60.28%]" variant3="inset-[55.79%_38.89%_43.08%_60.28%]" />
        <RepeatedDiv2 text="Sales" imageSrc="imgOval3" variant="inset-[55.51%_43.82%_42.62%_51.46%]" variant3="inset-[55.79%_47.71%_43.08%_51.46%]" />
        <div className="contents inset-[25.7%_4.44%_48.32%_20.97%]" data-name="units">
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            40k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            45k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            50k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            55k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            60k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            5k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            10k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            15k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            20k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            25k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            35k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            30k
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            20
          </p>
          <div className="inset-[26.07%_4.44%_51.78%_26.25%]" data-name="Line">
            <img alt="" className="block inset-0" src={imgLine} />
          </div>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            40
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            60
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            80
          </p>
          <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[9px] text-[12px] text-[rgba(43,48,52,0.4)] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            100
          </p>
        </div>
        <div className="inset-[28.59%_4.17%_51.87%_26.53%]" data-name="Graph">
          <img alt="" className="block inset-0" src={imgGraph} />
        </div>
        <div className="contents inset-[18.6%_4.44%_78.79%_88.33%]" data-name="Month selector">
          <div className="bg-[#fcfdfd] border-[#d5d5d5] border-[0.6px] border-solid inset-[18.6%_4.44%_78.79%_88.33%] rounded-[4px]" data-name="Rectangle" />
          <div className="contents inset-[19.44%_5.56%_79.63%_89.51%]" data-name="Month">
            <div className="inset-[19.44%_5.56%_79.63%_93.75%]" data-name="icon_chevron-down">
              <img alt="" className="block inset-0" src={imgIconChevronDown} />
            </div>
            <p className="[word-break:break-word] font-['Circular_Std:Medium'] leading-[10px] not-italic text-[12px] text-[rgba(43,48,52,0.4)] text-right whitespace-nowrap">
              October
            </p>
          </div>
        </div>
        <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[20px] text-[#202224] text-[24px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          Revenue
        </p>
      </div>
      <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[normal] text-[#202224] text-[32px] tracking-[-0.1143px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
        Dashboard
      </p>
      <div className="inset-[0_-0.07%_93.46%_16.67%]" data-name="Navigation / Top Bar #1">
        <div className="contents inset-0" data-name="Navigation / Top Bar #1">
          <div className="bg-white inset-0" data-name="Top Bar Bg" />
          <div className="contents inset-[18.57%_2.58%_18.57%_83.35%]" data-name="Profile">
            
            <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[normal] text-[#404040] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
              Moni Roy
            </p>
            <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[normal] text-[#565656] text-[12px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
              Admin
            </p>
            <div className="contents inset-[18.57%_12.99%_18.57%_83.35%]" data-name="man-438081_960_720">
              <div className="inset-[18.57%_12.99%_18.57%_83.35%]" data-name="Mask">
                <img alt="" className="block inset-0" src={imgMask} />
              </div>
              <div className="inset-[11.43%_12.66%_14.29%_83.18%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2px_5px] mask-" style={{ maskImage: `url("${imgALLEFVINICIUS343875Unsplash}")` }} data-name="a-l-l-e-f-v-i-n-i-c-i-u-s-343875-unsplash">
                <div className="inset-0 overflow-hidden pointer-events-none">
                  <img alt=""  src={imgALLEFVINICIUS343875Unsplash1} />
                </div>
              </div>
            </div>
          </div>
          <div className="contents inset-[31.43%_18.89%_30%_70.86%]" data-name="English">
            <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[normal] text-[#646464] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
              English
            </p>
            <div className="inset-[45.24%_18.89%_48.1%_80.43%]" data-name="Drop Down">
              <img alt="" className="block inset-0" src={imgDropDown} />
            </div>
            <div className="contents inset-[31.43%_25.81%_30%_70.86%]" data-name="Flag">
              <div className="bg-[#d8d8d8] inset-[31.43%_25.81%_30%_70.86%] rounded-[5px]" data-name="Mask" />
              <div className="inset-[31.43%_25.81%_30%_70.86%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-" style={{ maskImage: `url("${imgUkFlag}")` }} data-name="UK Flag">
                <div className="inset-0 overflow-hidden pointer-events-none">
                  <img alt=""  src={imgUkFlag1} />
                </div>
              </div>
            </div>
          </div>
          <div className="contents inset-[27.14%_31.31%_29.29%_66.28%]" data-name="Icon">
            <div className="inset-[34.29%_31.72%_29.29%_66.28%]" data-name="icon">
              <img alt="" className="block inset-0" src={imgIcon} />
            </div>
            <div  data-name="Oval">
              <img alt="" className="block inset-0" src={imgOval4} />
            </div>
            <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[normal] text-[12px] text-white whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
              6
            </p>
          </div>
          <div className="inset-[25.71%_31.22%_48.57%_67.28%]" data-name="Oval">
            <img alt="" className="block inset-0" src={imgOval5} />
          </div>
          <div className="contents inset-[32.86%_95.5%_30%_2.5%]" data-name="Icon">
            <div className="inset-[32.86%_95.5%_32.86%_2.5%] opacity-90" data-name="Path">
              <img alt="" className="block inset-0" src={imgPath} />
            </div>
            <p className="[word-break:break-word] font-['Gilroy:Medium'] leading-[normal] not-italic opacity-90 text-[#202224] text-[22px] text-center whitespace-nowrap">{`\uF131`}</p>
          </div>
          <div className="contents inset-[22.86%_61.2%_22.86%_6.49%]" data-name="Search">
            <div className="bg-[#f5f6fa] border-[#d5d5d5] border-[0.6px] border-solid inset-[22.86%_61.2%_22.86%_6.49%] rounded-[19px]" data-name="Bg" />
            <p className="[word-break:break-word] font-['Nunito_Sans:Regular'] font-normal leading-[normal] opacity-50 text-[#202224] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
              Search
            </p>
            
          </div>
        </div>
      </div>
      <div className="contents inset-[0_83.33%_0_0]" data-name="Navigation / Sidebar Menu / Light">
        <div className="bg-white inset-[0_83.33%_0_0]" data-name="Side Bar Bg" />
        <RepeatedDiv />
        <RepeatedDiv text="Settings" variant="inset-[82.15%_83.33%_13.18%_0]" />
        
        <RepeatedDiv text="Table" variant="inset-[74.39%_83.33%_20.93%_0]" />
{/* ... 15 total items. See repeated instance data below for the full dataset. */}
        
        
        
        
        
        
        
        <p className="[word-break:break-word] font-['Nunito_Sans:Bold'] font-bold leading-[normal] opacity-60 text-[#202224] text-[12px] tracking-[0.2571px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
          PAGES
        </p>
        
        
        
        
        
        
        <div className="inset-[7.57%_83.33%_87.76%_0]" data-name="Navigation / Sidebar Item / Light">
          <div className="contents inset-0" data-name="Products">
            <div className="contents inset-0" data-name="Hide Bg + Hide Bg Copy Mask">
              <div className="bg-white inset-0 opacity-0" data-name="Mask" />
              <div className="bg-[#4880ff] inset-[0_10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-24px_0px] mask- rounded-[6px]" style={{ maskImage: `url("${imgHideBg}")` }} data-name="Hide Bg" />
              <div className="bg-[#4880ff] inset-[0_98.33%_0_-2.08%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[5px_0px] mask- rounded-[4px]" style={{ maskImage: `url("${imgHideBg}")` }} data-name="Hide Bg Copy" />
            </div>
            <p className="[word-break:break-word] font-['Nunito_Sans:SemiBold'] font-semibold leading-[normal] text-[14px] text-white tracking-[0.3px] whitespace-nowrap" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
              Dashboard
            </p>
            <p className="[word-break:break-word] font-['Gilroy:Medium'] leading-[normal] not-italic text-[22px] text-center text-white whitespace-nowrap">{`\uF1B2`}</p>
          </div>
        </div>
        <div className="-translate-y-1/2" data-name="Logo">
          <p className="[word-break:break-word] font-['Nunito_Sans:ExtraBold'] font-extrabold leading-[0] text-[#4880ff] text-[20px]" style={{ fontVariationSettings: '"YTLC" 500, "wdth" 100' }}>
            <span className="leading-[normal]">Dash</span>
            <span className="leading-[normal] text-[#202224]">Stack</span>
          </p>
        </div>
      </div>
    </div>
  );
}
```

## Repeated Instance Data: RepeatedDiv

Defaults: `text="Logout"`, `variant="inset-[86.82%_83.33%_8.5%_0]"` (a table value of `·` means "same as default")

| # | text | variant |
|---|---|---|
| 1 | `·` | `·` |
| 2 | `Settings` | `inset-[82.15%_83.33%_13.18%_0]` |
| 3 | `Table` | `inset-[74.39%_83.33%_20.93%_0]` |
| 4 | `Team` | `inset-[69.72%_83.33%_25.61%_0]` |
| 5 | `UI Elements` | `inset-[65.05%_83.33%_30.28%_0]` |
| 6 | `Invoice` | `inset-[60.37%_83.33%_34.95%_0]` |
| 7 | `Contact` | `inset-[55.7%_83.33%_39.63%_0]` |
| 8 | `To-Do` | `inset-[51.03%_83.33%_44.3%_0]` |
| 9 | `Calender` | `inset-[46.36%_83.33%_48.97%_0]` |
| 10 | `Pricing` | `inset-[41.68%_83.33%_53.64%_0]` |
| 11 | `Product Stock` | `inset-[30.93%_83.33%_64.39%_0]` |
| 12 | `Order Lists` | `inset-[26.26%_83.33%_69.07%_0]` |
| 13 | `Inbox` | `inset-[21.59%_83.33%_73.74%_0]` |
| 14 | `Favorites` | `inset-[16.92%_83.33%_78.41%_0]` |
| 15 | `Products` | `inset-[12.24%_83.33%_83.08%_0]` |

## Repeated Instance Data: RepeatedDiv2

Defaults: `text="Repeated"`, `imageSrc="imgOval1"`, `variant="inset-[92.34%_59.24%_5.79%_34.51%]"`, `variant2="font-['Nunito_Sans:Bold'] font-bold"`, `variant3="inset-[92.71%_64.65%_6.17%_34.51%]"` (a table value of `·` means "same as default")

| # | text | imageSrc | variant | variant2 | variant3 |
|---|---|---|---|---|---|
| 1 | `·` | `·` | `·` | `font-['Nunito_Sans:SemiBold'] font-semibold opacity-80` | `·` |
| 2 | `Profit` | `imgOval2` | `inset-[55.51%_34.86%_42.62%_60.28%]` | `·` | `inset-[55.79%_38.89%_43.08%_60.28%]` |
| 3 | `Sales` | `imgOval3` | `inset-[55.51%_43.82%_42.62%_51.46%]` | `·` | `inset-[55.79%_47.71%_43.08%_51.46%]` |

## Repeated Instance Data: RepeatedDiv3

Defaults: `imageSrc="imgLine3"`, `variant="inset-[70.7%_63.65%_15.65%_26.22%]"`, `variant2="inset-[35%_0]"` (a table value of `·` means "same as default")

| # | imageSrc | variant | variant2 |
|---|---|---|---|
| 1 | `imgProfit` | `inset-[71.68%_3.4%_7.01%_75.83%]` | `inset-[-0.31%_-0.23%]` |
| 2 | `imgSales` | `inset-[70.84%_4.79%_12.52%_75.83%]` | `inset-[-0.39%_-0.25%]` |
| 3 | `imgLine2` | `inset-[92.52%_3.19%_7.38%_76.11%]` | `·` |
| 4 | `·` | `inset-[87.01%_3.19%_12.9%_76.11%]` | `·` |
| 5 | `·` | `inset-[81.5%_3.19%_18.41%_76.11%]` | `·` |
| 6 | `·` | `inset-[75.98%_3.19%_23.93%_76.11%]` | `·` |
| 7 | `·` | `inset-[70.47%_3.19%_29.44%_76.11%]` | `·` |
| 8 | `imgBgColor` | `·` | `inset-[-5.14%]` |
| 9 | `imgMainColor` | `·` | `inset-[-5.14%]` |
| 10 | `imgCard` | `inset-[15.61%_2.22%_39.72%_18.75%]` | `inset-[-10.04%_-5.27%_-12.55%_-4.22%]` |
| 11 | `imgMore` | `inset-[37.14%_2.58%_37.14%_95.92%]` | `inset-[-1.11%]` |
| 12 | `imgSearch` | `inset-[37.93%_90.88%_40.63%_7.87%]` | `inset-[0_-4%_-4%_0]` |
| 13 | `imgDivider` | `inset-[80.56%_83.33%_19.35%_0]` | `inset-[20%_0]` |
| 14 | `imgDivider` | `inset-[37.1%_83.33%_62.8%_0]` | `inset-[20%_0]` |

