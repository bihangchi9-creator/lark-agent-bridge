/**
 * Host-agnostic agent adapter contract.
 *
 * The Feishu gateway talks only this vocabulary. dsh implements it in-process
 * (the plugin path). CLI adapters spawn a binary; IDE adapters attach a
 * window; a custom agent implements the same methods. Runtimes never
 * silently replace each other — the chat's pin is the authority.
 *
 * @module lark-agent-bridge/adapter
 */
export {};
