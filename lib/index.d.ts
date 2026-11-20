/**
 * lark-agent-bridge — a DeepSeek Harness plugin that bridges dsh agents to
 * Feishu/Lark group chats.
 *
 * This is an "external protocol driver" in dsh's architecture: it injects the
 * core `agents` service and adapts a Feishu WebSocket peer onto it. Each group
 * chat becomes one long-lived agent session with its own project directory —
 * "one group, one project folder".
 *
 * Loaded by dsh through the bundle patch (see cordis.patch.yml). On first run,
 * if no Feishu credentials are configured, the plugin auto-launches the QR
 * registration wizard (terminal QR + a browser-openable URL file) and connects
 * as soon as you finish it — no separate setup command required. Configuration
 * otherwise comes from the plugin config block or environment variables; see
 * config.ts.
 *
 * @module lark-agent-bridge
 */
import type { Context } from '@deepseek-ai/cordis';
import { Config, type LarkBridgeConfig } from './config.js';
/** The Cordis plugin name. */
export declare const name = "lark-bridge";
/**
 * The ONLY service this plugin truly requires: the agent factory (`agents`).
 * Everything else — `agentPresets`, `agentDefaultModel`, `llm`,
 * `sessionPersistence` — is read via `ctx.get` (optional) when present, so a
 * deployment lacking them still boots the plugin (it degrades, never crashes
 * the host). A listed-but-missing inject makes cordis fail the ENTIRE
 * application at load, so this list is deliberately minimal.
 */
export declare const inject: string[];
export { Config };
export type { LarkBridgeConfig };
export { startDaemon, loadDaemonAdapters } from './daemon.js';
export { DshAdapter } from './dsh-adapter.js';
export { CliSpawnAdapter, TRAEX_RUNTIME, CODEX_RUNTIME } from './cli-adapter.js';
export { IdeAttachAdapter, IDE_RUNTIME } from './ide-adapter.js';
export { loadCustomAdapter } from './custom-adapter.js';
/**
 * Plugin entry. If credentials are present it wires the Feishu channel and
 * connects; if not, it runs the registration wizard first and connects once it
 * completes. Registers a disposer so a plugin reload or host shutdown tears the
 * channel and every agent down cleanly. A `cancelled` flag makes the wizard
 * path a no-op if the plugin is disposed mid-registration.
 *
 * The whole body is wrapped so that ANY failure here — a config error, an
 * incompatible host API, a bad import surfacing at call time — is logged and
 * contained. A bridge that cannot start must never take the dsh host down
 * with it; the worst outcome is "the bot is offline", never "dsh won't boot".
 */
export declare function apply(ctx: Context, config?: LarkBridgeConfig): void;
