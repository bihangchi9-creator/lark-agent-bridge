import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('..', import.meta.url))
const pkg = JSON.parse(readFileSync(`${root}/package.json`, 'utf8'))

describe('fixed-Commit distribution contract', () => {
  it('uses canonical repository and consistent license, Node and DSH declarations', () => {
    expect(pkg.repository.url).toBe('git+https://github.com/bihangchi9-creator/lark-agent-bridge.git')
    expect(pkg.license).toBe('MIT')
    expect(pkg.files).toContain('LICENSE')
    expect(pkg.engines.node).toBe('>=24.9.0')
    expect(pkg.engines.dsh).toBe(pkg.dsh.compatibility.dsh)
    expect(Object.keys(pkg.dsh.compatibility.dshReleases)).toEqual([
      '0.2.2-rc.3', '0.2.2-rc.4', '0.2.2-rc.5',
    ])
  })

  it('does not run lifecycle scripts at install or remove required capabilities to hide risk', () => {
    for (const script of ['preinstall', 'install', 'postinstall', 'prepare', 'prepack']) {
      expect(pkg.scripts[script]).toBeUndefined()
    }
    expect(pkg.dependencies).toEqual({
      '@larksuite/channel': '0.4.1', 'cross-spawn': '7.0.6', 'qrcode-terminal': '0.12.0',
    })
    expect(pkg.files).toContain('SECURITY.md')
  })

  it('does not ship dangling source maps', () => {
    for (const path of ['tsconfig.json', 'tools/lark-cli/tsconfig.json']) {
      const config = JSON.parse(readFileSync(`${root}/${path}`, 'utf8'))
      expect(config.compilerOptions.sourceMap).toBe(false)
      expect(config.compilerOptions.declarationMap).toBe(false)
    }
  })
})
