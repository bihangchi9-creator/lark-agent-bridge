---
event_date: "2026-11-21"
recorded_at: "2026-11-21 01:38:00"
domain: "work"
type: "component"
client: "codex"
author: "agent"
agent_role: "plugin_maintainer"
status: "active"
superseded_by: null
---

# Security and distribution boundaries

This is a **high-permission network/agent bridge**, not a zero-permission
plugin. Publishing artifacts or passing tests does not complete a supply-chain
review or authorize automatic DSH STORE admission. Keep `user-reviewed` or
`blocked` until the Store has reviewed the exact source and dependencies.

## Capabilities and ownership

| Surface | Behavior / allowed caller | Bounds and failure behavior | Evidence |
| --- | --- | --- | --- |
| Feishu/Lark network | Outbound HTTPS/WebSocket to the selected tenant; sends agent replies and downloads attachments | Group/user allowlists; owner-only admin commands; bounded queues, replies and attachment downloads | `tests/access.test.ts`, `tests/attachments.test.ts`, `tests/reliability.test.ts` |
| Local files | Reads/writes bridge-private state under `DSH_LARK_HOME` (default `~/.dsh-lark-bridge`); creates per-chat workspaces | Private directory/credential modes 0700/0600; attachment paths validated; state persistence failures can lose metadata and require operator recovery | `tests/config.test.ts`, `tests/workspace.test.ts`, `tests/session-catalog.test.ts` |
| Credentials | Reads inline config, environment or saved Feishu credentials; registration creates a Feishu app only after QR confirmation | SDK logging is routed through a bounded secret redactor; inline `appSecret` has schema role `secret` | `tests/safe-log.test.ts`, `tests/config.test.ts` |
| DSH agents | Creates/resumes/disposes sessions through host services; preset determines agent tools | Named restricted presets fail closed; `full` uses the host's full capabilities and must be restricted to trusted users | `tests/preset-mount.test.ts`, `tests/dsh-adapter.test.ts` |
| Processes | CLI adapters spawn installed executables; SSO checker uses configured argv; workspace tool invokes `lark-cli` | No shell-string execution; timeout and exit checks. Empty `allowedPrefixes` grants all operations of the logged-in lark-cli identity | `tests/cli-adapter.test.ts`, `tests/tool-lark-cli.test.ts` |
| IDE / custom adapters | Connects to an explicitly configured IDE socket; imports an operator-selected custom module | These are trusted local extensions, not sandboxed code; a missing pinned runtime never silently falls back | `tests/ide-adapter.test.ts`, `tests/custom-adapter.test.ts`, `tests/runtime.test.ts` |
| Setup scripts | Explicit user-run installation changes a selected Profile and copies presets | **Not an install lifecycle hook.** Legacy manual fallback is not an atomic transaction. Review, back up and run only with explicit authorization; prefer the official manager | `tests/install-robustness.test.ts` |

The bridge never modifies DSH core or replaces the official plugin inventory.
Removing file/command/network signals merely to pass a scanner would disable
the product or conceal its risk; those capabilities are intentionally retained.

## Dependencies and external services

- Direct runtime dependencies are pinned: `@larksuite/channel@0.4.1`,
  `cross-spawn@7.0.6`, `qrcode-terminal@0.12.0`.
- `pnpm-lock.yaml` records transitive resolutions and integrity values for
  reproducible development. A downstream Git/npm installation may independently
  resolve transitive ranges: the lockfile is **not** an independent safety audit.
- Cordis, Schemastery and the workspace tool's `dsh-tools` are host peers; do not
  install a second copy of DSH core to bypass an incompatible host.
- Feishu uses `open.feishu.cn`; Lark uses `open.larksuite.com`. The official SDK
  owns registration/API endpoints and outbound connections. Proxy environment
  variables are honored in normal operation.
- An actual LLM call needs a separately configured provider account. CLI, IDE,
  custom adapters and `lark-cli` depend on the operator's local installations
  and permissions. This repository does not install or authenticate them.

## Fixed source and install contract

The canonical repository is
`https://github.com/bihangchi9-creator/lark-agent-bridge`; the former
`dsh-lark-bridge` URL is an alias. Pin installations to the full 40-character
Git Commit, not floating `main`.

Compiled JavaScript and TypeScript declarations for both packages are committed
and included in the package file allowlist. Source maps are not shipped.
There are no `preinstall`, `install`, `postinstall` or `prepare` scripts.
There is also no `prepack` hook (npm may invoke it when installing Git sources).
Maintainers explicitly use `pnpm pack:checked` to build and check artifacts.

## Verification versus acceptance

Use `enabled: false` in the bundle row's config to load the module without
reading credentials, starting registration or opening a Feishu channel.
The disposable harness uses fresh `HOME`, `DSH_HOME`, `DSH_LARK_HOME` and an
allowlisted environment, disables the channel, and checks official installation,
host startup, authenticated local HTTP, uninstall and exact configuration
restoration. Its results are **partial integration evidence**, not real
Feishu/LLM/Desktop acceptance or an independent security review.

Before changing a real Profile: use a single-use plan naming its exact source,
file scope and commands; obtain an exact confirmation; check SHA-256
preconditions and concurrent state; keep an external backup; use the official
manager's atomic writes; perform a health check; and test rollback. The repository
release does not authorize this operation. Existing setup/manual scripts are not
a substitute for that transaction protocol.

Report suspected security issues privately to the repository owner before
publishing credential-bearing logs or exploit details.
