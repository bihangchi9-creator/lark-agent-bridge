import { describe, expect, it, vi } from 'vitest'

const { register } = vi.hoisted(() => ({ register: vi.fn() }))
vi.mock('../src/register.js', () => ({ runRegister: register }))
vi.mock('../src/credentials.js', () => ({
  readCredentials: () => undefined,
  registerUrlPath: () => '/temporary/registration',
  writeRegisterUrl: vi.fn(),
}))
import { apply } from '../src/index'

describe('plugin registration lifecycle', () => {
  it('aborts QR polling on unload instead of leaving a registration task running', () => {
    vi.stubEnv('LARK_APP_ID', '')
    vi.stubEnv('LARK_APP_SECRET', '')
    register.mockImplementation(() => new Promise(() => {}))
    let dispose: (() => Promise<void>) | undefined
    const ctx = { effect: (fn: () => () => Promise<void>) => { dispose = fn() } }
    try {
      apply(ctx as never, {})
      const { signal } = register.mock.calls.at(-1)![0]
      expect(signal.aborted).toBe(false)
      expect(dispose).toBeDefined()
      void dispose!()
      expect(signal.aborted).toBe(true)
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
