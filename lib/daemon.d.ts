#!/usr/bin/env node
/**
 * Standalone Feishu gateway for CLI / IDE / custom runtimes.
 *
 * This process is *not* a dsh plugin. It opens the same Lark WebSocket, then
 * routes each chat to a pinned spawn/attach adapter. dsh stays in-process
 * via {@link apply} in index.ts.
 *
 *   node lib/daemon.js
 *   LARK_BRIDGE_RUNTIME=traex node lib/daemon.js
 *   LARK_BRIDGE_IDE_SOCKET=/tmp/ide.sock node lib/daemon.js
 *   LARK_BRIDGE_CUSTOM_ADAPTER=./examples/custom-adapter.mjs node lib/daemon.js
 *
 * @module lark-agent-bridge/daemon
 */
import type { AgentAdapter } from './adapter.js';
import { LarkBridge } from './lark.js';
/** Discover CLI / IDE / custom adapters. IDE is included even when down. */
export declare function loadDaemonAdapters(env?: NodeJS.ProcessEnv): Promise<AgentAdapter[]>;
export declare function resolveDefaultRuntimeId(adapters: readonly AgentAdapter[], preferred: string | undefined): string;
export declare function startDaemon(env?: NodeJS.ProcessEnv): Promise<LarkBridge>;
