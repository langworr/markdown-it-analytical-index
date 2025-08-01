# markdown-it-analytical-index

# markdown-it-analytical-index

[![npm version](https://img.shields.io/npm/v/markdown-it-analytical-index.svg)](https://www.npmjs.com/package/markdown-it-analytical-index)
[![Downloads/month](https://img.shields.io/npm/dm/markdown-it-analytical-index.svg)](https://www.npmjs.com/package/markdown-it-analytical-index)
[![License](https://img.shields.io/npm/l/markdown-it-analytical-index.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typed-TypeScript-blue.svg)](https://www.typescriptlang.org/)


A plugin for [markdown-it](https://github.com/markdown-it/markdown-it) that generates a semantic analytical index based on specially marked terms within the Markdown text.

The plugin detects double-bracketed concepts like `[[Term]]` or `[[Term|Tooltip]]`, wraps them in HTML tags with unique anchors, and creates a list of references at a designated placeholder location using `<!-- analytical-index -->`.

---

## Installation

Install via npm:

```bash
npm install markdown-it-analytical-index
```

---

## Basic Usage

```js
const MarkdownIt = require("markdown-it")
const analyticalIndex = require("markdown-it-analytical-index")

const md = new MarkdownIt({ html: true })
  .use(analyticalIndex, {
    title: "Key Concepts",     // Optional custom title
    headingLevel: 3,           // Optional heading level (defaults to h2)
  })

const input = `
This sentence contains [[Simmetry|Visual balance]] and also [[Contrast]].

<!-- analytical-index -->
`

const output = md.render(input)
```

## Extended Usage

```js
const MarkdownIt = require("markdown-it")
const analyticalIndex = require("markdown-it-analytical-index")

const md = new MarkdownIt({ html: true })
  .use(analyticalIndex, {
    title: "Key Concepts",     // Optional custom title
    headingLevel: 3,           // Optional heading level (defaults to h2)
    sortOrder: "alphabetical" // Optional sort order. "occurrence" | "alphabetical"
                               //  default is "alphabetical" 
  })

const input = `
This sentence contains [[Simmetry|Visual balance]] and also [[Contrast]].

<!-- analytical-index -->
`

const output = md.render(input)
```
---

## Supported Syntax

| Input                          | Description                                                  |
|--------------------------------|--------------------------------------------------------------|
| `[[Term]]`                     | Highlights the term and links it in the index               |
| `[[Term\|Tooltip]]`            | Adds a custom tooltip to the highlighted term                |
| `<!-- analytical-index -->`   | Marks the location in the text where the index will appear   |

---

## Options

Pass an object when registering the plugin to customize output:

| Option         | Type     | Default            | Description                                                    |
|----------------|----------|--------------------|----------------------------------------------------------------|
| `title`        | string   | `"Analytical Index"` | The heading above the index block                             |
| `headingLevel` | number   | `2`                | HTML heading level for the index title (e.g. `h2`, `h3`)       |
| `sortOrder` | `"occurrence" \| "alphabetical"` | `"alphabetical"` | Order the terms by occurrence number or alphabetically |

---

## HTML Output Example

Given this Markdown:

```markdown
Here is a concept: [[Symmetry|Visual balance]] and another: [[Contrast]].

<!-- analytical-index -->
```

The plugin will render HTML similar to:

```html
<span id="symmetry-1" title="Visual balance">Symmetry</span>
<span id="contrast-1">Contrast</span>

<h3>Key Concepts</h3>
<p><strong>Symmetry</strong> → <a href="#symmetry-1">1</a></p>
<p><strong>Contrast</strong> → <a href="#contrast-1">1</a></p>
```

Each term receives a unique anchor and is listed with clickable references in the index.

---

## Notes

- The index is generated **only** if the special comment `<!-- analytical-index -->` is present in the Markdown.
- If no bracketed terms are found, the index is not rendered.
- The plugin supports multiple concepts and automatically increments reference counters.

---

## License

MIT — free to use, modify, and distribute.

---

## Author

Created by Roberto.  