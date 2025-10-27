import { describe, it, expect } from 'vitest'
import { isItemVisible, isItemRequired, isFilled } from '../app/composables/visibility'

describe('visibility composable', () => {
  it('isItemRequired respects required boolean', () => {
    expect(isItemRequired({ required: true } as any)).toBe(true)
    expect(isItemRequired({ required: false } as any)).toBe(false)
    expect(isItemRequired({} as any)).toBe(false)
  })

  it('isFilled checks non-empty values', () => {
    expect(isFilled('x')).toBe(true)
    expect(isFilled(0)).toBe(true)
    expect(isFilled(false)).toBe(true)
    expect(isFilled('')).toBe(false)
    expect(isFilled(null)).toBe(false)
    expect(isFilled(undefined)).toBe(false)
  })

  it('isItemVisible true when no visible rule', () => {
    const item = { name: 'a' } as any
    expect(isItemVisible(item, {})).toBe(true)
  })

  it('isItemVisible handles string required rule', () => {
    const item = { visible: 'foo:required' } as any
    expect(isItemVisible(item, { foo: '' })).toBe(false)
    expect(isItemVisible(item, { foo: 'x' })).toBe(true)
  })

  it('isItemVisible handles string equality rule', () => {
    const item = { visible: 'foo:is:bar' } as any
    expect(isItemVisible(item, { foo: 'bar' })).toBe(true)
    expect(isItemVisible(item, { foo: 'baz' })).toBe(false)
  })

  it('isItemVisible handles object form', () => {
    const item = { visible: { field: 'kind', equals: 'full' } } as any
    expect(isItemVisible(item, { kind: 'full' })).toBe(true)
    expect(isItemVisible(item, { kind: 'half' })).toBe(false)
  })
})

