/**
 * dsh in-process adapter.
 *
 * The Feishu channel still lives inside the dsh plugin; this wrapper only
 * exposes {@link DshBinding} through the host-agnostic {@link AgentAdapter}
 * contract so later CLI/IDE adapters can sit beside it without a fallback.
 *
 * @module lark-agent-bridge/dsh-adapter
 */
import { DSH_RUNTIME } from './runtime.js';
/** Plugin-path adapter: one dsh host, attach = plugin. */
export class DshAdapter {
    binding;
    id = DSH_RUNTIME.id;
    kind = DSH_RUNTIME.kind;
    displayName = DSH_RUNTIME.displayName;
    attach = DSH_RUNTIME.attach;
    constructor(binding) {
        this.binding = binding;
    }
    async isAvailable() {
        return true;
    }
    listModels() {
        return this.binding.listModels();
    }
    ensureSession(chatId, cwd, onEvent, routeOverride) {
        return this.binding.ensureSession(chatId, cwd, onEvent, routeOverride);
    }
    dispose(chatId) {
        return this.binding.dispose(chatId);
    }
    reset(chatId) {
        return this.binding.reset(chatId);
    }
    disposeAll() {
        return this.binding.disposeAll();
    }
}
