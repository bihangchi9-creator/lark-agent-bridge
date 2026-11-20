/**
 * The dsh binding — the single isolation layer over dsh's internal `agents`
 * service and session-event stream.
 *
 * Everything the rest of the plugin needs to *drive an agent* lives here:
 * create/resume a per-chat session, feed it a user turn, and receive a small,
 * stable stream of {@link BridgeEvent}s. If a future dsh release renames an API
 * or reshapes an event, this file is the only place that changes.
 *
 * The event translation table (dsh → bridge):
 *
 *   assistant/chunk (text-delta)     -> { type: 'text', delta }
 *   assistant/chunk (reasoning-delta)-> { type: 'thinking', delta }
 *   assistant/message                -> { type: 'final_text', content, usage? }
 *   tool/call                        -> { type: 'tool_use', id, name }
 *   tool/result                      -> { type: 'tool_result', id, isError }
 *   turn/end                         -> { type: 'done', reason }
 *
 * @module lark-agent-bridge/dsh-binding
 */
import type { Context } from '@deepseek-ai/cordis';
/** Provider/model route handed to each created agent. */
export interface AgentRoute {
    provider?: string;
    model?: string;
    /**
     * Which agent preset to mount (toolset + system prompt + model loop). When
     * omitted the deployment default (`standard` in the shipped web profile) is
     * used, matching what a normal browser session gets.
     */
    preset?: string;
}
/** The small, dsh-agnostic event vocabulary the Feishu layer consumes. */
export type BridgeEvent = {
    type: 'text';
    delta: string;
} | {
    type: 'thinking';
    delta: string;
} | {
    type: 'final_text';
    content: string;
    inputTokens?: number;
    outputTokens?: number;
} | {
    type: 'tool_use';
    id: string;
    name: string;
} | {
    type: 'tool_result';
    id: string;
    isError: boolean;
} | {
    type: 'done';
    reason: string;
} | {
    type: 'error';
    message: string;
};
/** A live per-chat agent handle owned by the binding. */
export interface BridgeSession {
    readonly sessionId: string;
    /** Enqueue a user turn (plain text). The agent streams via the subscribed handler. */
    send(text: string): void;
    /** Stop and dispose the underlying agent, reaching quiescence. */
    dispose(): Promise<void>;
}
/**
 * The preset registry service (`ctx.agentPresets`). Mounting a preset onto a
 * freshly created agent's scoped context is what gives it its toolset, system
 * prompt, and model loop — a bare `agents.create` with no preset produces an
 * agent that has nothing to do and ends the turn with no output.
 */
interface AgentPresetsLike {
    /** Compose the named preset (or the deployment default) onto an agent context. */
    mount(agentCtx: unknown, id?: string): Promise<unknown>;
}
/**
 * Mount the requested preset without privilege-escalating fallbacks.
 *
 * A named preset is a security boundary (for example, workspace/read-only).
 * If the preset service or that named preset is unavailable, fail the turn.
 * Only an explicitly undefined preset means "use the deployment default".
 */
export declare function mountPresetFailClosed(presets: AgentPresetsLike | undefined, agentCtx: unknown, preset: string | undefined): Promise<void>;
/**
 * Wraps `ctx.agents` for one plugin instance. Owns a `chatId -> BridgeSession`
 * map so each Feishu chat gets exactly one long-lived agent, and fans the
 * global `session/event` stream out to per-session subscribers.
 */
export declare class DshBinding {
    private readonly ctx;
    private readonly route;
    private readonly log?;
    private readonly sessions;
    private readonly handlers;
    /** Durable per-chat generation/fingerprint store (P3). */
    private readonly catalog;
    constructor(ctx: Context, route: AgentRoute, log?: ((level: "info" | "warn" | "error", msg: string, extra?: unknown) => void) | undefined);
    /** The injected dsh agent-factory service (typed structurally, see AgentsServiceLike). */
    private get agents();
    /** The injected preset registry, if the deployment composed one. Accessed
     * via `ctx.get` because `agentPresets` is NOT in the plugin's inject list
     * (optional); cordis throws on direct property access to undeclared services. */
    private get agentPresets();
    /** The injected default-model service, if the deployment composed one.
     * Accessed via `ctx.get` for the same reason as {@link agentPresets}. */
    private get agentDefaultModel();
    /** The injected llm service (provider/model catalog), when composed. */
    private get llm();
    /**
     * List the deployment's model catalog: every provider, and each provider's
     * advertised models. Empty on failure — the caller decides how to render.
     */
    listModels(): Promise<Array<{
        provider: string;
        providerName?: string;
        models: Array<{
            id: string;
            name?: string;
        }>;
    }>>;
    /**
     * The injected persistence service, if the deployment loaded a backend.
     *
     * Accessed via `ctx.get(name)` rather than a direct property: this service is
     * intentionally NOT in the plugin's `inject` list (it is optional — a headless
     * profile may omit persistence), and cordis THROWS on direct property access
     * to an undeclared service. `ctx.get` performs the same optional lookup the
     * host itself uses (see api-proxy `ctx.get('sessionPersistence')`).
     */
    private get sessionPersistence();
    /** Whether a live session exists for this chat. */
    has(chatId: string): boolean;
    /**
     * Get the existing session for a chat, or create one bound to `cwd`.
     * `onEvent` is (re)registered as the sink for this chat's stream.
     *
     * `routeOverride` lets a chat pin its own model (see `/model`); it only
     * applies when a fresh session is created, so callers that switch models
     * dispose first, then re-ensure.
     */
    ensureSession(chatId: string, cwd: string, onEvent: (event: BridgeEvent) => void, routeOverride?: AgentRoute): Promise<BridgeSession>;
    /** Dispose one chat's session, if any (used by `/new` and `/model`). */
    dispose(chatId: string): Promise<void>;
    /**
     * Reset a chat's conversation for real (`/new`): dispose the live session
     * AND write a sentinel catalog entry so the next `ensureSession` rotates to
     * a fresh generation instead of resuming the persisted log.
     */
    reset(chatId: string): Promise<void>;
    /** Dispose every live session (plugin teardown). */
    disposeAll(): Promise<void>;
}
export {};
