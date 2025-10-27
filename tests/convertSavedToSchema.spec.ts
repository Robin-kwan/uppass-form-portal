import { describe, it, expect } from 'vitest'
import { convertSavedToSchema } from '../app/composables/schema'

describe('convertSavedToSchema', () => {
  it('maps SavedSchema (array items) to RawSchema with required/rules/visible', () => {
    const saved: any = {
      name: 'step',
      label: 'Test',
      endpoint: '/api',
      items: [
        {
          name: 'full_name',
          type: 'Text',
          required: true,
          display: { label: 'Full Name' },
          rules: { maxlength: 10 },
          rulesJson: '{"maxlength":10}',
          visibleRaw: '',
        },
        {
          name: 'days',
          type: 'Number',
          required: true,
          value_constraints: { maximum: 100, allow_decimal: 0 },
          visibleRaw: '{"field":"duration","equals":"full"}',
        },
      ],
    }
    const raw = convertSavedToSchema(saved)
    expect(raw.items).toBeTruthy()
    const items: any = raw.items as any
    expect(items.full_name.required).toBe(true)
    expect(items.full_name.rules).toEqual({ maxlength: 10 })
    expect(items.days.value_constraints.maximum).toBe(100)
    expect(items.days.visible).toEqual({ field: 'duration', equals: 'full' })
  })
})

