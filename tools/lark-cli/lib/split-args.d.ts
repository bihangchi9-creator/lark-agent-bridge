/**
 * Tokenize model-generated input into an argv array. A backslash escapes only
 * whitespace, quotes, or another backslash; otherwise it is preserved so
 * Windows paths such as `C:\\Program Files\\Lark` remain intact.
 *
 * @module dsh-tool-lark-cli/split-args
 */
export declare function splitArgs(input: string): string[];
