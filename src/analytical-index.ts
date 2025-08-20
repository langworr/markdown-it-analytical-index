// src/index.ts

import type MarkdownIt from 'markdown-it'
import type { Options as MarkdownItOptions } from 'markdown-it'
import type Renderer from 'markdown-it/lib/renderer.mjs'
import type Token from 'markdown-it/lib/token.mjs'


// Capitalize the first letter of a string.
function capitalize(str: string): string {  
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Tipi per i parametri custom memorizzati in token.meta
interface AnalyticalIndexParameters {
  title: string
  headingLevel: string
  sortOrder: 'alphabetical' | 'frequency'
  columns: string
}

// Estensione dell'env di markdown-it per questo plugin
interface AnalyticalIndexEnv {
  anaind?: Record<string, number>
  docId?: string
}

// Rendering function of the analytical index.
// function render_anaind_index(
function render_anaind_index(
  tokens: Token[],
  idx: number,
  options: MarkdownItOptions,
  env: AnalyticalIndexEnv,
  slf: Renderer
): string {
  const columns = parseInt((tokens[idx].meta as { parameters: AnalyticalIndexParameters }).parameters.columns, 10)
  const headingLevel = (tokens[idx].meta as { parameters: AnalyticalIndexParameters }).parameters.headingLevel
  const title = (tokens[idx].meta as { parameters: AnalyticalIndexParameters }).parameters.title
  let string = `<h${headingLevel}>${title}</h${headingLevel}>\n`

  if (columns > 1) {
    string += `<p style="column-count: ${columns}; column-gap: 20px;">`
  } else {
    string += '<p>'
  }
  
  if (!env.anaind) return string + '</p>'

  if ((tokens[idx].meta as { parameters: AnalyticalIndexParameters }).parameters.sortOrder === 'alphabetical') {
    Object.entries(env.anaind)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .forEach(([key, value]) => {
        string += `<strong>${capitalize(key)}</strong> → <a href="#${key}-${value}">${value}</a><br>`
      })
  } else {
    Object.entries(env.anaind)
      .sort(([, a], [, b]) => b - a)
      .forEach(([key, value]) => {
        string += `<strong>${capitalize(key)}</strong> → <a href="#${key}-${value}">${value}</a><br>`
      })
  }

  return string + '</p>'
}

// Rendering of the anchor for each term.
function render_anaind_anchor(
  tokens: Token[],
  idx: number,
  options: MarkdownItOptions,
  env: AnalyticalIndexEnv,
  slf: Renderer
): string {
  let prefix = ''
  if (typeof env.docId === 'string') prefix = `-${env.docId}-`

  return `<span id="${prefix}${tokens[idx].attrs?.[0][1]}">${tokens[idx].content}</span>`
}

export default function analyticalIndex(md: MarkdownIt, options?: Record<string, unknown>): void {
  const parseLinkLabel = md.helpers.parseLinkLabel

  options = options || {}
  const marker = (options.marker as string) || '!!'
  const indexMarkerStart = '<!-- @analytical-index '
  const indexMarkerEnd = '-->'
  const parameters: AnalyticalIndexParameters = {
    title: "Analytical index",
    headingLevel: "2",
    sortOrder: "alphabetical",
    columns: "1"
  }
  const sortOrders: AnalyticalIndexParameters['sortOrder'][] = ['alphabetical', 'frequency']
  const regex = /(\w+):"([^"]*)"/g

  md.renderer.rules.anaind_a = render_anaind_anchor
  md.renderer.rules.anaind_i = render_anaind_index

  // Process the anchor tags
  function anchorRule(state: any, silent: boolean): boolean {
    const start = state.pos
    const max = state.posMax

    if (start + 1 + marker.length >= max) return false
    if (state.src.slice(start, start + marker.length) !== marker) return false
    if (state.src.charCodeAt(start + marker.length) !== 0x5B /* [ */) return false

    const labelStart = start + marker.length + 1
    const labelEnd = parseLinkLabel(state, start + marker.length)
    if (labelEnd < 0) return false
    
    const term = state.src.slice(labelStart, labelEnd).trim()
    if (!term) return false

    if (!silent) {
      if (!state.env.anaind) state.env.anaind = {}

      const tokens: Token[] = []
      state.md.inline.parse(
        state.src.slice(labelStart, labelEnd),
        state.md,
        state.env,
        tokens
      )
    }

    if (!(term in state.env.anaind)) state.env.anaind[term] = 0
    else state.env.anaind[term] += 1

    const token = state.push('anaind_a', 'span', 0)
    token.attrs = [['id', `${term}-${state.env.anaind[term]}`]]
    token.content = term

    state.pos = labelEnd + 1
    state.posMax = max
    return true
  }

  // Process the analytical index tag.
  function analyticalIndexRule(state: any, startLine: number, endLine: number, silent: boolean): boolean {
    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    if (state.src.slice(start, start + indexMarkerStart.length) !== indexMarkerStart ||
        state.src.slice(max - indexMarkerEnd.length, max) !== indexMarkerEnd) {
      return false
    }
    if (silent) return true

    const pars = state.src.slice(start + indexMarkerStart.length, max - indexMarkerEnd.length)
    
    let match: RegExpExecArray | null
    while ((match = regex.exec(pars)) !== null) {
      const key = match[1] as keyof AnalyticalIndexParameters
      const value = match[2]
      if (key in parameters) {
        if (key === 'sortOrder') {
          if (sortOrders.includes(value as AnalyticalIndexParameters['sortOrder'])) {
            parameters[key] = value as AnalyticalIndexParameters['sortOrder']
          }
        } else {
          parameters[key] = value as any
        }
      }
    }

    const token_i = new state.Token('anaind_i', '', 0)
    token_i.meta = { parameters }
    state.tokens.push(token_i) 
    return false
  }

  md.inline.ruler.push('anaind_a', anchorRule)
  md.block.ruler.before('fence', 'anaind_i', analyticalIndexRule, {
    alt: ['paragraph', 'reference', 'blockquote']
  })
}
