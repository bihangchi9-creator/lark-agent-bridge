#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(process.argv[2] ?? fileURLToPath(new URL('..', import.meta.url)))
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
assert.equal(pkg.repository.url, 'git+https://github.com/bihangchi9-creator/lark-agent-bridge.git')
assert.equal(pkg.license, 'MIT')
assert.equal(pkg.engines.dsh, pkg.dsh.compatibility.dsh)
assert.ok(pkg.files.includes('LICENSE'))
for (const name of ['preinstall', 'install', 'postinstall', 'prepare', 'prepack']) {
  assert.equal(pkg.scripts[name], undefined, `${name} must not run on installation`)
}
const tracked = new Set(execFileSync('git', ['ls-files', '--cached'], {
  cwd: root, encoding: 'utf8',
}).trim().split('\n'))
const runtimeFiles = []
for (const dir of ['lib', 'tools/lark-cli/lib']) {
  for (const name of readdirSync(resolve(root, dir))) {
    if (!/\.(js|d\.ts)$/.test(name)) continue
    const path = `${dir}/${name}`
    assert.ok(statSync(resolve(root, path)).isFile(), `${path} must be a regular file`)
    assert.ok(tracked.has(path), `${path} is absent from the Git index: stage build output`)
    runtimeFiles.push(path)
    const text = readFileSync(resolve(root, path), 'utf8')
    assert.ok(!text.includes('sourceMappingURL='), `${path} references an unshipped source map`)
    for (const match of text.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)) {
      const target = resolve(root, dir, match[1])
      assert.ok(tracked.has(relative(root, target)), `${path}: missing local import ${match[1]}`)
    }
  }
}
const entries = [
  pkg.main, pkg.types, ...Object.values(pkg.bin),
  pkg.exports['.'].default, pkg.exports['.'].types,
  pkg.dsh.bundle.patch, 'LICENSE', 'NOTICE', 'SECURITY.md',
  'tools/lark-cli/lib/index.js', 'tools/lark-cli/lib/index.d.ts',
]
for (const path of entries) {
  assert.ok(tracked.has(path.replace(/^\.\//, '')), `${path} missing from Git index`)
}
console.log(JSON.stringify({
  status: 'passed', package: `${pkg.name}@${pkg.version}`,
  runtimeFiles: runtimeFiles.length, installLifecycle: [], fixedGitArtifacts: true,
}))
