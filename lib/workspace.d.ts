/**
 * Per-chat workspace resolution: the "one group chat, one project folder" rule.
 *
 * Each Feishu chat id maps to a stable directory under the configured
 * workspace root. The directory is created on first use so the agent's `cwd`
 * always exists before it runs a tool.
 *
 * @module lark-agent-bridge/workspace
 */
/**
 * Resolve (and create) the project directory for a chat.
 * `<workspaceRoot>/<safe chatId>`.
 */
export declare function resolveWorkspace(workspaceRoot: string, chatId: string): Promise<string>;
