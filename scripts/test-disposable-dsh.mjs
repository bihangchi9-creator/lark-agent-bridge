#!/usr/bin/env node
// Integration evidence only: temporary homes, no real account or Profile.
import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const cli = resolve(process.argv[2] ?? '')
if (!process.argv[2]) throw new Error('Usage: node scripts/test-disposable-dsh.mjs /fixed/dsh/lib/bin.js')
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const packageSpec = process.env.DSH_TEST_PLUGIN_SPEC ?? `file:${packageRoot}`
const root = await mkdtemp(join(tmpdir(), 'lark-bridge-e3-'))
// Allowlist environment instead of inheriting account credentials.
const env = {
  PATH: process.env.PATH, HOME: join(root, 'user'), USERPROFILE: join(root, 'user'),
  TMPDIR: root, DSH_HOME: join(root, 'dsh'), DSH_AGENTS_HOME: join(root, 'agents'),
  DSH_LARK_HOME: join(root, 'bridge'), DSH_TELEMETRY_DISABLED: '1',
  npm_config_userconfig: join(root, '.npmrc'), npm_config_registry: 'https://registry.npmjs.org/',
  CI: 'true',
}
const runFile = promisify(execFile)
const result = {
  status: 'failed', dshVersion: '', install: 'unknown', start: 'unknown',
  uninstall: 'unknown', rollback: 'unknown', disposableProfile: true,
  channel: 'disabled-no-network', realProfile: 'unchanged', stage: 'prepare',
}
let child
let hostLog = ''
async function run(args) {
  try {
    return (await runFile(process.execPath, [cli, ...args], {
      cwd: root, env, timeout: 240_000, maxBuffer: 8 * 1024 * 1024,
    })).stdout
  } catch (error) {
    const codes = [...new Set(`${error.stdout ?? ''}${error.stderr ?? ''}`
      .match(/\b(?:ERR_[A-Z0-9_]+|ENOENT|EPERM|EACCES)\b/g) ?? [])]
    throw new Error(`DSH command failed: ${args.slice(0, 4).join(' ')} (${codes.join(',')})`)
  }
}
async function stop() {
  if (!child || child.exitCode !== null || child.signalCode !== null) return
  const current = child
  await new Promise((done, reject) => {
    const timer = setTimeout(() => { current.kill('SIGKILL'); reject(new Error('shutdown-timeout')) }, 15_000)
    current.once('exit', () => { clearTimeout(timer); done() })
    current.kill('SIGTERM')
  })
  child = undefined
}
try {
  for (const dir of [env.HOME, env.DSH_HOME, env.DSH_AGENTS_HOME, env.DSH_LARK_HOME]) {
    await mkdir(dir, { recursive: true })
  }
  await writeFile(env.npm_config_userconfig, '', { mode: 0o600 })
  result.dshVersion = (await run(['--version'])).trim()
  const baseline = await run(['--profile', 'web', '--dump-config'])
  result.stage = 'install'
  await run(['plugin', '--profile', 'web', 'add', '--ignore-scripts', '--config.auto-install-peers=false', packageSpec])
  const installed = await run(['--profile', 'web', '--dump-config'])
  assert.ok(installed.includes('lark-bridge'))
  result.install = 'passed'
  // A real Cordis load, but explicitly no QR registration, Feishu or model calls.
  const overlay = join(root, 'disabled.patch.yml')
  await writeFile(overlay, '- id: lark-bridge\n  config:\n    enabled: false\n')
  const server = createServer()
  await new Promise(done => server.listen(0, '127.0.0.1', done))
  const port = server.address().port
  await new Promise(done => server.close(done))
  result.stage = 'start'
  child = spawn(process.execPath, [cli, 'web', '--patch', overlay, '--no-open', '--port', String(port)], {
    cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'],
  })
  const launchUrl = await new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error('startup-timeout')), 90_000)
    const append = chunk => {
      hostLog = `${hostLog}${chunk}`.slice(-128_000)
      const match = /dsh web: (http:\/\/[^\s]+)/.exec(hostLog)
      if (match) { clearTimeout(timer); done(match[1]) }
    }
    child.stdout.on('data', append)
    child.stderr.on('data', append)
    child.once('error', () => { clearTimeout(timer); reject(new Error('startup-spawn-failed')) })
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`startup-exited-${code}`)) })
  })
  const login = await fetch(launchUrl, { redirect: 'manual', signal: AbortSignal.timeout(10_000) })
  assert.ok([302, 303].includes(login.status))
  const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  assert.ok(cookie)
  const page = await fetch(new URL('/', launchUrl), { headers: { cookie }, signal: AbortSignal.timeout(10_000) })
  assert.equal(page.status, 200)
  assert.ok(hostLog.includes('disabled by config'), 'bridge module must actually load')
  assert.ok(!/failed to initialize|failed to load|cannot find module|ERR_MODULE_NOT_FOUND/i.test(hostLog))
  result.start = 'passed'
  await stop()
  result.stage = 'uninstall'
  await run(['plugin', '--profile', 'web', 'remove', '@bihangchi9/lark-agent-bridge'])
  const removed = await run(['--profile', 'web', '--dump-config'])
  assert.ok(!removed.includes('lark-bridge'))
  result.uninstall = 'passed'
  assert.equal(removed, baseline, 'uninstall must restore exact baseline composition')
  result.rollback = 'passed'
  result.status = 'passed'
  result.stage = 'complete'
} catch (error) {
  result.reason = error.message
  // Only known diagnostics, never credential-bearing host output.
  result.diagnostics = hostLog.split('\n').filter(line =>
    /error|failed|cannot|incompatible|volatile/i.test(line)).slice(-12).map(line => line.slice(0, 300))
  process.exitCode = 1
} finally {
  await stop().catch(() => {})
  if (child && child.exitCode === null) child.kill('SIGKILL')
  await rm(root, { recursive: true, force: true })
}
console.log(JSON.stringify(result))
