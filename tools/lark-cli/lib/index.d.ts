/**
 * dsh-tool-lark-cli — expose the Feishu/Lark CLI (`lark-cli`) as a single
 * agent tool, so a preset's agent can operate Feishu (IM, docs, sheets,
 * calendar, …) through the deployment's lark-cli installation.
 *
 * Security posture:
 *   - commands are spawned as an **argv array, never a shell string**, so
 *     model-generated input cannot inject shell syntax;
 *   - an optional `allowedPrefixes` allowlist (empty = everything the logged-in
 *     lark-cli user can do; the bridge's access gate and trusted-chat model
 *     are the boundary);
 *   - output is capped and the process is killed on timeout, so a runaway
 *     command cannot OOM the host or blow the context window.
 *
 * Run-time requirements: `lark-cli` resolvable from PATH (or `bin` config),
 * and a completed `lark-cli config init` + `auth login` for the identity the
 * commands should act as.
 *
 * @module dsh-tool-lark-cli
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name (the row id the preset mounts). */
export declare const name = "tool-lark-cli";
/** The tool registry this plugin registers into. */
export declare const inject: string[];
export interface Config {
    /** lark-cli executable. Defaults to `lark-cli` resolved from PATH. */
    bin?: string;
    /** Kill the child after this many ms. Default 60s. */
    timeoutMs?: number;
    /** Cap of returned stdout+stderr characters. Default 100k. */
    maxOutputChars?: number;
    /**
     * Optional command-prefix allowlist (each entry a full prefix, e.g.
     * `im +send`). Empty = every lark-cli command is allowed.
     */
    allowedPrefixes?: string[];
}
export declare const Config: z<Config>;
export declare function apply(ctx: Context, config: Config): void;
