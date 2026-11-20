/**
 * Slash-command parsing for the Feishu bridge.
 *
 * Commands are handled locally (never forwarded to the agent) and let a chat
 * manage its own session: reset context, inspect the working directory, switch
 * model, or read help. Anything not starting with `/` is an agent prompt.
 *
 * @module lark-agent-bridge/commands
 */
/** A recognized command plus its raw argument tail. */
export type Command = {
    kind: 'help';
} | {
    kind: 'new';
} | {
    kind: 'where';
} | {
    kind: 'model';
    value?: string;
} | {
    kind: 'models';
} | {
    kind: 'preset';
    value?: string;
} | {
    kind: 'agent';
    value?: string;
} | {
    kind: 'allow';
} | {
    kind: 'disallow';
} | {
    kind: 'whoami';
} | {
    kind: 'unknown';
    name: string;
};
/** Parse leading-slash input into a {@link Command}, or `undefined` for a normal prompt. */
export declare function parseCommand(text: string): Command | undefined;
/** The help text shown for `/help`. */
export declare const HELP_TEXT: string;
