import fs from "fs"
import path from "path"
import MarkdownIt from "markdown-it"
import plugin from "../src/index"

describe("markdown-it-analytical-index — fixture rendering", () => {
  const fixturePath = path.join(__dirname, "fixtures", "basic.md")
  const inputMarkdown = fs.readFileSync(fixturePath, "utf-8")

  it("renders analytical index from markdown fixture", () => {
    const md = MarkdownIt({ html: true }).use(plugin, {
      title: "Concetti chiave",
      headingLevel: 3
    })

    const output = md.render(inputMarkdown)

    // Verifiche chiave
    expect(output).toContain('<span id="simmetria-1" title="Equilibrio visivo">Simmetria</span>')
    expect(output).toContain('<span id="contrasto-1">Contrasto</span>')
    expect(output).toContain('<h3>Concetti chiave</h3>')
    expect(output).toContain('<strong>Simmetria</strong>')
    expect(output).toContain('<strong>Contrasto</strong>')
    expect(output).toContain('<a href="#simmetria-1">1</a>')
    expect(output).toContain('<a href="#contrasto-1">1</a>')
  })
})
