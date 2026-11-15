import { describe, it, expect } from "vitest";
import {
  getRandomizedHeaders,
  getAntigravityUserAgent,
  ANTIGRAVITY_HEADERS,
  ANTIGRAVITY_MINIMUM_VERSION,
  ANTIGRAVITY_VERSION_FALLBACK,
} from "./constants.ts";

describe("ANTIGRAVITY_HEADERS", () => {
  it("sends only the Hub User-Agent", () => {
    expect(ANTIGRAVITY_HEADERS["User-Agent"]).toContain("antigravity/hub/");
    expect(Object.keys(ANTIGRAVITY_HEADERS)).toEqual(["User-Agent"]);
  });
});

describe("getAntigravityUserAgent", () => {
  it("carries the runtime version and the Hub build changelist", () => {
    expect(getAntigravityUserAgent("2.24.0")).toBe(
      "antigravity/hub/2.24.0 (aidev_client; os_type=darwin; arch=arm64; cl=1000335682)",
    );
  });

  it("reports a version no older than the Cloud Code minimum", () => {
    const [major, minor] = ANTIGRAVITY_VERSION_FALLBACK.split(".").map(Number);
    const [minMajor, minMinor] = ANTIGRAVITY_MINIMUM_VERSION.split(".").map(Number);
    expect(major! * 1000 + minor!).toBeGreaterThanOrEqual(minMajor! * 1000 + minMinor!);
  });

  it("omits the changelist for a release with no known CL", () => {
    expect(getAntigravityUserAgent("2.99.0")).toBe(
      "antigravity/hub/2.99.0 (aidev_client; os_type=darwin; arch=arm64)",
    );
  });
});

describe("getRandomizedHeaders", () => {
  it("matches the Hub User-Agent with no content-call metadata", () => {
    const headers = getRandomizedHeaders("antigravity");
    expect(headers["User-Agent"]).toMatch(/^antigravity\/hub\//);
    expect(headers["X-Goog-Api-Client"]).toBeUndefined();
    expect(headers["Client-Metadata"]).toBeUndefined();
  });
});
