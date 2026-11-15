/**
 * Configuration schema for opencode-antigravity-auth plugin.
 *
 * Config file locations (in priority order, highest wins):
 * - Project: .opencode/antigravity.json
 * - User: ~/.config/opencode/antigravity.json (Linux/Mac)
 *         %APPDATA%\opencode\antigravity.json (Windows)
 *
 * Environment variables always override config file values.
 */
import { z } from "zod";
/**
 * Account selection strategy for distributing requests across accounts.
 *
 * - `sticky`: Use same account until rate-limited. Preserves prompt cache.
 * - `round-robin`: Rotate to next account on every request. Maximum throughput.
 * - `hybrid` (default): Deterministic selection based on health score + token bucket + LRU freshness.
 */
export declare const AccountSelectionStrategySchema: any;
export type AccountSelectionStrategy = z.infer<typeof AccountSelectionStrategySchema>;
/**
 * Toast notification scope for controlling which sessions show toasts.
 *
 * - `root_only` (default): Only show toasts for root sessions (no parentID).
 *   Subagents and background tasks won't show toast notifications.
 * - `all`: Show toasts for all sessions including subagents and background tasks.
 */
export declare const ToastScopeSchema: any;
export type ToastScope = z.infer<typeof ToastScopeSchema>;
/**
 * Scheduling mode for rate limit behavior.
 *
 * - `cache_first`: Wait for same account to recover (preserves prompt cache). Default.
 * - `balance`: Switch account immediately on rate limit. Maximum availability.
 * - `performance_first`: Round-robin distribution for maximum throughput.
 */
export declare const SchedulingModeSchema: any;
export type SchedulingMode = z.infer<typeof SchedulingModeSchema>;
/**
 * Signature cache configuration for persisting thinking block signatures to disk.
 */
export declare const SignatureCacheConfigSchema: any;
/**
 * Main configuration schema for the Antigravity OAuth plugin.
 */
export declare const AntigravityConfigSchema: any;
export type AntigravityConfig = z.infer<typeof AntigravityConfigSchema>;
export type SignatureCacheConfig = z.infer<typeof SignatureCacheConfigSchema>;
/**
 * Default configuration values.
 */
export declare const DEFAULT_CONFIG: AntigravityConfig;
//# sourceMappingURL=schema.d.ts.map