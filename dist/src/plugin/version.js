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
import { ANTIGRAVITY_MINIMUM_VERSION, getAntigravityVersion, setAntigravityVersion, } from "../constants";
import { createLogger } from "./logger";
export const ANTIGRAVITY_HUB_MANIFEST_URL = "https://antigravity-hub-auto-updater-974169037036.us-central1.run.app/manifest/latest-arm64-mac.yml";
const MANIFEST_HEADERS = {
    "User-Agent": "electron-builder",
    "Cache-Control": "no-cache",
};
const FETCH_TIMEOUT_MS = 5000;
const MAX_MANIFEST_BYTES = 4096;
const STRICT_VERSION_REGEX = /^\d{1,6}\.\d{1,6}\.\d{1,6}$/;
const VERSION_KEY = "version:";
/** Returns true for plain `major.minor.patch` versions (no prefixes, suffixes, pre-release tags). */
export function isStrictVersion(value) {
    return STRICT_VERSION_REGEX.test(value);
}
/** Compares two strict versions numerically. */
export function compareVersions(a, b) {
    const left = a.split(".").map(Number);
    const right = b.split(".").map(Number);
    for (let i = 0; i < 3; i += 1) {
        const diff = (left[i] ?? 0) - (right[i] ?? 0);
        if (diff !== 0)
            return diff;
    }
    return 0;
}
/** True when the version is strict and at least the Cloud Code minimum. */
export function isSupportedAntigravityVersion(version) {
    return isStrictVersion(version) && compareVersions(version, ANTIGRAVITY_MINIMUM_VERSION) >= 0;
}
/** Reads the `version:` field out of an electron-builder update manifest. */
export function parseManifestVersion(manifest) {
    for (const line of manifest.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed.startsWith(VERSION_KEY))
            continue;
        const raw = trimmed.slice(VERSION_KEY.length).trim().replace(/^["']|["']$/g, "");
        if (isStrictVersion(raw))
            return raw;
    }
    return null;
}
async function fetchManifestVersion() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const response = await fetch(ANTIGRAVITY_HUB_MANIFEST_URL, {
            signal: controller.signal,
            headers: MANIFEST_HEADERS,
        });
        if (!response.ok)
            return null;
        const text = (await response.text()).slice(0, MAX_MANIFEST_BYTES);
        const version = parseManifestVersion(text);
        return version && isSupportedAntigravityVersion(version) ? version : null;
    }
    catch {
        return null;
    }
    finally {
        clearTimeout(timeout);
    }
}
/**
 * Fetch the latest supported Antigravity version and update the global constant.
 * Safe to call before logger is initialized (will silently skip logging).
 */
export async function initAntigravityVersion() {
    const log = createLogger("version");
    const previous = getAntigravityVersion();
    const version = await fetchManifestVersion();
    if (!version) {
        log.info("version-fetch-failed", { fallback: previous });
        return;
    }
    if (version !== previous) {
        log.info("version-updated", { version, source: "manifest", previous });
    }
    else {
        log.debug("version-unchanged", { version, source: "manifest" });
    }
    setAntigravityVersion(version);
}
//# sourceMappingURL=version.js.map