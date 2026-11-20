---
event_date: "2026-11-21"
recorded_at: "2026-11-21 01:36:52"
domain: "work"
type: "session"
client: "codex"
author: "agent"
agent_role: "plugin_maintainer"
status: "active"
superseded_by: null
---

# 0.0.4 fixed-source remediation evidence

## Scope

Source repository: `bihangchi9-creator/lark-agent-bridge` (renamed from
`dsh-lark-bridge`). Package: `@bihangchi9/lark-agent-bridge@0.0.4`.
Original notice: <https://github.com/AI-Scarlett/DSH-Store/issues/656>.

The current official window was resolved on 2026-11-21 from npm and official
GitHub Releases using `build-dsh-plugin` resolver at fixed source
`170f717504b74a1507583a8f83e4c745873f3d45`: 0.2.2-rc.3, 0.2.2-rc.4,
0.2.2-rc.5. Node 24.14.1; macOS arm64.

## Reproduction

1. Install each exact `@deepseek-ai/dsh` version in a separate temporary npm
   project with `--ignore-scripts`.
2. Run `node scripts/test-disposable-dsh.mjs /absolute/path/to/dsh/lib/bin.js`.
3. The harness installs this package using the official plugin manager with
   scripts disabled, reads composed configuration, loads the actual plugin in
   DSH Web with `enabled: false`, authenticates to the loopback host, requires
   HTTP 200 and the plugin's disabled log, stops the host, uninstalls the plugin,
   and compares the restored composition byte-for-byte with its baseline.
4. All homes/state and environment are isolated. Temporary homes are removed.
   No real Feishu credentials, registration, model calls, or user Profile.
5. Repeat all three versions with `DSH_TEST_PLUGIN_SPEC=file:/absolute/path/to/package.tgz`
   pointing at the `npm pack --ignore-scripts` artifact. The packed-only matrix
   also passed; it does not rely on development dependencies beside the source.

| DSH | Install | Start + local authenticated HTTP | Uninstall | Exact baseline restoration |
| --- | --- | --- | --- | --- |
| 0.2.2-rc.3 | passed | passed | passed | passed |
| 0.2.2-rc.4 | passed | passed | passed | passed |
| 0.2.2-rc.5 | passed | passed | passed | passed |

These `dshReleases`/`dshOperations` are **partial E3 host integration**
declarations. They do not establish actual Feishu transport, message/LLM
execution, restricted preset operation, Desktop UI, Windows/Linux runtime,
independent security, or end-user acceptance. Those remain unverified.
Unit/fault tests separately cover access, attachment paths, adapters, logging,
timeout and fail-closed preset boundaries.

## Source/distribution fixes

- Commit both packages' runtime JS/declarations; exclude dangling source maps.
- Retain canonical repository URL; preserve the MIT copyright holders while
  moving descriptive attribution to `NOTICE` (already contains the lineage).
- Declare exact current DSH versions and matching Node/peer ranges.
- Pin direct runtime dependencies; refresh the development lockfile.
- Add a disabled mode for offline load validation and cancel QR registration
  when the plugin is unloaded.
- Document dependency, credential, network, process, permission and failure
  boundaries in `SECURITY.md`.
- Add distribution checks and CI that detects stale generated code.

Local checks: 23 test files / 152 tests passed; root and workspace TypeScript
builds passed; distribution verifier confirmed 56 committed runtime files;
pack inspection found the runtime, LICENSE and both entry
pairs, with no source maps. `build-dsh-plugin` static audit returned 80/80,
`isolated-acceptance-ready`. This static score is not a security certification;
its documentary transaction markers do not prove the legacy setup fallback is
transactional. Initial GitHub CI caught an existing configuration test that
implicitly depended on saved operator credentials; that test now uses only
temporary state and synthetic fixtures. GitHub CI status must be checked
separately after push.

## Marketplace gate that source fixes cannot grant

At inspection, DSH STORE still pinned package `dsh-lark-bridge@0.0.1` at
`2c49e4555865780ec8d11d08e1deca9671387231`, with `blocked` status.
The new canonical repository and scoped npm name require an explicit Store
identity migration; its contract does not silently accept renamed packages.
The bridge also legitimately needs file/network/command/credential abilities
and runtime dependencies. Those require a fixed-source and supply-chain review.
No Store repository changes, submission, comment, approval or installation is
authorized by this source publication.

| Decision | Objective | Benefit | Cost | Evidence | Reconsider when |
| --- | --- | --- | --- | --- | --- |
| Commit artifacts, no prepare | Fixed-Commit installation | No install-time build hook | Generated output must stay in sync | distribution verifier + CI | Source-only installation becomes a requirement |
| Exact three-version range | Honest host scope | No claim about untested releases | Refresh for new DSH versions | disposable matrix | Official window moves |
| Retain elevated capabilities | Preserve real bridge function | No risk concealment | Store review still needed | SECURITY + source/fault tests | Product scope changes |
| Do not update real Profile | Separate release from activation | No user downtime or credential access | Live acceptance deferred | fresh isolated homes | User explicitly authorizes a Profile operation |
