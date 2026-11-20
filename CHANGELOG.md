---
event_date: "2026-11-21"
recorded_at: "2026-11-21 01:36:52"
domain: "work"
type: "log"
client: "codex"
author: "agent"
agent_role: "plugin_maintainer"
status: "active"
superseded_by: null
---

# Changelog

## 0.0.4 — 2026-11-21

Remediation for <https://github.com/AI-Scarlett/DSH-Store/issues/656>.

- Ship compiled JS/declarations in Git for the bridge and bundled workspace tool.
- Normalize MIT text without removing either copyright holder; full lineage
  remains in NOTICE. Explicitly include LICENSE and SECURITY in distribution.
- Remove prepack/prepare/install execution for Git consumers; packaging is an
  explicit `pnpm pack:checked` maintainer command.
- Declare **Node >=24.9.0** and the exact DSH 0.2.2-rc.3/rc.4/rc.5 host window.
  Older Node/DSH versions are no longer claimed by this release.
- Align host peers, pin direct runtime dependencies and update pnpm lockfile.
- Add explicit disabled configuration and abort registration polling on unload.
- Add fixed-source distribution tests, reproducible-artifact CI, and a disposable
  lifecycle harness. Source and packed artifacts both passed all three hosts'
  install/start/uninstall/baseline-restoration checks.
- Isolate configuration tests from real saved credentials and check the
  credential-free path explicitly (initial clean Linux CI exposed this old gap).
- Document elevated permissions, dependency review and the Store identity
  migration gate. Real Feishu/LLM/Desktop acceptance remains unverified;
  no real Profile was updated and no npm publication was performed.
