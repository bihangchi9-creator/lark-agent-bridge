/**
 * Plugin configuration for lark-agent-bridge.
 *
 * Every field can be supplied two ways:
 *   1. Inline in the profile's `cordis.patch.yml` (a `config:` block under the
 *      `lark-bridge` row), or
 *   2. Environment variables (the default, friendlier path for end users).
 *
 * The Config schema below is what dsh validates; `resolveConfig` fills any
 * unset field from `process.env` so a bare install works with just the two
 * Feishu app secrets and a DeepSeek key exported in the shell.
 *
 * @module lark-agent-bridge/config
 */
import Schema from '@deepseek-ai/schemastery';
import { type AccessMode } from './access-mode.js';
/** Tenant selects the Feishu (feishu.cn) vs Lark (larksuite.com) open domain. */
export type LarkTenant = 'feishu' | 'lark';
export interface LarkBridgeConfig {
    /** Explicitly disable channel/registration side effects; default true. */
    enabled?: boolean;
    /** Feishu/Lark app id (`cli_...`). Falls back to `LARK_APP_ID`. */
    appId?: string;
    /** Feishu/Lark app secret. Falls back to `LARK_APP_SECRET`. */
    appSecret?: string;
    /** Which open-platform domain to use. Falls back to `LARK_TENANT`, default `feishu`. */
    tenant?: LarkTenant;
    /** DeepSeek provider route for created agents. Falls back to `DSH_LARK_PROVIDER`. */
    provider?: string;
    /** DeepSeek model for created agents. Falls back to `DSH_LARK_MODEL`. */
    model?: string;
    /**
     * Root directory under which each group's project folder is created:
     * `<workspaceRoot>/<chatId>`. Falls back to `DSH_LARK_WORKSPACE_ROOT`,
     * default `~/dsh-lark-workspaces`.
     */
    workspaceRoot?: string;
    /** Whether the agent may act in direct messages. Falls back to `DSH_LARK_ALLOW_DM`, default true. */
    allowDm?: boolean;
    /** In group chats, require an @-mention of the bot to trigger. Default true. */
    requireMention?: boolean;
    /** Hard deadline for one agent turn. Default 10 minutes; env DSH_LARK_TURN_TIMEOUT_MS. */
    turnTimeoutMs?: number;
    /**
     * Group chat ids (`oc_...`) allowed to drive the bot. Empty = no group
     * allowed (fail-closed). Falls back to `DSH_LARK_ALLOWED_CHATS`
     * (comma-separated).
     */
    allowedChats?: string[];
    /**
     * User open_ids allowed to drive the bot in DMs. Empty = no DM user
     * allowed (fail-closed). The app owner always passes regardless. Falls back
     * to `DSH_LARK_ALLOWED_USERS` (comma-separated).
     */
    allowedUsers?: string[];
    /**
     * How much of the host an agent may touch. `workspace` (default) mounts a
     * restricted preset (file editing, no shell/network/subagents);
     * `read-only` mounts a read/search-only preset; `full` mounts the
     * deployment default. Falls back to `DSH_LARK_ACCESS_MODE`.
     */
    accessMode?: AccessMode;
    /**
     * Additional `/preset` tiers beyond the shipped three, as
     * `id:preset-name` pairs (e.g. an internal-only preset that stays out of
     * the public repo). Falls back to `DSH_LARK_EXTRA_PRESETS`
     * (`"id:name,id2:name2"`).
     */
    extraPresets?: Record<string, string>;
    /**
     * Preset ids whose switch requires a successful host SSO check before
     * taking effect (fail-closed). Falls back to `DSH_LARK_SSO_GATED_PRESETS`.
     */
    ssoGatedPresets?: string[];
    /**
     * The command that proves host SSO, e.g. `corp-cli auth status` (argv
     * tokens). Unset = no SSO gate. Falls back to `DSH_LARK_SSO_CHECK_CMD`.
     */
    ssoCheckCmd?: string;
    /**
     * Text that must appear in the SSO check's output (exit 0 AND marker).
     * Falls back to `DSH_LARK_SSO_OK_MARKER`, default `Authenticated`.
     */
    ssoOkMarker?: string;
    /**
     * Per-tier model routes: `presetId:provider:model` pairs (e.g.
     * `internal:acme-provider:acme-model`). Chats pinned to that preset route
     * their agents through that provider/model, overriding the global default
     * but not a per-chat `/model`. The tier itself carries the SSO gate. Falls
     * back to `DSH_LARK_PRESET_MODELS`.
     */
    presetModels?: Record<string, {
        provider: string;
        model: string;
    }>;
}
export declare const Config: Schema<LarkBridgeConfig>;
/** The fully-resolved config after environment fallback; secrets are guaranteed present. */
export interface ResolvedConfig {
    appId: string;
    appSecret: string;
    tenant: LarkTenant;
    provider?: string;
    model?: string;
    workspaceRoot: string;
    allowDm: boolean;
    requireMention: boolean;
    turnTimeoutMs: number;
    /** open_id of the app owner captured at registration, when known. */
    ownerId?: string;
    allowedChats: string[];
    allowedUsers: string[];
    accessMode: AccessMode;
    extraPresets: Record<string, string>;
    ssoGatedPresets: string[];
    ssoCheckCmd?: string;
    ssoOkMarker: string;
    presetModels: Record<string, {
        provider: string;
        model: string;
    }>;
}
/**
 * Merge the validated plugin config with environment and saved-credential
 * fallbacks, returning `undefined` when the Feishu secrets are not yet
 * available anywhere. Precedence for the secrets: inline config → environment
 * variables → the file written by the registration wizard.
 *
 * Unlike {@link resolveConfig} this never throws on missing credentials: it is
 * the "have we been set up yet?" probe the plugin runs at boot, so a fresh
 * install can fall through to the auto-registration wizard instead of crashing.
 */
export declare function tryResolveConfig(config: LarkBridgeConfig): ResolvedConfig | undefined;
/**
 * Merge the validated plugin config with environment and saved-credential
 * fallbacks. Precedence for the Feishu secrets: inline config → environment
 * variables → the file written by the `lark-agent-register` wizard. Throws a
 * clear error if none supply them, so the failure surfaces at boot rather than
 * on the first inbound message.
 */
export declare function resolveConfig(config: LarkBridgeConfig): ResolvedConfig;
/** The open-platform base URL for the selected tenant. */
export declare function domainFor(tenant: LarkTenant): string;
