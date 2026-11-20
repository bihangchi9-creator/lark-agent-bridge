/**
 * The lark-agent-bridge registration wizard.
 *
 * Asks Feishu to create a self-built app on your behalf, prints a QR code in
 * the terminal, and — once you scan it in the Feishu mobile app and confirm —
 * receives fresh app credentials and saves them for the plugin to use.
 *
 * Two entry points share this one flow:
 *   - the plugin itself, which runs it automatically at boot when no
 *     credentials are configured yet (see index.ts), and
 *   - the standalone `lark-agent-register` bin (see register-cli.ts), a manual
 *     fallback for re-registering or switching accounts.
 *
 * It depends only on `@larksuite/channel` + `qrcode-terminal`, so it works
 * without any dsh packages installed.
 *
 * This flow mirrors the terminal wizard shipped by the upstream
 * lark-coding-agent-bridge / trae-to-lark projects (see NOTICE / README).
 *
 * @module lark-agent-bridge/register
 */
import { writeRegisterUrl, type SavedCredentials } from './credentials.js';
/** Optional hooks so callers can surface progress their own way (logs, files). */
export interface RegisterHooks {
    /** Cancel QR polling when the owning plugin is unloaded. */
    signal?: AbortSignal;
    /** Emit a human-readable status/progress line. Defaults to `console.log`. */
    log?: (line: string) => void;
    /**
     * Called with the raw registration URL as soon as it is known, in addition
     * to the terminal QR code. The auto-boot path uses this to persist the URL
     * for out-of-band (browser) registration when the terminal is not visible.
     */
    onUrl?: (url: string) => void;
}
/**
 * Run the interactive QR registration. Resolves with the saved credentials
 * once the user completes it. Rejects if the QR expires or the Feishu API call
 * fails before a URL is shown.
 */
export declare function runRegister(hooks?: RegisterHooks): Promise<SavedCredentials>;
export { writeRegisterUrl };
