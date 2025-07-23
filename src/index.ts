import type MarkdownIt from "markdown-it/lib"
import type StateCore from "markdown-it/lib/rules_core/state_core"

/**
 * This plugin will create an analytical index at the end of the document.
 * You can select the keywords to include with the double square brackets [[]]
 */
export default function analyticalIndexPlugin(md: MarkdownIt): void {
  md.core.ruler.push("analytical_index", analyticalIndexRule)
}

function analyticalIndexRule(state: StateCore): boolean {
  const indexMap: Record<string, string[]> = {}
  const counterMap: Record<string, number> = {}

  for (const token of state.tokens) {
    if (token.type === "inline" && token.children) {
      for (const child of token.children) {
        if (child.type === "text" && child.content.includes("[[")) {
          const matches = [...child.content.matchAll(/\[\[([^\]]+)\]\]/g)];
          for (const match of matches) {
            const keyword = match[1].trim()
            const key = keyword.toLowerCase()
            counterMap[key] = (counterMap[key] || 0) + 1
            const anchorId = `${key}-${counterMap[key]}`
            indexMap[key] = indexMap[key] || []
            indexMap[key].push(anchorId)

            child.content = child.content.replace(
              `[[${keyword}]]`,
              `<span id="${anchorId}">${keyword}</span>`
            )
          }
        }
      }
    }
  }

  const indexLines = ["<h2>Indice analitico</h2>"]
  for (const [keyword, ids] of Object.entries(indexMap)) {
    const links = ids.map((id, i) => `<a href="#${id}">${i + 1}</a>`).join(", ")
    indexLines.push(`<p><strong>${capitalize(keyword)}</strong> → ${links}</p>`)
  }

  const indexToken = new state.Token("html_block", "", 0)
  indexToken.content = indexLines.join("\n")
  state.tokens.push(indexToken)

  return true
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
