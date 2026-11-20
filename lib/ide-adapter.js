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
import { lstatSync } from 'node:fs';
import { createConnection } from 'node:net';
export const IDE_RUNTIME = {
    id: 'ide',
    kind: 'ide',
    displayName: 'IDE window',
    attach: 'attach',
};
const EVENT_TYPES = new Set(['text', 'thinking', 'final_text', 'tool_use', 'tool_result', 'done', 'error']);
const MAX_IDE_JSONL_LINE_BYTES = 1024 * 1024;
const MAX_EVENT_TEXT_CHARS = 256 * 1024;
export class IdeAttachAdapter {
    id;
    kind = 'ide';
    displayName;
    attach = 'attach';
    socketPath;
    connectFn;
    sessions = new Map();
    constructor(opts = {}) {
        this.id = opts.id ?? IDE_RUNTIME.id;
        this.displayName = opts.displayName ?? IDE_RUNTIME.displayName;
        this.socketPath = opts.socketPath ?? process.env.LARK_BRIDGE_IDE_SOCKET;
        this.connectFn = opts.connect ?? createConnection;
    }
    async isAvailable() {
        if (!this.socketPath)
            return false;
        try {
            const info = lstatSync(this.socketPath);
            if (!info.isSocket() || info.isSymbolicLink())
                return false;
            if (typeof process.getuid === 'function' && info.uid !== process.getuid())
                return false;
            // Group/other writable sockets allow unrelated local users to impersonate
            // the IDE sidecar. Require owner-only write access.
            if ((info.mode & 0o022) !== 0)
                return false;
            return true;
        }
        catch {
            return false;
        }
    }
    async ensureSession(chatId, cwd, onEvent, _routeOverride) {
        const existing = this.sessions.get(chatId);
        if (existing) {
            existing.onEvent = onEvent;
            existing.cwd = cwd;
            return this.toHandle(chatId);
        }
        this.sessions.set(chatId, { cwd, onEvent });
        return this.toHandle(chatId);
    }
    async dispose(chatId) {
        const session = this.sessions.get(chatId);
        session?.socket?.destroy();
        this.sessions.delete(chatId);
    }
    async reset(chatId) {
        await this.dispose(chatId);
    }
    async disposeAll() {
        const ids = [...this.sessions.keys()];
        await Promise.allSettled(ids.map(id => this.dispose(id)));
    }
    toHandle(chatId) {
        return {
            sessionId: `${this.id}-${chatId}`,
            send: (text) => {
                void this.runTurn(chatId, text);
            },
            dispose: () => this.dispose(chatId),
        };
    }
    async runTurn(chatId, text) {
        const session = this.sessions.get(chatId);
        if (!session)
            return;
        const available = await this.isAvailable();
        if (this.sessions.get(chatId) !== session)
            return;
        if (!available || !this.socketPath) {
            session.onEvent({
                type: 'error',
                message: `${this.displayName} window is down; this line is not retargeted`,
            });
            session.onEvent({ type: 'done', reason: 'failed' });
            return;
        }
        if (session.socket) {
            session.onEvent({ type: 'error', message: `${this.id} already has a turn in flight` });
            return;
        }
        const socket = this.connectFn({ path: this.socketPath });
        session.socket = socket;
        let terminal = false;
        const finish = (events = []) => {
            if (terminal)
                return;
            terminal = true;
            session.socket = undefined;
            for (const event of events)
                session.onEvent(event);
            socket.destroy();
        };
        socket.on('error', err => {
            finish([
                { type: 'error', message: err.message },
                { type: 'done', reason: 'failed' },
            ]);
        });
        socket.on('close', () => {
            if (!terminal) {
                finish([
                    { type: 'error', message: `${this.displayName} window closed during the turn` },
                    { type: 'done', reason: 'failed' },
                ]);
            }
        });
        let buffer = '';
        socket.on('data', chunk => {
            if (terminal)
                return;
            buffer += chunk.toString('utf8');
            if (Buffer.byteLength(buffer) > MAX_IDE_JSONL_LINE_BYTES && !buffer.includes('\n')) {
                finish([
                    { type: 'error', message: 'IDE sidecar emitted an oversized JSONL line' },
                    { type: 'done', reason: 'failed' },
                ]);
                return;
            }
            for (;;) {
                const newline = buffer.indexOf('\n');
                if (newline < 0)
                    break;
                const trimmed = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                if (!trimmed)
                    continue;
                if (Buffer.byteLength(trimmed) > MAX_IDE_JSONL_LINE_BYTES) {
                    finish([
                        { type: 'error', message: 'IDE sidecar emitted an oversized JSONL line' },
                        { type: 'done', reason: 'failed' },
                    ]);
                    return;
                }
                let parsed;
                try {
                    parsed = JSON.parse(trimmed);
                }
                catch {
                    continue;
                }
                const event = asBridgeEvent(parsed);
                if (!event)
                    continue;
                session.onEvent(event);
                if (event.type === 'done' || event.type === 'error') {
                    if (event.type === 'error')
                        session.onEvent({ type: 'done', reason: 'failed' });
                    terminal = true;
                    session.socket = undefined;
                    socket.destroy();
                    return;
                }
            }
        });
        socket.write(`${JSON.stringify({ type: 'prompt', chatId, cwd: session.cwd, text })}\n`);
    }
}
function asBridgeEvent(value) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    const type = value.type;
    if (typeof type !== 'string' || !EVENT_TYPES.has(type))
        return undefined;
    const event = value;
    for (const key of ['delta', 'content', 'message', 'name', 'reason']) {
        const field = event[key];
        if (typeof field === 'string' && field.length > MAX_EVENT_TEXT_CHARS)
            return undefined;
    }
    return value;
}
