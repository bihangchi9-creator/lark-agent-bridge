/**
 * Per-chat preset overrides for lark-agent-bridge.
 *
 * `accessMode` (env) sets the default tier for every chat; `/preset` lets the
 * owner pin a specific chat to another tier. The shipped vocabulary is the
 * three public tiers; deployments may add more via `DSH_LARK_EXTRA_PRESETS`
 * (id:preset-name pairs) — e.g. an internal-only preset that stays out of the
 * public repo. Persisted to `~/.dsh-lark-bridge/chat-presets.json`.
 *
 * @module lark-agent-bridge/chat-preset
 */
/** The preset vocabulary shipped with the public plugin. */
export type PublicPresetId = 'workspace' | 'read-only' | 'full';
export declare const PUBLIC_PRESET_IDS: readonly PublicPresetId[];
/** Map a public `/preset` id to the agent-preset name; `undefined` = deployment default. */
export declare const PUBLIC_PRESET_NAME_BY_ID: Record<PublicPresetId, string | undefined>;
/** Whether a value is a known preset id: public tiers plus configured extras. */
export declare function isPresetId(value: string, extras: ReadonlySet<string>): boolean;
/** Resolve a preset id (public or extra) to its agent-preset name. */
export declare function presetNameFor(id: string, extras: Record<string, string>): string | undefined;
/** Absolute path to the per-chat preset overrides file. */
export declare function chatPresetPath(): string;
/** Durable per-chat preset overrides. Loaded at construction, persisted on mutation. */
export declare class ChatPresetStore {
    private readonly path;
    private readonly data;
    constructor(path: string);
    get(chatId: string): string | undefined;
    set(chatId: string, id: string): void;
    clear(chatId: string): void;
    private persist;
}
