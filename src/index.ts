import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import type Renderer from 'markdown-it/lib/renderer'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline'
import type StateBlock from 'markdown-it/lib/rules_block/state_block'

interface AnalyticalIndexEnv {
  anaind?: Record<string, number>
  docId?: string
}

interface AnalyticalIndexOptions {
  marker?: string
}

// Rendering function of the analytical index.
function render_anaind_index(
  tokens: Token[],
  idx: number,
  options: any,
  env: AnalyticalIndexEnv,
  slf: Renderer
): boolean {
  return true
}

// Rendering of the anchor for each term.
function render_anaind_anchor(
  tokens: Token[],
  idx: number,
  options: any,
  env: AnalyticalIndexEnv,
  slf: Renderer
): string {
  const n = tokens[idx].attrIndex('id')
  if (n < 0) return ''

  let prefix = ''
  if (typeof env.docId === 'string') prefix = `-${env.docId}-`

  return `<span id="${prefix}${tokens[idx].attrs![n][1]}">${tokens[idx].content}</span>`
}

export default function analyticalIndexPlugin(md: MarkdownIt, options?: AnalyticalIndexOptions): void {
  options = options || {}
  const marker = options.marker || '!!'

  md.renderer.ruler.anaind_a = render_anaind_anchor
  md.renderer.ruler.anaind_i = render_anaind_index

  // Process the anchor tags
  function anchorRule(state: StateInline, silent: boolean): boolean {
    const start = state.pos
    const max = state.posMax

    if (start + 1 + marker.length >= max) return false
    if (state.src.slice(start, start + marker.length) !== marker) return false
    if (state.src.charCodeAt(start + marker.length) !== 0x5B /* [ */) return false

    const labelStart = start + marker.length + 1
    const labelEnd = state.md.inline.parseLinkLabel(state, labelStart)
    if (labelEnd < 0) return false

    const term = state.src.slice(labelStart, labelEnd).trim()
    if (!term) return false

    if (!silent) {
      const env = state.env as AnalyticalIndexEnv
      if (!env.anaind) env.anaind = {}

      const tokens: Token[] = []
      state.md.inline.parse(
        state.src.slice(labelStart, labelEnd),
        state.md,
        env,
        tokens
      )
    }

    const env = state.env as AnalyticalIndexEnv
    if (!(term in env.anaind)) env.anaind[term] = 0
    else env.anaind[term] += 1

    const token = state.push('anaind_a', 'span', 0)
    token.attrs = [['id', `${term}-${env.anaind[term]}`]]

    state.pos = labelEnd + 1
    state.posMax = max
    return true
  }

  // Process the analytical index tag.
  function analyticalIndexRule(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
    return true
  }

  md.inline.ruler.push('anaind_a', anchorRule)
  md.block.ruler.before('fence', 'anaind_i', analyticalIndexRule)
}
