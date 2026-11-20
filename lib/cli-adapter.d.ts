/**
 * CLI spawn adapter (trae-to-lark shape).
 *
 * Each Feishu turn spawns `traex` / `codex` with `exec --json`. The child is
 * not an IDE window: closing TRAE/Doubao does not affect this line. A missing
 * binary makes {@link isAvailable} false; the gateway then fails closed
 * instead of retargeting the chat.
 *
 * @module lark-agent-bridge/cli-adapter
 */
import spawn from 'cross-spawn';
import type { AgentAdapter, AdapterRoute, BridgeEvent, BridgeSession } from './adapter.js';
import type { RuntimeDescriptor } from './runtime.js';
export declare const TRAEX_RUNTIME: RuntimeDescriptor;
export declare const CODEX_RUNTIME: RuntimeDescriptor;
export declare const CLAUDE_RUNTIME: RuntimeDescriptor;
export type SpawnFn = typeof spawn;
export interface CliSpawnAdapterOptions {
    id: string;
    displayName: string;
    binary: string;
    sandbox?: 'read-only' | 'workspace-write' | 'danger-full-access';
    spawnFn?: SpawnFn;
    env?: NodeJS.ProcessEnv;
    catalogPath?: string;
    threadsPath?: string;
    pathExt?: string;
}
/** Build the minimal environment a spawned agent needs without leaking host secrets. */
export declare function sanitizeChildEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
/** Codex-family CLI adapter: spawn `exec --json`, resume by thread id. */
export declare class CliSpawnAdapter implements AgentAdapter {
    readonly id: string;
    readonly kind: "cli";
    readonly displayName: string;
    readonly attach: "spawn";
    private readonly binary;
    private readonly sandbox;
    private readonly spawnFn;
    private readonly env;
    private readonly pathExt;
    private readonly catalog;
    private readonly threadsPath;
    private readonly threads;
    private readonly sessions;
    constructor(opts: CliSpawnAdapterOptions);
    isAvailable(): Promise<boolean>;
    ensureSession(chatId: string, cwd: string, onEvent: (event: BridgeEvent) => void, routeOverride?: AdapterRoute): Promise<BridgeSession>;
    dispose(chatId: string): Promise<void>;
    reset(chatId: string): Promise<void>;
    disposeAll(): Promise<void>;
    private toHandle;
    private runTurn;
    private loadThreads;
    private persistThreads;
}
/** Map bridge preset names onto Codex-family sandbox modes. Unknown presets fail closed. */
export declare function sandboxForPreset(preset: string | undefined, fallback: 'read-only' | 'workspace-write' | 'danger-full-access'): 'read-only' | 'workspace-write' | 'danger-full-access';
export declare function buildCodexExecArgs(input: {
    cwd: string;
    sandbox: 'read-only' | 'workspace-write' | 'danger-full-access';
    threadId?: string;
    model?: string;
}): string[];
/** Locate an executable on PATH without spawning a shell. */
export declare function resolveExecutablePath(command: string, pathValue: string, pathExt?: string): string | undefined;
/** Detect the supported Codex-family CLI runtimes present on PATH. */
export declare function detectCliAdapters(env?: NodeJS.ProcessEnv): CliSpawnAdapter[];
