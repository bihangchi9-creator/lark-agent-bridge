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
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { bridgeHome } from './credentials.js';
/** The only runtime the dsh plugin ships today. */
export const DSH_RUNTIME = {
    id: 'dsh',
    kind: 'dsh',
    displayName: 'DeepSeek Harness',
    attach: 'plugin',
};
/** Absolute path to the per-chat runtime pin file. */
export function chatRuntimePath() {
    return join(bridgeHome(), 'chat-runtimes.json');
}
export function isRuntimeId(value, installed) {
    return installed.has(value);
}
export function describeRuntime(id, installed) {
    return installed.find(runtime => runtime.id === id);
}
/**
 * Resolve which runtime this chat should use.
 *
 * A pin always wins, even when that runtime is no longer installed — the
 * caller must then refuse the turn instead of falling back.
 */
export function resolveChatRuntime(chatId, pins, installed, fallbackId) {
    const pinned = pins.get(chatId);
    const id = pinned ?? fallbackId;
    return { id, runtime: describeRuntime(id, installed), pinned: pinned !== undefined };
}
/** Durable per-chat runtime pins. Loaded at construction, persisted on mutation. */
export class ChatRuntimeStore {
    path;
    data = new Map();
    constructor(path) {
        this.path = path;
        try {
            const raw = JSON.parse(readFileSync(this.path, 'utf8'));
            for (const [chatId, id] of Object.entries(raw.runtimes ?? {})) {
                if (typeof id === 'string' && id.length > 0)
                    this.data.set(chatId, id);
            }
        }
        catch {
            // Missing or malformed — start empty.
        }
    }
    get(chatId) {
        return this.data.get(chatId);
    }
    set(chatId, id) {
        this.data.set(chatId, id);
        this.persist();
    }
    clear(chatId) {
        if (!this.data.delete(chatId))
            return;
        this.persist();
    }
    persist() {
        try {
            mkdirSync(dirname(this.path), { recursive: true, mode: 0o700 });
            const payload = { runtimes: Object.fromEntries(this.data) };
            writeFileSync(this.path, `${JSON.stringify(payload, null, 2)}\n`, { mode: 0o600 });
        }
        catch {
            // A lost pin only costs a fallback to the host default at next resolve.
        }
    }
}
