export type TargetFramework = 'react' | 'vue' | 'svelte' | 'html';
export type StylingSystem = 'tailwind' | 'styled-components' | 'emotion' | 'css-modules' | 'inline';

export interface TargetProfile {
    framework: TargetFramework;
    styling: StylingSystem;
    label: string;
    codeFenceLang: string;
    iconGuidance: string;
    stylingGuidance: string;
    componentExtensions: string[];
}

const FRAMEWORK_LABELS: Record<TargetFramework, string> = {
    react: 'React',
    vue: 'Vue',
    svelte: 'Svelte',
    html: 'HTML',
};

const CODE_FENCE_LANGS: Record<TargetFramework, string> = {
    react: 'tsx',
    vue: 'vue',
    svelte: 'svelte',
    html: 'html',
};

const COMPONENT_EXTENSIONS: Record<TargetFramework, string[]> = {
    react: ['.tsx', '.jsx'],
    vue: ['.vue'],
    svelte: ['.svelte'],
    html: ['.html'],
};

const ICON_GUIDANCE: Record<TargetFramework, string> = {
    react: '주석 처리된 `{/* SVG Icon: 이름 */}` 부분은 `lucide-react` 컴포넌트로 대체하라. 픽셀이 조금 다르다는 이유로 `<svg>` 태그를 직접 하드코딩하지 마라.',
    vue: '주석 처리된 SVG 아이콘 placeholder는 `lucide-vue-next` 같은 Vue 아이콘 컴포넌트로 대체하라. 픽셀이 조금 다르다는 이유로 `<svg>` 태그를 직접 하드코딩하지 마라.',
    svelte: '주석 처리된 SVG 아이콘 placeholder는 Svelte에서 사용할 수 있는 Lucide/Iconify 계열 아이콘 컴포넌트로 대체하라. 픽셀이 조금 다르다는 이유로 `<svg>` 태그를 직접 하드코딩하지 마라.',
    html: '주석 처리된 SVG 아이콘 placeholder는 프로젝트에서 쓰는 아이콘 폰트, Iconify, 또는 접근 가능한 inline-safe 아이콘 include 방식으로 대체하라. 원본 Figma `<svg>`를 그대로 복사하지 마라.',
};

const STYLING_GUIDANCE: Record<StylingSystem, string> = {
    tailwind: '뼈대 코드의 Tailwind 유틸 클래스는 최종 구현에서도 Tailwind 클래스 체계로 옮기되, 임의의 유사 색상/간격으로 바꾸지 말고 bracket token 값을 그대로 보존하라.',
    'styled-components': '뼈대 코드의 Tailwind 유틸 클래스는 디자인 토큰의 출처로만 보고, 색상/간격/폰트/둥글기 값을 추출해 `styled-components` 템플릿 리터럴 CSS로 변환하라.',
    emotion: '뼈대 코드의 Tailwind 유틸 클래스는 디자인 토큰의 출처로만 보고, 색상/간격/폰트/둥글기 값을 추출해 Emotion `css` prop 또는 styled API 문법으로 변환하라.',
    'css-modules': '뼈대 코드의 Tailwind 유틸 클래스는 디자인 토큰의 출처로만 보고, 색상/간격/폰트/둥글기 값을 추출해 CSS Modules 클래스와 별도 `.module.css` 규칙으로 변환하라.',
    inline: '뼈대 코드의 Tailwind 유틸 클래스는 디자인 토큰의 출처로만 보고, 색상/간격/폰트/둥글기 값을 추출해 타겟 프레임워크의 inline style 문법으로 변환하라.',
};

export function resolveProfile(target?: string, styling?: string): TargetProfile {
    const framework = parseFramework(target);
    const stylingSystem = parseStyling(styling);

    return {
        framework,
        styling: stylingSystem,
        label: FRAMEWORK_LABELS[framework],
        codeFenceLang: CODE_FENCE_LANGS[framework],
        iconGuidance: ICON_GUIDANCE[framework],
        stylingGuidance: STYLING_GUIDANCE[stylingSystem],
        componentExtensions: COMPONENT_EXTENSIONS[framework],
    };
}

export function buildInstructionBlock(profile: TargetProfile): string {
    if (profile.framework === 'react' && profile.styling === 'tailwind') {
        return `> 🚨 **[매우 중요] LLM 행동 교정 지시사항 (CRITICAL INSTRUCTION)** 🚨
> 너는 지금 전달받은 스크린샷과 아래의 뼈대 코드를 결합하여 완벽한 UI를 구현해야 한다. 코드를 작성하기 전, 반드시 아래의 5가지 원칙을 100% 준수해라.
>
> 1. **레이아웃(배치)은 '비전' 기반:** 요소들의 가로/세로 배치(flex, grid 등)와 전체적인 여백의 비율은 함께 전달된 **'스크린샷 이미지'를 눈으로 직접 확인**하고 구성해라.
> 2. **정확한 수치(디자인 토큰)는 '텍스트' 기반:** 색상, 폰트 크기, 패딩, 둥글기 값은 네가 임의로 기본 클래스(bg-gray-100 등)로 때려 맞추지 마라. **반드시 아래 '뼈대 코드'에 하드코딩되어 있는 정확한 값(Hex 코드, 패딩 수치 등)을 100% 그대로 복사해서 사용해라.**
> 3. **문구 및 데이터 보존:** 뼈대 코드에 있는 실제 텍스트(서비스 고유 명사 등)는 절대 환각으로 지어내지 말고 그대로 적용해라.
> 4. **에셋 변수명 리팩토링 필수:** 상단에 import 된 무의미한 변수명(\`imgVariant\` 등)은 컴포넌트에 적용할 때 반드시 \`avatarImage\`, \`logoIcon\` 등 역할에 맞는 시맨틱한 이름으로 변경해라.
> 5. **인라인 SVG 금지:** 주석 처리된 \`{/* SVG Icon: 이름 */}\` 부분은 무조건 \`lucide-react\` 컴포넌트로 대체하라. 픽셀이 조금 다르다는 이유로 절대 \`<svg>\` 태그를 직접 하드코딩하지 마라.`;
    }

    return `> 🚨 **[매우 중요] LLM 행동 교정 지시사항 (CRITICAL INSTRUCTION)** 🚨
> 너는 지금 전달받은 스크린샷과 아래의 뼈대 코드를 결합하여 완벽한 ${profile.label} UI를 구현해야 한다. 코드를 작성하기 전, 반드시 아래 원칙을 100% 준수해라.
>
> 1. **레이아웃(배치)은 '비전' 기반:** 요소들의 가로/세로 배치(flex, grid 등)와 전체적인 여백의 비율은 함께 전달된 **'스크린샷 이미지'를 눈으로 직접 확인**하고 구성해라.
> 2. **정확한 수치(디자인 토큰)는 '텍스트' 기반:** 색상, 폰트 크기, 패딩, 둥글기 값은 네가 임의로 기본 클래스(bg-gray-100 등)로 때려 맞추지 마라. **반드시 아래 '뼈대 코드'에 하드코딩되어 있는 정확한 값(Hex 코드, 패딩 수치 등)을 100% 그대로 복사해서 사용해라.**
> 3. **문구 및 데이터 보존:** 뼈대 코드에 있는 실제 텍스트(서비스 고유 명사 등)는 절대 환각으로 지어내지 말고 그대로 적용해라.
> 4. **에셋 변수명 리팩토링 필수:** 상단에 import 된 무의미한 변수명(\`imgVariant\` 등)은 컴포넌트에 적용할 때 반드시 \`avatarImage\`, \`logoIcon\` 등 역할에 맞는 시맨틱한 이름으로 변경해라.
> 5. **인라인 SVG 금지:** ${profile.iconGuidance}
> 6. **스타일링 변환:** 아래 뼈대의 \`className\`/Tailwind 유틸 클래스(\`text-[#282d32]\`, \`p-4\`, \`rounded-lg\` 등)는 디자인 토큰의 출처일 뿐이다. ${profile.stylingGuidance}
> 7. **중간표현 주석 처리:** 반복 컴포넌트 안내용 JSX 주석(\`{/* ... */}\`)은 핸드오프 메모일 뿐이며, 최종 ${profile.label} 출력에서는 타겟 문법에 맞게 제거하거나 자연스럽게 변환하라.`;
}

export function getProfileHandoffFilename(profile: TargetProfile): string {
    if (profile.framework === 'react' && profile.styling === 'tailwind') return 'handoff.md';
    return `handoff.${profile.framework}-${profile.styling}.md`;
}

export function getPrimaryComponentExtension(profile: TargetProfile): string {
    return profile.componentExtensions[0] ?? '.tsx';
}

function parseFramework(value?: string): TargetFramework {
    if (value === 'react' || value === 'vue' || value === 'svelte' || value === 'html') return value;
    return 'react';
}

function parseStyling(value?: string): StylingSystem {
    if (
        value === 'tailwind'
        || value === 'styled-components'
        || value === 'emotion'
        || value === 'css-modules'
        || value === 'inline'
    ) {
        return value;
    }
    return 'tailwind';
}
