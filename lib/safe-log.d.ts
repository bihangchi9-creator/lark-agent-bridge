/**
 * Safe logging for bridge and SDK errors.
 *
 * Third-party HTTP errors may contain complete request configs, including
 * Authorization headers and credentials. Never pass opaque objects directly
 * to console: reduce Error-like values to a small diagnostic summary and
 * recursively redact ordinary metadata.
 *
 * @module lark-agent-bridge/safe-log
 */
export type LogLevel = 'info' | 'warn' | 'error';
export type LogFn = (level: LogLevel, msg: string, extra?: unknown) => void;
/** Redact credential-shaped substrings while preserving useful error text. */
export declare function redactLogText(value: string): string;
/** Convert any log value into bounded, serializable, credential-safe data. */
export declare function sanitizeLogValue(value: unknown): unknown;
/** Logger passed into @larksuite/channel and its underlying Feishu SDK. */
export declare function createSafeSdkLogger(log: LogFn): {
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    trace: (...args: unknown[]) => void;
};
