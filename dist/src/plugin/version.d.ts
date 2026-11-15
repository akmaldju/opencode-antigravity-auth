/**
 * Remote Antigravity Hub version fetcher.
 *
 * Resolution strategy:
 *   1. Hub auto-updater manifest (electron-builder YAML, `version:` field)
 *   2. Hardcoded fallback in constants.ts
 *
 * Manifest versions below ANTIGRAVITY_MINIMUM_VERSION are rejected because Cloud
 * Code no longer serves newer models to those clients. Selecting a version below
 * the minimum is what produced the "This version of Antigravity is no longer
 * supported" answer on every request.
 *
 * @see https://github.com/router-for-me/CLIProxyAPI (internal/misc/antigravity_version.go)
 */
export declare const ANTIGRAVITY_HUB_MANIFEST_URL = "https://antigravity-hub-auto-updater-974169037036.us-central1.run.app/manifest/latest-arm64-mac.yml";
/** Returns true for plain `major.minor.patch` versions (no prefixes, suffixes, pre-release tags). */
export declare function isStrictVersion(value: string): boolean;
/** Compares two strict versions numerically. */
export declare function compareVersions(a: string, b: string): number;
/** True when the version is strict and at least the Cloud Code minimum. */
export declare function isSupportedAntigravityVersion(version: string): boolean;
/** Reads the `version:` field out of an electron-builder update manifest. */
export declare function parseManifestVersion(manifest: string): string | null;
/**
 * Fetch the latest supported Antigravity version and update the global constant.
 * Safe to call before logger is initialized (will silently skip logging).
 */
export declare function initAntigravityVersion(): Promise<void>;
//# sourceMappingURL=version.d.ts.map