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
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
/** Directory holding bridge state. Honors `DSH_LARK_HOME`, else `~/.dsh-lark-bridge`. */
export function bridgeHome() {
    return process.env.DSH_LARK_HOME ?? join(homedir(), '.dsh-lark-bridge');
}
/** Absolute path to the credentials file. */
export function credentialsPath() {
    return join(bridgeHome(), 'credentials.json');
}
/**
 * Absolute path to the pending-registration URL file.
 *
 * When the auto-registration wizard runs while dsh is detached (its terminal
 * QR code is not visible, e.g. a backgrounded `dsh web`), the raw registration
 * URL is written here so a user can open it in a browser instead. It is deleted
 * once registration completes. Purely a convenience artifact — never a secret.
 */
export function registerUrlPath() {
    return join(bridgeHome(), 'register-url.txt');
}
/** Write the pending-registration URL for out-of-band (browser) access. */
export function writeRegisterUrl(url) {
    const path = registerUrlPath();
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    writeFileSync(path, `${url}\n`, { mode: 0o600 });
    return path;
}
/** Remove the pending-registration URL file, if present (post-registration cleanup). */
export function clearRegisterUrl() {
    try {
        rmSync(registerUrlPath(), { force: true });
    }
    catch {
        // Best-effort cleanup; a leftover URL file is harmless.
    }
}
/** Read saved credentials, or `undefined` when absent or unreadable. */
export function readCredentials() {
    try {
        const raw = readFileSync(credentialsPath(), 'utf8');
        const parsed = JSON.parse(raw);
        if (typeof parsed.appId === 'string' && typeof parsed.appSecret === 'string') {
            return {
                appId: parsed.appId,
                appSecret: parsed.appSecret,
                tenant: parsed.tenant === 'lark' ? 'lark' : 'feishu',
                ownerId: typeof parsed.ownerId === 'string' ? parsed.ownerId : undefined,
                botName: parsed.botName,
                savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : 0,
            };
        }
    }
    catch {
        // Missing or malformed — treated as "no saved credentials".
    }
    return undefined;
}
/** Persist credentials with owner-only permissions, creating the dir as needed. */
export function writeCredentials(creds) {
    const path = credentialsPath();
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const payload = { ...creds, savedAt: Date.now() };
    writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, { mode: 0o600 });
    chmodSync(path, 0o600);
    return path;
}
/**
 * Backfill (or update) the owner open_id in the saved credentials without
 * touching anything else. Used by the runtime owner resolver when the
 * app-info API returns an owner that registration did not capture.
 */
export function saveOwnerId(ownerId, appId, appSecret) {
    const existing = readCredentials();
    if (!existing)
        return;
    // Runtime credentials may be supplied inline or via environment. Never
    // persist that app's owner into a different saved app record.
    if (appId !== undefined && existing.appId !== appId)
        return;
    if (appSecret !== undefined && existing.appSecret !== appSecret)
        return;
    if (existing.ownerId === ownerId)
        return;
    writeCredentials({ ...existing, ownerId });
}
