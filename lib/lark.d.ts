/**
 * The Feishu/Lark surface: connect a channel, route inbound messages to a
 * per-chat dsh agent, and stream the agent's reply back as a live-updating
 * message.
 *
 * This is the plugin's "external protocol driver" in dsh terms: Feishu is the
 * wire peer, {@link AgentAdapter} is the pinned runtime, and each group chat
 * maps to one long-lived session with its own project directory.
 *
 * @module lark-agent-bridge/lark
 */
import { type ResolvedConfig } from './config.js';
import type { AgentAdapter } from './adapter.js';
/** Per-chat model override, chosen via `/model <provider>/<model>`. */
interface ChatModelRoute {
    provider: string;
    model: string;
}
interface ModelCatalogEntry {
    provider: string;
    models: Array<{
        id: string;
    }>;
}
/** Resolve `/model` input against the live catalog; ambiguous/bare ids fail closed. */
export declare function resolveModelRoute(value: string, catalog: readonly ModelCatalogEntry[]): ChatModelRoute | undefined;
/**
 * Owns the channel connection and the message pump. Call {@link connect} to go
 * live and {@link disconnect} to tear down (also disposes every agent).
 */
export declare class LarkBridge {
    private readonly config;
    private readonly log;
    private readonly channel;
    private readonly chatModels;
    /** Chats with a run currently in flight — one run per chat at a time. */
    private readonly busy;
    /** Per-chat FIFO of messages that arrived while a turn was running. */
    private readonly pending;
    /**
     * open_id of the app owner. Seeded from the credentials captured at
     * registration; when absent, resolved at runtime via the app-info API and
     * persisted back (see {@link resolveOwner}).
     */
    private ownerId;
    /** This bot's own open_id, resolved from the channel identity. */
    private botOpenId;
    private ownerRefreshTimer;
    /** Command-managed chat allowlist (owner `/allow` / `/disallow`). */
    private readonly allowlist;
    /** Per-chat preset overrides (owner `/preset`, persisted). */
    private readonly chatPresets;
    /** Adapters this process can pin a chat to. Lookup is by id; no fallback. */
    private readonly adapters;
    /** Runtimes this process can pin a chat to. */
    private readonly installedRuntimes;
    /** Default runtime when a chat has no `/agent` pin. */
    private readonly defaultRuntimeId;
    /** Per-chat runtime pins (owner `/agent`, persisted). */
    private readonly chatRuntimes;
    constructor(config: ResolvedConfig, adapters: readonly AgentAdapter[], log: (level: 'info' | 'warn' | 'error', msg: string, extra?: unknown) => void, defaultRuntimeId?: string);
    private installedIds;
    /** This chat's pin, or the process default. Missing pins fail closed at turn time. */
    private chatRuntime;
    /** Adapter for this chat. Undefined means the pin is gone — do not retarget. */
    private adapterFor;
    /** The effective access controls: config/env allowlists + command-managed store. */
    private accessControls;
    /** Whether the sender is the app owner (admin commands). Fail-closed when unknown. */
    private isOwner;
    /**
     * Verify host SSO before enabling a gated tier (`DSH_LARK_SSO_GATED_PRESETS`).
     * Runs `DSH_LARK_SSO_CHECK_CMD` (argv tokens, no shell) and requires exit 0
     * AND the `DSH_LARK_SSO_OK_MARKER` in its output. Fail-closed — no checker
     * configured, any error, timeout, or unclear output counts as not verified.
     */
    private verifySso;
    /** Connect the WebSocket and start handling messages. */
    connect(): Promise<void>;
    /** Disconnect and dispose every agent. */
    disconnect(): Promise<void>;
    /**
     * Resolve the app owner's open_id via the app-info API and persist it, so
     * the access gate works even for credentials written before the owner was
     * captured. Best-effort: on failure the owner stays unknown and the gate
     * stays fail-closed.
     */
    private resolveOwner;
    /** Route one inbound message: access gate, command, or agent prompt. */
    private onMessage;
    /** Handle a slash command. */
    private handleCommand;
    /** Feed a prompt to the chat's agent, queueing if a turn is already running. */
    private runAgent;
    /** Run one turn for a chat, then drain the chat's pending queue. */
    private runTurn;
    /** The body of one turn: resolve the session, drive it, stream the reply. */
    private runAgentTurn;
    /** Send a plain reply to a message. */
    private reply;
}
/**
 * Split text longer than `max` chars into chunks, cutting at newline
 * boundaries and keeping markdown code fences valid across chunks. Each
 * processed chunk that ends inside an open fence closes it (```` ``` ````) and
 * the next chunk reopens it, so every chunk is self-contained and the whole
 * result is balanced. Returns `[text]` unchanged when the text fits.
 */
export declare function splitLongText(text: string, max: number): string[];
export {};
