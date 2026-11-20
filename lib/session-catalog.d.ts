/**
 * Per-chat session catalog with policy fingerprints — P3 of the hardening
 * plan.
 *
 * Why fingerprints: dsh resumes a session by id from persistence, and the
 * bridge's session id is derived from the chat id, so a chat's context would
 * otherwise be reused even after its policy changed (accessMode tier, preset,
 * model, workspace). Resuming old context under new privileges is exactly the
 * confusion we must not have — so every session carries the fingerprint of
 * the policy it was created under, and resume only happens when the
 * fingerprint still matches. `/new` writes a sentinel fingerprint that never
 * matches, forcing a fresh generation.
 *
 * Session id layout: generation 0 uses the legacy bare id (`lark-<chatId>`)
 * so pre-upgrade logs are resumed once and then recorded; generation n > 0
 * uses `lark-<chatId>-<n>`.
 *
 * @module lark-agent-bridge/session-catalog
 */
/** Sentinel fingerprint: never matches a real policy, so the next ensure rotates. */
export declare const RESET_FINGERPRINT = "reset";
/** The policy dimensions a session's context was produced under. */
export interface PolicyInput {
    cwd: string;
    /** Agent preset id mounted for this chat (undefined = deployment default). */
    preset?: string;
    provider?: string;
    model?: string;
}
/** One catalog entry: which generation, under which policy. */
export interface CatalogEntry {
    gen: number;
    fingerprint: string;
    updatedAt: number;
}
/** Deterministic short hash of the policy a session was created under. */
export declare function policyFingerprint(input: PolicyInput): string;
/**
 * The generation to use for a chat: no entry → 0 (legacy id); matching
 * fingerprint → keep the generation (resume); mismatch → bump (fresh id).
 */
export declare function nextGen(entry: CatalogEntry | undefined, fingerprint: string): number;
/** The sentinel entry `/new` writes so the next ensure rotates generations. */
export declare function resetEntry(entry: CatalogEntry | undefined): CatalogEntry;
/** Build the session id for a chat and generation (gen 0 keeps the legacy id). */
export declare function sessionIdFor(chatId: string, gen: number): string;
/**
 * Durable per-chat catalog. Loaded once at plugin start, persisted on every
 * mutation; unreadable/missing files start empty. Sync writes are fine — the
 * file is small and writes are rare (per session creation/reset).
 */
export declare class SessionCatalog {
    private readonly path;
    private data;
    constructor(path: string);
    entryFor(chatId: string): CatalogEntry | undefined;
    set(chatId: string, entry: CatalogEntry): void;
    delete(chatId: string): void;
    private load;
    private persist;
}
