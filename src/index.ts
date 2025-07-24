import type MarkdownIt from "markdown-it"
import type Token from "markdown-it/lib/token"

interface PluginOptions {
  title?: string
  headingLevel?: number
}

export default function analyticalIndexPlugin(md: MarkdownIt, options: PluginOptions = {}): void {
  const {
    title = "Indice analitico",
    headingLevel = 2
  } = options

  md.core.ruler.push("analytical_index", buildRule(title, headingLevel))
}

function buildRule(title: string, headingLevel: number) {
  return function analyticalIndexRule(state: any): boolean {
    const indexMap: Record<string, string[]> = {}
    const counterMap: Record<string, number> = {}

    for (const token of state.tokens) {
      if (token.type === "inline" && token.children) {
        const newChildren: Token[] = []

        for (const child of token.children) {
          if (child.type === "text" && child.content.includes("[[")) {
            const segments = child.content.split(/(\[\[[^\]]+\]\])/g)
            for (const segment of segments) {
              const match = segment.match(/^\[\[([^\[\]]+?)\]\]$/)
              if (match) {
                const raw = match[1].trim()
                const [label, tooltip] = raw.split("|").map((s: string) => s.trim())
                const key = label.toLowerCase()
                counterMap[key] = (counterMap[key] || 0) + 1
                const anchorId = `${key}-${counterMap[key]}`
                indexMap[key] = indexMap[key] || []
                indexMap[key].push(anchorId)

                const htmlToken = new state.Token("html_inline", "", 0)
                htmlToken.content = tooltip
                  ? `<span id="${anchorId}" title="${escapeHtml(tooltip)}">${label}</span>`
                  : `<span id="${anchorId}">${label}</span>`

                newChildren.push(htmlToken)
              } else {
                const textToken = new state.Token("text", "", 0)
                textToken.content = segment
                newChildren.push(textToken)
              }
            }
          } else {
            newChildren.push(child)
          }
        }

        token.children = newChildren
      }
    }

    const placeholderIndex = state.tokens.findIndex((t: Token) =>
      t.type === "html_block" && t.content.includes("<!-- analytical-index -->")
    )

    if (Object.keys(indexMap).length > 0 && placeholderIndex >= 0) {
      const headingTag = `h${headingLevel}`
      const titleText = escapeHtml(title)
      const indexLines = [`<${headingTag}>${titleText}</${headingTag}>`]

      for (const [keyword, ids] of Object.entries(indexMap)) {
        const links = ids.map((id, i) => `<a href="#${id}">${i + 1}</a>`).join(", ")
        indexLines.push(`<p><strong>${capitalize(keyword)}</strong> → ${links}</p>`)
      }

      state.tokens[placeholderIndex].content = indexLines.join("\n")
    }
    return true
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
