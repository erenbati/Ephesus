// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CommandBar } from '../../src/renderer/src/CommandBar'
import type { CommandState } from '../../src/shared/commands'
import type { EphApi } from '../../src/shared/ipc'

type BarBridge = {
  agents: Pick<EphApi['agents'], 'list' | 'onChange' | 'interrupt'>
  commands: Pick<EphApi['commands'], 'list' | 'onChange' | 'submit'>
}

let root: Root | null = null
let host: HTMLDivElement | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
  delete (window as { eph?: unknown }).eph
  vi.restoreAllMocks()
})

function rig(initial: readonly CommandState[] = []) {
  const offAgents = vi.fn()
  const offCommands = vi.fn()
  const submit = vi.fn<BarBridge['commands']['submit']>(async (agentId, _text) => ({
    agentId,
    held: null,
    reason: null
  }))
  const interrupt = vi.fn<BarBridge['agents']['interrupt']>(async () => undefined)
  let pushCommand: (state: CommandState) => void = () => {
    throw new Error('command listener not registered')
  }
  const bridge: BarBridge = {
    agents: {
      list: async () => [],
      onChange: () => offAgents,
      interrupt
    },
    commands: {
      list: async () => initial,
      onChange: (callback) => {
        pushCommand = callback
        return offCommands
      },
      submit
    }
  }
  Object.assign(window, { eph: bridge })
  return {
    submit,
    interrupt,
    offAgents,
    offCommands,
    push: async (state: CommandState) => {
      await act(async () => pushCommand(state))
    }
  }
}

async function mount(selected: string | null) {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  const onSelect = vi.fn()
  const onAgentSeen = vi.fn()
  await act(async () => {
    root!.render(
      <CommandBar selected={selected} onSelect={onSelect} onAgentSeen={onAgentSeen} />
    )
  })
  return { onSelect, onAgentSeen }
}

function input(): HTMLInputElement {
  const found = host?.querySelector<HTMLInputElement>('input[aria-label="Prompt"]')
  if (!found) throw new Error('prompt input missing')
  return found
}

function button(label: string): HTMLButtonElement {
  const found = [...(host?.querySelectorAll('button') ?? [])].find(
    (node) => node.textContent?.trim() === label
  )
  if (!found) throw new Error(`button missing: ${label}`)
  return found
}

async function typePrompt(value: string) {
  const field = input()
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    if (!setter) throw new Error('input value setter missing')
    setter.call(field, value)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

async function click(label: string) {
  await act(async () => button(label).click())
}

describe('CommandBar bridge seam', () => {
  it('disables prompt and buttons without a selected agent or bridge', async () => {
    await mount(null)
    expect(input().disabled).toBe(true)
    expect(button('Send').disabled).toBe(true)
    expect(button('Interrupt').disabled).toBe(true)
    expect(host?.textContent).toContain('no agents')
  })

  it('shows the queued text and reason returned by main, then clears on an update', async () => {
    const fake = rig([{ agentId: 'agent.mason', held: 'do not lose this', reason: 'mid-turn' }])
    await mount('agent.mason')
    expect(host?.textContent).toContain('queued (mid-turn): do not lose this')
    await fake.push({ agentId: 'agent.mason', held: null, reason: null })
    expect(host?.textContent).toContain('nothing queued')
    expect(host?.textContent).not.toContain('do not lose this')
  })

  it('sends trimmed text only to the selected agent and clears the input on success', async () => {
    const fake = rig()
    await mount('agent.mason')
    await typePrompt('  check the build  ')
    await click('Send')
    expect(fake.submit).toHaveBeenCalledExactlyOnceWith('agent.mason', 'check the build')
    expect(input().value).toBe('')
  })

  it('does not send whitespace-only text', async () => {
    const fake = rig()
    await mount('agent.mason')
    await typePrompt('   ')
    await click('Send')
    expect(fake.submit).not.toHaveBeenCalled()
  })

  it('shows submission errors instead of clearing an unsent prompt', async () => {
    const fake = rig()
    fake.submit.mockRejectedValueOnce(new Error('IPC disconnected'))
    await mount('agent.mason')
    await typePrompt('save this text')
    await click('Send')
    expect(host?.textContent).toContain('IPC disconnected')
    expect(input().value).toBe('save this text')
  })

  it('interrupts only the selected agent and visibly reports failure', async () => {
    const fake = rig()
    fake.interrupt.mockRejectedValueOnce(new Error('PTY unavailable'))
    await mount('agent.mason')
    await click('Interrupt')
    expect(fake.interrupt).toHaveBeenCalledExactlyOnceWith('agent.mason')
    expect(host?.textContent).toContain('PTY unavailable')
  })

  it('unsubscribes both bridge listeners on unmount', async () => {
    const fake = rig()
    await mount('agent.mason')
    await act(async () => root?.unmount())
    root = null
    expect(fake.offAgents).toHaveBeenCalledOnce()
    expect(fake.offCommands).toHaveBeenCalledOnce()
  })
})
