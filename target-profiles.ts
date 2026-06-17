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
    react: 'Replace commented `{/* SVG Icon: name */}` placeholders with `lucide-react` components. Do not hardcode raw `<svg>` tags just because the pixels differ slightly.',
    vue: 'Replace commented SVG icon placeholders with Vue icon components such as `lucide-vue-next`. Do not hardcode raw `<svg>` tags just because the pixels differ slightly.',
    svelte: 'Replace commented SVG icon placeholders with Svelte-compatible Lucide/Iconify icon components. Do not hardcode raw `<svg>` tags just because the pixels differ slightly.',
    html: 'Replace commented SVG icon placeholders with the project icon font, Iconify, or an accessible inline-safe icon include pattern. Do not copy the original Figma `<svg>` verbatim.',
};

const STYLING_GUIDANCE: Record<StylingSystem, string> = {
    tailwind: 'Carry the Tailwind utility classes into the final implementation, preserving bracket token values exactly instead of substituting approximate colors or spacing.',
    'styled-components': 'Treat Tailwind utilities in the skeleton as design-token sources only. Extract colors, spacing, typography, and radii, then convert them to `styled-components` template literal CSS.',
    emotion: 'Treat Tailwind utilities in the skeleton as design-token sources only. Extract colors, spacing, typography, and radii, then convert them to Emotion `css` prop or styled API syntax.',
    'css-modules': 'Treat Tailwind utilities in the skeleton as design-token sources only. Extract colors, spacing, typography, and radii, then convert them to CSS Modules classes and separate `.module.css` rules.',
    inline: 'Treat Tailwind utilities in the skeleton as design-token sources only. Extract colors, spacing, typography, and radii, then convert them to the target framework inline style syntax.',
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
    return `> 🚨 **CRITICAL IMPLEMENTATION INSTRUCTIONS** 🚨
> Combine the attached screenshot with the skeleton code below to implement a pixel-faithful ${profile.label} UI. Before writing code, follow these rules exactly.
>
> 1. **Layout comes from vision:** Determine horizontal/vertical arrangement, flex/grid choices, alignment, and spacing rhythm by inspecting the screenshot directly.
> 2. **Design-token values come from text:** Do not guess with approximate defaults such as \`bg-gray-100\`. Copy exact hardcoded values from the skeleton code, including hex colors, padding, font sizes, and border radii.
> 3. **Preserve copy and data:** Use the visible text and product-specific strings from the skeleton exactly. Do not invent replacement content.
> 4. **Rename asset variables semantically:** When applying imported assets with mechanical names such as \`imgVariant\`, rename them in implementation to role-based names such as \`avatarImage\` or \`logoIcon\`.
> 5. **No raw inline SVG:** ${profile.iconGuidance}
> 6. **Styling conversion:** Treat \`className\`/Tailwind utilities in the skeleton, such as \`text-[#282d32]\`, \`p-4\`, and \`rounded-lg\`, as design-token carriers. ${profile.stylingGuidance}
> 7. **Intermediate-representation comments:** JSX comments used for reuse guidance, such as \`{/* ... */}\`, are handoff notes only. Remove them or convert them naturally to the target syntax in the final ${profile.label} output.`;
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
