#!/usr/bin/env node
/**
 * The `lark-agent-register` bin — a manual fallback for the registration wizard.
 *
 * The plugin auto-runs the same {@link runRegister} flow at boot when no
 * credentials exist, so most users never need this. It stays useful for
 * re-registering, switching Feishu accounts, or pre-seeding credentials before
 * the first `dsh web` launch.
 *
 * @module lark-agent-bridge/register-cli
 */
export {};
