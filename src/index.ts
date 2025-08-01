import type MarkdownIt from "markdown-it"
import type Token from "markdown-it/lib/token"
import StateCore from "markdown-it/lib/rules_core/state_core"
import type { AnalyticalIndexOptions, Term } from "./index.d"

export default function analyticalIndexPlugin(
  md: MarkdownIt,
  options: AnalyticalIndexOptions = {}
): void {
  const {
    title = "Indice analitico",
    headingLevel = 2,
    sortOrder = "alphabetical"
  } = options

  md.core.ruler.push("analytical_index", buildRule({ title, headingLevel, sortOrder }))
}

function buildRule(opts: AnalyticalIndexOptions) {
  return function analyticalIndexRule(state: StateCore): boolean {
    const termsMap: Record<string, Term> = {}

    // 1) Estrai i termini [[term|tooltip]] e rigenera i token inline
    state.tokens.forEach((token: Token) => {
      if (token.type === "inline" && token.children) {
        const newChildren: Token[] = []

        token.children.forEach(child => {
          if (child.type === "text" && child.content.includes("[[")) {
            const segments = child.content.split(/(\[\[[^\]]+\]\])/g)
            segments.forEach(segment => {
              const match = segment.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/)
              if (match) {
                const label = match[1].trim()
                const tooltip = match[2]?.trim()
                const key = label.toLowerCase()
                const slug = key.replace(/\s+/g, "-")

                // Costruisci o aggiorna il Term
                const term = termsMap[key] || {
                  text: label,
                  slug,
                  occurrences: 0,
                  locations: []
                }
                term.occurrences++
                term.locations.push({
                  contextText: label,
                  depth: 0,
                  contextSlug: ""
                })
                termsMap[key] = term

                // Genera lo span con id univoco
                const anchorId = `${slug}-${term.occurrences}`
                const htmlContent = tooltip
                  ? `<span id="${anchorId}" title="${escapeHtml(
                      tooltip
                    )}">${label}</span>`
                  : `<span id="${anchorId}">${label}</span>`

                const htmlToken = new state.Token("html_inline", "", 0)
                htmlToken.content = htmlContent
                newChildren.push(htmlToken)
              } else {
                const textToken = new state.Token("text", "", 0)
                textToken.content = segment
                newChildren.push(textToken)
              }
            })
          } else {
            newChildren.push(child)
          }
        })

        token.children = newChildren
      }
    })

    // 2) Applica filter e sort
    const terms = Object.values(termsMap)
    if (opts.sortOrder === "alphabetical") {
      terms.sort((a, b) => a.text.localeCompare(b.text))
    } else {
      terms.sort((a, b) => b.occurrences - a.occurrences)
    }

    // 3) Cerca il placeholder e inietta l’indice
    const placeholderIndex = state.tokens.findIndex(
      (t: Token) =>
        t.type === "html_block" && t.content.includes("<!-- analytical-index -->")
    )

    if (terms.length > 0 && placeholderIndex >= 0) {
      const output = defaultRenderer(terms, opts)

      state.tokens[placeholderIndex].content = output
    }

    return true
  }
}

function defaultRenderer(
  terms: Term[],
  opts: Pick<AnalyticalIndexOptions, "title" | "headingLevel">
): string {
  const headingTag = `h${opts.headingLevel}`
  const titleEscaped = escapeHtml(opts.title || "")
  const lines = [`<${headingTag}>${titleEscaped}</${headingTag}>`]

  terms.forEach(term => {
    const links = term.locations
      .map((_, i) => `<a href="#${term.slug}-${i + 1}">${i + 1}</a>`)
      .join(", ")
    lines.push(
      `<p><strong>${escapeHtml(capitalize(term.text))}</strong> → ${links}</p>`
    )
  })

  return lines.join("\n")
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
