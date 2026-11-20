/**
 * dsh in-process adapter.
 *
 * The Feishu channel still lives inside the dsh plugin; this wrapper only
 * exposes {@link DshBinding} through the host-agnostic {@link AgentAdapter}
 * contract so later CLI/IDE adapters can sit beside it without a fallback.
 *
 * @module lark-agent-bridge/dsh-adapter
 */
import type { AgentAdapter, AdapterRoute, BridgeEvent, BridgeSession } from './adapter.js';
import type { DshBinding } from './dsh-binding.js';
/** Plugin-path adapter: one dsh host, attach = plugin. */
export declare class DshAdapter implements AgentAdapter {
    private readonly binding;
    readonly id: string;
    readonly kind: import("./runtime.js").RuntimeKind;
    readonly displayName: string;
    readonly attach: import("./adapter.js").AdapterAttach;
    constructor(binding: DshBinding);
    isAvailable(): Promise<boolean>;
    listModels(): Promise<Array<{
        provider: string;
        providerName?: string;
        models: Array<{
            id: string;
            name?: string;
        }>;
    }>>;
    ensureSession(chatId: string, cwd: string, onEvent: (event: BridgeEvent) => void, routeOverride?: AdapterRoute): Promise<BridgeSession>;
    dispose(chatId: string): Promise<void>;
    reset(chatId: string): Promise<void>;
    disposeAll(): Promise<void>;
}
