/**
 * Tokenize a command line into argv tokens. No shell is involved — this only
 * parses configuration/model-generated input into an argument array, honoring
 * single/double quotes. A backslash escapes only whitespace, quotes, or another
 * backslash; otherwise it is preserved so Windows paths survive intact.
 *
 * @module lark-agent-bridge/split-args
 */
export declare function splitArgs(input: string): string[];
