# markdown-it-analytical-index

[![npm version](https://img.shields.io/npm/v/markdown-it-analytical-index.svg)](https://www.npmjs.com/package/markdown-it-analytical-index)
[![Downloads/month](https://img.shields.io/npm/dm/markdown-it-analytical-index.svg)](https://www.npmjs.com/package/markdown-it-analytical-index)
[![License](https://img.shields.io/npm/l/markdown-it-analytical-index.svg)](LICENSE)

A plugin for [markdown-it](https://github.com/markdown-it/markdown-it) that generates a semantic analytical index based on specially marked terms within the Markdown text.

The plugin detects words marked with a customizable marker and wraps them in HTML tags with unique anchors, then creates a list of references at a designated placeholder location using `<!-- @analytical-index: Index title -->`.

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
    marker: "!!",             // Optional marker, "!!" is the default. 
    headingLevel: 3,          // Optional heading level (defaults to h2).
    sortOrder: "alphabetical" // Optional sort order: "occurrence" | "alphabetical"
                              // Default is "alphabetical" 
  })

const input = `
This sentence contains [[symmetry]] and also [[contrast]].

<!-- @analytical-index: Index -->
`

const output = md.render(input)
```

---

## Supported Syntax

| Input | Description |
|---|---|
| `[[Term]]` | Highlights the term and links it in the index |
| `<!-- @analytical-index: Analytical index -->` | Placeholder for the index location and its title.<br>If the title is not specified, it will be "Analytical Index".<br>If the placeholder is not present, the index will not appear. |

---

## Options

Pass an object when registering the plugin to customize output:

| Option         | Type     | Default            | Description                                                    |
|----------------|----------|--------------------|----------------------------------------------------------------|
| `marker`       | string   | `"!!"`             | Marker for terms (e.g. `!!` for `!![term]` or use `[[term]]` by default) |
| `headingLevel` | number   | `2`                | HTML heading level for the index title (e.g. `h2`, `h3`)       |
| `sortOrder`    | `"occurrence" \| "alphabetical"` | `"alphabetical"` | Order the terms by occurrence number or alphabetically         |

---

## HTML Output Example

Given this Markdown:

```markdown
Here is a concept: [[symmetry]] and another: [[contrast]].

<!-- @analytical-index: Cool index -->
```

The plugin will render HTML similar to:

```html
<p>Here is a concept: <span id="symmetry-1">symmetry</span> and another:
<span id="contrast-1">contrast</span></p>

<h3>Cool index</h3>
<p><strong>Symmetry</strong> → <a href="#symmetry-1">1</a></p>
<p><strong>Contrast</strong> → <a href="#contrast-1">1</a></p>
```

Each term receives a unique anchor and is listed with clickable references in the index.

---

## Notes

- The index is generated **only** if the special comment `<!-- @analytical-index -->` (with or with a title) is present in the Markdown.
- The index title can be set with the placeholder comment.
- If no bracketed terms are found, the index is not rendered.
- The plugin supports multiple references to the same term and automatically increments the index.

---

## License

MIT — free to use, modify, and distribute.

---

## Author

Created by Roberto.  
