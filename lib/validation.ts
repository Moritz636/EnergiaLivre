// ============================================
// VALIDAÇÃO - helpers funcionais simples
// ============================================
// API mínima para validação de body de APIs.
// ============================================

export type ValidationResult<T> = { success: true; data: T } | { success: false; error: string }

const ok = <T>(v: T): ValidationResult<T> => ({ success: true, data: v })
const err = (msg: string): ValidationResult<never> => ({ success: false, error: msg })

export const v = {
  string(input: unknown, opts: { min?: number; max?: number; email?: boolean; regex?: RegExp } = {}): ValidationResult<string> {
    if (typeof input !== 'string') return err('esperado string')
    if (opts.min !== undefined && input.length < opts.min) return err(`mínimo ${opts.min} caracteres`)
    if (opts.max !== undefined && input.length > opts.max) return err(`máximo ${opts.max} caracteres`)
    if (opts.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) return err('e-mail inválido')
    if (opts.regex && !opts.regex.test(input)) return err('formato inválido')
    return ok(input)
  },

  number(input: unknown, opts: { min?: number; max?: number; int?: boolean; positive?: boolean } = {}): ValidationResult<number> {
    if (typeof input === 'number' && Number.isFinite(input)) {
      // ok
    } else if (typeof input === 'string' && input.trim() !== '') {
      const n = parseFloat(input)
      if (!Number.isFinite(n)) return err('esperado número')
      input = n
    } else {
      return err('esperado número')
    }
    const n = input as number
    if (opts.int && !Number.isInteger(n)) return err('esperado inteiro')
    if (opts.positive && n <= 0) return err('esperado positivo')
    if (opts.min !== undefined && n < opts.min) return err(`mínimo ${opts.min}`)
    if (opts.max !== undefined && n > opts.max) return err(`máximo ${opts.max}`)
    return ok(n)
  },

  enum<T extends string>(input: unknown, values: readonly T[]): ValidationResult<T> {
    if (typeof input !== 'string') return err('esperado string')
    if (!values.includes(input as T)) return err(`esperado um de: ${values.join(', ')}`)
    return ok(input as T)
  },

  object<T extends Record<string, (input: unknown) => ValidationResult<any>>>(
    input: unknown,
    schema: T,
  ): ValidationResult<{ [K in keyof T]: any }> {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return err('esperado objeto')
    }
    const obj = input as Record<string, unknown>
    const out: any = {}
    for (const [k, validator] of Object.entries(schema)) {
      const r = validator(obj[k])
      if (!r.success) return err(`${k}: ${r.error}`)
      out[k] = r.data
    }
    return ok(out)
  },

  optional<T>(validator: (input: unknown) => ValidationResult<T>) {
    return (input: unknown): ValidationResult<T | undefined> => {
      if (input === undefined) return ok(undefined as any)
      return validator(input)
    }
  },
}
