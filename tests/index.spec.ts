import MarkdownIt from "markdown-it"
import plugin from "../src/index"
import type { PluginOptions } from "../src/types"

function render(mdContent: string, options?: PluginOptions): string {
  const md = MarkdownIt({ html: true }).use(plugin, options)
  return md.render(mdContent)
}

describe("markdown-it-analytical-index", () => {
  it("renders span with id for [[Termine]]", () => {
    const html = render("[[Simmetria]]\n\n<!-- analytical-index -->")
    expect(html).toContain('<span id="simmetria-1">Simmetria</span>')
    expect(html).toContain("<strong>Simmetria</strong>")
    expect(html).toContain('<a href="#simmetria-1">1</a>')
  })

  it("renders span with tooltip for [[Termine|Tooltip]]", () => {
    const html = render(
      "[[Contrasto|Differenza cromatica]]\n\n<!-- analytical-index -->"
    )
    expect(html).toContain('title="Differenza cromatica"')
    expect(html).toContain(
      '<span id="contrasto-1" title="Differenza cromatica">Contrasto</span>'
    )
  })

  it("does not generate index without placeholder", () => {
    const html = render("[[Simmetria]]")
    expect(html).not.toContain("Indice analitico")
    expect(html).not.toMatch(/<h\d>Indice/)
  })

  it("respects custom title and headingLevel", () => {
    const html = render("[[Simmetria]]\n\n<!-- analytical-index -->", {
      title: "Concetti",
      headingLevel: 4
    })
    expect(html).toContain("<h4>Concetti</h4>")
    expect(html).toContain("<strong>Simmetria</strong>")
  })

  it("handles multiple occurrences of same term", () => {
    const md = `
[[Equilibrio]]
[[Equilibrio]]

<!-- analytical-index -->
    `
    const html = render(md)
    expect(html).toContain('id="equilibrio-1"')
    expect(html).toContain('id="equilibrio-2"')
    expect(html).toContain('<a href="#equilibrio-1">1</a>')
    expect(html).toContain('<a href="#equilibrio-2">2</a>')
  })
})
