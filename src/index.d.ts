import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import type Renderer from 'markdown-it/lib/renderer'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline'
import type StateBlock from 'markdown-it/lib/rules_block/state_block'

export interface AnalyticalIndexEnv {
  anaind?: Record<string, number>
  docId?: string
}

export interface AnalyticalIndexOptions {
  marker?: string
}

export function render_anaind_index(
  tokens: Token[],
  idx: number,
  options: any,
  env: AnalyticalIndexEnv,
  slf: Renderer
): boolean

export function render_anaind_anchor(
  tokens: Token[],
  idx: number,
  options: any,
  env: AnalyticalIndexEnv,
  slf: Renderer
): string

export default function analyticalIndexPlugin(
  md: MarkdownIt,
  options?: AnalyticalIndexOptions
): void
