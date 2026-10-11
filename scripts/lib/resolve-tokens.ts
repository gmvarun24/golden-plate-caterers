/**
 * Reads src/styles/tokens.css and resolves every `--color-*` semantic token to a concrete
 * colour for each theme (light-dark() → pick a side, var() → follow the chain).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import postcss from 'postcss'

export type Theme = 'light' | 'dark'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const TOKENS_PATH = path.join(root, 'src/styles/tokens.css')

/** Split a function's argument list on top-level commas only. */
export function splitArgs(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

/** Replace the innermost-first occurrences of fn(...) using `replacer`. */
function replaceFn(value: string, fn: string, replacer: (args: string[]) => string): string {
  let v = value
  for (let guard = 0; guard < 100; guard++) {
    const start = v.indexOf(`${fn}(`)
    if (start === -1) return v
    let depth = 0
    let end = -1
    for (let i = start + fn.length; i < v.length; i++) {
      if (v[i] === '(') depth++
      if (v[i] === ')') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    if (end === -1) throw new Error(`Unbalanced ${fn}() in: ${value}`)
    const inner = v.slice(start + fn.length + 1, end)
    v = v.slice(0, start) + replacer(splitArgs(inner)) + v.slice(end + 1)
  }
  throw new Error(`Too many ${fn}() in: ${value}`)
}

export function readTokenDeclarations(css = readFileSync(TOKENS_PATH, 'utf8')): Map<string, string> {
  const decls = new Map<string, string>()
  postcss.parse(css).walkDecls((d) => {
    if (!d.prop.startsWith('--')) return
    // Tokens are defined on `:root` (or `:root, [data-theme]`) and in `@theme` blocks.
    // Theme switching uses light-dark(), so no per-theme override rules need reading.
    const parent = d.parent
    const selectors = parent?.type === 'rule' ? (parent as postcss.Rule).selectors : []
    const isRoot = selectors.includes(':root')
    const isTheme = parent?.type === 'atrule' && (parent as postcss.AtRule).name === 'theme'
    // `@theme inline reference { --x: var(--x) }` only registers utilities; skip the self-reference.
    if (isTheme && d.value.trim() === `var(${d.prop})`) return
    if (isRoot || isTheme) decls.set(d.prop, d.value)
  })
  return decls
}

export function resolveToken(name: string, theme: Theme, decls: Map<string, string>, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Circular token reference: ${[...seen, name].join(' → ')}`)
  const raw = decls.get(name)
  if (raw === undefined) throw new Error(`Unknown token ${name}`)
  seen.add(name)
  let v = replaceFn(raw, 'light-dark', ([light, dark]) => (theme === 'light' ? light! : dark!))
  v = replaceFn(v, 'var', ([ref, fallback]) => {
    if (decls.has(ref!)) return resolveToken(ref!, theme, decls, new Set(seen))
    if (fallback !== undefined) return fallback
    throw new Error(`Unresolvable var(${ref}) in ${name}`)
  })
  return v.trim()
}
