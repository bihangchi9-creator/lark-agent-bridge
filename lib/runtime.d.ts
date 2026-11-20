/**
 * Per-chat runtime pins.
 *
 * A Feishu chat has one conversation on one runtime. Several runtimes may
 * be installed on the host; they never silently replace each other. If the
 * pinned runtime is missing or down (IDE window closed), the turn fails
 * closed instead of retargeting.
 *
 * @module lark-agent-bridge/runtime
 */
import type { AdapterAttach } from './adapter.js';
/** The four host classes this skill recognizes. */
export type RuntimeKind = 'dsh' | 'cli' | 'ide' | 'custom';
/** One installed runtime the gateway can pin a chat to. */
export interface RuntimeDescriptor {
    id: string;
    kind: RuntimeKind;
    displayName: string;
    attach: AdapterAttach;
}
/** The only runtime the dsh plugin ships today. */
export declare const DSH_RUNTIME: RuntimeDescriptor;
/** Absolute path to the per-chat runtime pin file. */
export declare function chatRuntimePath(): string;
export declare function isRuntimeId(value: string, installed: ReadonlySet<string>): boolean;
export declare function describeRuntime(id: string, installed: readonly RuntimeDescriptor[]): RuntimeDescriptor | undefined;
/**
 * Resolve which runtime this chat should use.
 *
 * A pin always wins, even when that runtime is no longer installed — the
 * caller must then refuse the turn instead of falling back.
 */
export declare function resolveChatRuntime(chatId: string, pins: {
    get(chatId: string): string | undefined;
}, installed: readonly RuntimeDescriptor[], fallbackId: string): {
    id: string;
    runtime: RuntimeDescriptor | undefined;
    pinned: boolean;
};
/** Durable per-chat runtime pins. Loaded at construction, persisted on mutation. */
export declare class ChatRuntimeStore {
    private readonly path;
    private readonly data;
    constructor(path: string);
    get(chatId: string): string | undefined;
    set(chatId: string, id: string): void;
    clear(chatId: string): void;
    private persist;
}
