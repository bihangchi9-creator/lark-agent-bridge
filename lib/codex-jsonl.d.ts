/**
 * Translate Codex-family JSONL (`codex exec --json` / `traex exec --json`)
 * into the gateway's {@link BridgeEvent} stream.
 *
 * Protocol is the one trae-to-lark already ships against: thread/turn/item
 * events, plus a duplicated agent_message shape across versions.
 *
 * @module lark-agent-bridge/codex-jsonl
 */
import type { BridgeEvent } from './dsh-binding.js';
export declare class CodexJsonlTranslator {
    threadId: string | undefined;
    private terminal;
    private pendingAgentMessage;
    translate(raw: unknown): BridgeEvent[];
    finish(reason?: 'completed' | 'interrupted' | 'failed'): BridgeEvent[];
    private queueAgentMessage;
    private flushPending;
}
