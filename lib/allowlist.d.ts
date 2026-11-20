/**
 * Mutable, persisted allowlist for lark-agent-bridge.
 *
 * The env/config allowlist (`DSH_LARK_ALLOWED_CHATS`) is read-only at
 * runtime; this store adds a command-managed layer (owner `/allow` /
 * `/disallow`) that persists to `~/.dsh-lark-bridge/allowlist.json` and
 * takes effect immediately — no restart needed. Effective access checks the
 * union of both layers.
 *
 * @module lark-agent-bridge/allowlist
 */
/** Absolute path to the command-managed allowlist file. */
export declare function allowlistPath(): string;
/**
 * Command-managed chat allowlist. Loaded once at construction, persisted on
 * every mutation; unreadable/missing files start empty. Sync writes are fine
 * — the file is tiny and writes are rare (owner commands only).
 */
export declare class AllowlistStore {
    private readonly path;
    private readonly chats;
    constructor(path: string);
    hasChat(chatId: string): boolean;
    chatIds(): string[];
    /** Add a chat; returns false when already present. */
    addChat(chatId: string): boolean;
    /** Remove a chat; returns false when not present. */
    removeChat(chatId: string): boolean;
    private load;
    private persist;
}
