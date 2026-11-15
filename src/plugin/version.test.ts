import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

/**
 * Regression tests for the version fallback mechanism.
 *
 * Cloud Code gates model availability on the Antigravity client version carried in
 * the User-Agent. A client below ANTIGRAVITY_MINIMUM_VERSION is answered with
 * "This version of Antigravity is no longer supported" instead of a model
 * response, and only sees the older model catalog.
 *
 * These tests verify the fallback is current, that the manifest fetch is used, and
 * that an unsupported manifest version is rejected.
 */

// Reset module state between tests so versionLocked starts fresh
beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const manifest = (version: string) =>
  `version: ${version}\nfiles:\n  - url: Antigravity-${version}.zip\n    sha512: abc\npath: Antigravity-${version}.zip\nreleaseDate: '2026-11-01'\n`

describe("ANTIGRAVITY_VERSION_FALLBACK", () => {
  it("defaults to the exported fallback constant", async () => {
    const { ANTIGRAVITY_VERSION_FALLBACK, getAntigravityVersion } = await import("../constants.ts")
    expect(getAntigravityVersion()).toBe(ANTIGRAVITY_VERSION_FALLBACK)
  })

  it("is at or above the Cloud Code minimum version", async () => {
    const { isSupportedAntigravityVersion } = await import("./version.ts")
    const { ANTIGRAVITY_MINIMUM_VERSION, ANTIGRAVITY_VERSION_FALLBACK } = await import("../constants.ts")
    expect(isSupportedAntigravityVersion(ANTIGRAVITY_VERSION_FALLBACK)).toBe(true)
    expect(isSupportedAntigravityVersion(ANTIGRAVITY_MINIMUM_VERSION)).toBe(true)
  })
})

describe("isSupportedAntigravityVersion", () => {
  it("rejects the 2.0.6 build that Cloud Code no longer serves", async () => {
    const { isSupportedAntigravityVersion } = await import("./version.ts")
    expect(isSupportedAntigravityVersion("2.0.6")).toBe(false)
  })

  it("rejects non-strict versions", async () => {
    const { isSupportedAntigravityVersion } = await import("./version.ts")
    expect(isSupportedAntigravityVersion("2.24.0-beta.1")).toBe(false)
  })
})

describe("parseManifestVersion", () => {
  it("reads the version field out of an electron-builder manifest", async () => {
    const { parseManifestVersion } = await import("./version.ts")
    expect(parseManifestVersion(manifest("2.25.1"))).toBe("2.25.1")
  })
})

describe("setAntigravityVersion", () => {
  it("updates the version on first call", async () => {
    const { getAntigravityVersion, setAntigravityVersion } = await import("../constants.ts")
    setAntigravityVersion("2.23.1")
    expect(getAntigravityVersion()).toBe("2.23.1")
  })

  it("locks after first call — subsequent calls are ignored", async () => {
    const { getAntigravityVersion, setAntigravityVersion } = await import("../constants.ts")
    setAntigravityVersion("2.23.1")
    setAntigravityVersion("3.0.0")
    expect(getAntigravityVersion()).toBe("2.23.1")
  })
})

describe("initAntigravityVersion", () => {
  it("falls back to hardcoded version when the manifest fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unreachable")))

    const { ANTIGRAVITY_VERSION_FALLBACK, getAntigravityVersion } = await import("../constants.ts")
    const { initAntigravityVersion } = await import("./version.ts")
    await initAntigravityVersion()

    expect(getAntigravityVersion()).toBe(ANTIGRAVITY_VERSION_FALLBACK)
  })

  it("falls back to hardcoded version when the manifest fetch returns non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503, text: async () => "" }),
    )

    const { ANTIGRAVITY_VERSION_FALLBACK, getAntigravityVersion } = await import("../constants.ts")
    const { initAntigravityVersion } = await import("./version.ts")
    await initAntigravityVersion()

    expect(getAntigravityVersion()).toBe(ANTIGRAVITY_VERSION_FALLBACK)
  })

  it("uses the manifest version when it is supported", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: async () => manifest("2.25.1") }),
    )

    const { getAntigravityVersion } = await import("../constants.ts")
    const { initAntigravityVersion } = await import("./version.ts")
    await initAntigravityVersion()

    expect(getAntigravityVersion()).toBe("2.25.1")
  })

  it("rejects a manifest version below the Cloud Code minimum", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: async () => manifest("2.0.6") }),
    )

    const { ANTIGRAVITY_VERSION_FALLBACK, getAntigravityVersion } = await import("../constants.ts")
    const { initAntigravityVersion } = await import("./version.ts")
    await initAntigravityVersion()

    expect(getAntigravityVersion()).toBe(ANTIGRAVITY_VERSION_FALLBACK)
  })

  it("fallback version appears in the User-Agent header", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")))

    const { ANTIGRAVITY_VERSION_FALLBACK, getAntigravityHeaders } = await import("../constants.ts")
    const { initAntigravityVersion } = await import("./version.ts")
    await initAntigravityVersion()

    const headers = getAntigravityHeaders()
    expect(headers["User-Agent"]).toContain(`antigravity/hub/${ANTIGRAVITY_VERSION_FALLBACK}`)
  })
})
