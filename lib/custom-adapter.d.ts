/**
 * Load a user-supplied adapter module for the standalone daemon.
 *
 * The module is ordinary ESM/CJS. It must export one of:
 *   - `adapter` — an {@link AgentAdapter}
 *   - `createAdapter()` — factory returning an adapter (sync or async)
 *   - `default` — adapter or factory
 *
 * Set `LARK_BRIDGE_CUSTOM_ADAPTER` to the module path. The adapter's `id`
 * is what `/agent` pins; kind should be `custom` (spawn or attach).
 *
 * @module lark-agent-bridge/custom-adapter
 */
import type { AgentAdapter } from './adapter.js';
export declare function loadCustomAdapter(specifier: string): Promise<AgentAdapter>;
