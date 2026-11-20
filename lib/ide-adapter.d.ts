/**
 * IDE attach adapter.
 *
 * Talks to an already-running IDE sidecar over a Unix socket (JSONL).
 * Closing the window (socket gone) makes {@link isAvailable} false; the
 * chat's pin stays, and the next turn fails closed instead of moving to
 * CLI/dsh.
 *
 * Protocol (one turn = one TCP/unix connection):
 *   gateway → { type: "prompt", chatId, cwd, text }
 *   sidecar → BridgeEvent JSON lines, ending with { type: "done" | "error" }
 *
 * @module lark-agent-bridge/ide-adapter
 */
import { createConnection } from 'node:net';
import type { AgentAdapter, AdapterRoute, BridgeEvent, BridgeSession } from './adapter.js';
import type { RuntimeDescriptor } from './runtime.js';
export declare const IDE_RUNTIME: RuntimeDescriptor;
export interface IdeAttachAdapterOptions {
    id?: string;
    displayName?: string;
    /** Filesystem path of the IDE control socket. Missing ⇒ this line is down. */
    socketPath?: string;
    connect?: typeof createConnection;
}
export declare class IdeAttachAdapter implements AgentAdapter {
    readonly id: string;
    readonly kind: "ide";
    readonly displayName: string;
    readonly attach: "attach";
    private readonly socketPath;
    private readonly connectFn;
    private readonly sessions;
    constructor(opts?: IdeAttachAdapterOptions);
    isAvailable(): Promise<boolean>;
    ensureSession(chatId: string, cwd: string, onEvent: (event: BridgeEvent) => void, _routeOverride?: AdapterRoute): Promise<BridgeSession>;
    dispose(chatId: string): Promise<void>;
    reset(chatId: string): Promise<void>;
    disposeAll(): Promise<void>;
    private toHandle;
    private runTurn;
}
