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
import { parseAccessMode } from './access-mode.js';
import { readCredentials } from './credentials.js';
export const Config = Schema.object({
    enabled: Schema.boolean().default(true),
    appId: Schema.string(),
    appSecret: Schema.string().role('secret'),
    tenant: Schema.union(['feishu', 'lark']),
    provider: Schema.string(),
    model: Schema.string(),
    workspaceRoot: Schema.string(),
    allowDm: Schema.boolean(),
    requireMention: Schema.boolean(),
    turnTimeoutMs: Schema.number(),
    allowedChats: Schema.array(Schema.string()),
    allowedUsers: Schema.array(Schema.string()),
    accessMode: Schema.union(['read-only', 'workspace', 'full']),
    extraPresets: Schema.dict(Schema.string()),
    ssoGatedPresets: Schema.array(Schema.string()),
    ssoCheckCmd: Schema.string(),
    ssoOkMarker: Schema.string(),
    presetModels: Schema.dict(Schema.object({ provider: Schema.string(), model: Schema.string() })),
});
/** Read a boolean-ish env var (`1/true/yes/on` = true), returning `fallback` when unset. */
function envBool(value, fallback) {
    if (value === undefined || value === '')
        return fallback;
    return /^(1|true|yes|on)$/i.test(value);
}
/** Resolve a finite positive number from inline config or an env string. */
function positiveNumber(value, fallback) {
    const parsed = typeof value === 'number' ? value : value === undefined ? NaN : Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
export function tryResolveConfig(config) {
    const env = process.env;
    const saved = readCredentials();
    const appId = config.appId ?? env.LARK_APP_ID ?? saved?.appId;
    const appSecret = config.appSecret ?? env.LARK_APP_SECRET ?? saved?.appSecret;
    if (!appId || !appSecret)
        return undefined;
    const tenant = (config.tenant ?? env.LARK_TENANT ?? saved?.tenant ?? 'feishu');
    const home = env.HOME ?? env.USERPROFILE ?? process.cwd();
    const configuredIdentity = config.appId !== undefined || config.appSecret !== undefined;
    const envIdentity = env.LARK_APP_ID !== undefined || env.LARK_APP_SECRET !== undefined;
    // A saved owner belongs to the saved app identity. Never carry that trust
    // across an inline/env credential override for a different app.
    const ownerId = configuredIdentity || envIdentity
        ? saved?.appId === appId && saved?.appSecret === appSecret ? saved.ownerId : undefined
        : saved?.ownerId;
    return {
        appId,
        appSecret,
        tenant,
        provider: config.provider ?? env.DSH_LARK_PROVIDER,
        model: config.model ?? env.DSH_LARK_MODEL,
        workspaceRoot: config.workspaceRoot ?? env.DSH_LARK_WORKSPACE_ROOT ?? `${home}/dsh-lark-workspaces`,
        allowDm: config.allowDm ?? envBool(env.DSH_LARK_ALLOW_DM, true),
        requireMention: config.requireMention ?? envBool(env.DSH_LARK_REQUIRE_MENTION, true),
        turnTimeoutMs: positiveNumber(config.turnTimeoutMs ?? env.DSH_LARK_TURN_TIMEOUT_MS, 10 * 60 * 1000),
        ownerId,
        // NOTE: schemastery materializes empty arrays/objects for absent list/dict
        // fields (e.g. `[]` for Schema.array, `{}` for Schema.dict), so a bare
        // `?? env` fallback is defeated by the empty default. Use emptiness-aware
        // resolution instead — an empty configured list means "use the env".
        allowedChats: hasItems(config.allowedChats)
            ? config.allowedChats
            : envList(env.DSH_LARK_ALLOWED_CHATS),
        allowedUsers: hasItems(config.allowedUsers)
            ? config.allowedUsers
            : envList(env.DSH_LARK_ALLOWED_USERS),
        accessMode: parseAccessMode(config.accessMode ?? env.DSH_LARK_ACCESS_MODE, 'workspace'),
        extraPresets: hasKeys(config.extraPresets)
            ? config.extraPresets
            : parsePresetPairs(env.DSH_LARK_EXTRA_PRESETS),
        ssoGatedPresets: hasItems(config.ssoGatedPresets)
            ? config.ssoGatedPresets
            : envList(env.DSH_LARK_SSO_GATED_PRESETS),
        ssoCheckCmd: config.ssoCheckCmd ?? env.DSH_LARK_SSO_CHECK_CMD,
        ssoOkMarker: config.ssoOkMarker ?? env.DSH_LARK_SSO_OK_MARKER ?? 'Authenticated',
        presetModels: hasKeys2(config.presetModels)
            ? config.presetModels
            : parsePresetModels(env.DSH_LARK_PRESET_MODELS),
    };
}
/** True only for a record with at least one key (typed for the preset-model map). */
function hasKeys2(record) {
    return record !== undefined && Object.keys(record).length > 0;
}
/** Parse `"presetId:provider:model,id2:provider2:model2"` into a record. */
function parsePresetModels(value) {
    const out = {};
    if (value === undefined || value.trim() === '')
        return out;
    for (const entry of value.split(',')) {
        const [presetId, provider, model] = entry.split(':').map(part => part.trim());
        if (presetId && provider && model)
            out[presetId] = { provider, model };
    }
    return out;
}
/** True only for a list with at least one item. */
function hasItems(list) {
    return list !== undefined && list.length > 0;
}
/** True only for a record with at least one key. */
function hasKeys(record) {
    return record !== undefined && Object.keys(record).length > 0;
}
/** Parse `"id:presetName,id2:name2"` into a record (invalid pairs are dropped). */
function parsePresetPairs(value) {
    const out = {};
    if (value === undefined || value.trim() === '')
        return out;
    for (const pair of value.split(',')) {
        const [id, name] = pair.split(':').map(part => part.trim());
        if (id && name)
            out[id] = name;
    }
    return out;
}
/** Parse a comma-separated env list into a trimmed string array (empty when unset). */
function envList(value) {
    if (value === undefined || value.trim() === '')
        return [];
    return value
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}
/**
 * Merge the validated plugin config with environment and saved-credential
 * fallbacks. Precedence for the Feishu secrets: inline config → environment
 * variables → the file written by the `lark-agent-register` wizard. Throws a
 * clear error if none supply them, so the failure surfaces at boot rather than
 * on the first inbound message.
 */
export function resolveConfig(config) {
    const resolved = tryResolveConfig(config);
    if (resolved === undefined) {
        throw new Error('lark-agent-bridge: missing Feishu credentials. Run the `lark-agent-register` wizard ' +
            'to create an app by QR, or set LARK_APP_ID and LARK_APP_SECRET ' +
            '(or appId/appSecret in the plugin config).');
    }
    return resolved;
}
/** The open-platform base URL for the selected tenant. */
export function domainFor(tenant) {
    return tenant === 'lark' ? 'https://open.larksuite.com' : 'https://open.feishu.cn';
}
