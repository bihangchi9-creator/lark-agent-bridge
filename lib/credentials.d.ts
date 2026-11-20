/**
 * Saved-credentials storage for lark-agent-bridge.
 *
 * The registration wizard ({@link module:lark-agent-bridge/register}) writes the
 * Feishu app credentials it obtains here, and {@link resolveConfig} reads them
 * as a fallback. This lets a user run the one-time `lark-agent-register` wizard,
 * scan a QR, and then launch the plugin with no manual credential handling.
 *
 * The file lives at `~/.dsh-lark-bridge/credentials.json` and is written with
 * owner-only (0600) permissions because it holds an app secret.
 *
 * @module lark-agent-bridge/credentials
 */
import type { LarkTenant } from './config.js';
/** The persisted credential shape. */
export interface SavedCredentials {
    appId: string;
    appSecret: string;
    tenant: LarkTenant;
    /**
     * open_id of the app owner, captured at registration (the person who
     * scanned the QR). Used by the access gate to bootstrap trust without any
     * pre-configuration. `undefined` for credentials written before this field
     * existed — the plugin backfills it at runtime via the app-info API.
     */
    ownerId?: string;
    /** App/bot display name, captured at registration for nicer logs. */
    botName?: string;
    /** Unix ms when these credentials were saved. */
    savedAt: number;
}
/** Directory holding bridge state. Honors `DSH_LARK_HOME`, else `~/.dsh-lark-bridge`. */
export declare function bridgeHome(): string;
/** Absolute path to the credentials file. */
export declare function credentialsPath(): string;
/**
 * Absolute path to the pending-registration URL file.
 *
 * When the auto-registration wizard runs while dsh is detached (its terminal
 * QR code is not visible, e.g. a backgrounded `dsh web`), the raw registration
 * URL is written here so a user can open it in a browser instead. It is deleted
 * once registration completes. Purely a convenience artifact — never a secret.
 */
export declare function registerUrlPath(): string;
/** Write the pending-registration URL for out-of-band (browser) access. */
export declare function writeRegisterUrl(url: string): string;
/** Remove the pending-registration URL file, if present (post-registration cleanup). */
export declare function clearRegisterUrl(): void;
/** Read saved credentials, or `undefined` when absent or unreadable. */
export declare function readCredentials(): SavedCredentials | undefined;
/** Persist credentials with owner-only permissions, creating the dir as needed. */
export declare function writeCredentials(creds: Omit<SavedCredentials, 'savedAt'>): string;
/**
 * Backfill (or update) the owner open_id in the saved credentials without
 * touching anything else. Used by the runtime owner resolver when the
 * app-info API returns an owner that registration did not capture.
 */
export declare function saveOwnerId(ownerId: string, appId?: string, appSecret?: string): void;
