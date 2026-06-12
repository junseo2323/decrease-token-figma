import * as path from 'path';

export interface BridgePaths {
    projectRoot: string;
    cacheDir: string;
    assetDir: string;
}

export function resolveProjectRoot(input?: unknown): string {
    const value = typeof input === 'string' && input.trim()
        ? input.trim()
        : process.env.FIGMA_BRIDGE_ROOT || process.env.FIGMA_BRIDGE_PROJECT_ROOT || process.env.PROJECT_ROOT || process.cwd();

    return path.resolve(value);
}

export function resolveBridgePaths(projectRootInput?: unknown): BridgePaths {
    const projectRoot = resolveProjectRoot(projectRootInput);
    const cacheDir = process.env.FIGMA_BRIDGE_CACHE_DIR
        ? path.resolve(process.env.FIGMA_BRIDGE_CACHE_DIR)
        : path.join(projectRoot, '.figma_cache');

    const assetDir = process.env.FIGMA_BRIDGE_ASSET_DIR
        ? path.resolve(process.env.FIGMA_BRIDGE_ASSET_DIR)
        : path.join(projectRoot, 'src', 'assets');

    return { projectRoot, cacheDir, assetDir };
}
