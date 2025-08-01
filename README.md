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
    sortOrder: "alphabetical", // Optional sort order. "occurrence" | "alphabetical"
                               //  default is "alphabetical" 
    renderIndex: entries =>{   // callback custom for the rendering
      return `<ol>${entries
        .map(e => `<li><a href="#${e.anchor}">${e.title}</a></li>`)
        .join("")}</ol>`;
    }
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
| `renderIndex` | `(entries: IndexEntry[]) => string` | *internal defaultRender* | The callback function receives the terms and returns custom HTML/Markdown |

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

If you need a deeper custumization, you can call it as you can see in the example below.

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Demo Custom Render</title>
  <!-- Stili CSS for a custom-index -->
  <style>
    .custom-index {
      border: 2px solid #4CAF50;
      padding: 16px;
      margin-top: 24px;
      background: #f9fff9;
    }
    .ci-item {
      margin-bottom: 8px;
    }
    .ci-term {
      font-weight: bold;
      color: #388E3C;
    }
    .ci-count {
      color: #555;
    }
  </style>
</head>
<body>
  <div id="content"></div>

  <!-- Markdown-It and markdown-it-analytical-index plugin scripts -->
  <script src="https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/markdown-it-analytical-index/dist/markdown-it-analytical-index.min.js"></script>
  <script>
    // Initialize Markdown-It whith the plugin and the custom render.
    const md = window.markdownit({ html: true }).use(window.markdownitAnalyticalIndex, {
      renderIndex: entries => {
        const items = entries.map(e => {
          return `
            <div class="ci-item">
              <span class="ci-term">${e.title}</span>
              <span class="ci-count">— ${e.occurrences}</span>
            </div>
          `;
        }).join("");
        return `<div class="custom-index">${items}</div>`;
      }
    });

    // Markdown di esempio
    const source = `
# Titolo nella pagina

Introduciamo [[Concetto]] e di nuovo [[Concetto]].

<!-- analytical-index -->
`;

    // Render e inserimento nel DOM
    document.getElementById("content").innerHTML = md.render(source);
  </script>
</body>
</html>
```

TODO: an output render

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