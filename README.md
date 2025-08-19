# markdown-it-analytical-index

[![npm version](https://img.shields.io/npm/v/markdown-it-analytical-index.svg)](https://www.npmjs.com/package/markdown-it-analytical-index)
[![Downloads/month](https://img.shields.io/npm/dm/markdown-it-analytical-index.svg)](https://www.npmjs.com/package/markdown-it-analytical-index)
[![License](https://img.shields.io/npm/l/markdown-it-analytical-index.svg)](LICENSE)

A plugin for [markdown-it](https://github.com/markdown-it/markdown-it) that generates a semantic analytical index based on specially marked terms within the Markdown text.

The plugin detects words marked with a customizable marker and wraps them in HTML tags with unique anchors, then creates a list of references at a designated placeholder location using `<!-- @analytical-index -->`.

The plugin is customizable as described below.
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
    marker: "!!",               // Optional marker, "!!" is the default. 
    headingLevel: 3,            // Optional heading level (defaults to h2).
    sortOrder: "alphabetical",  // Optional sort order: "frequency" | "alphabetical" 
                                //    default is "alphabetical"
    columns: "1"                // Optional munbers of colummns.
  })

const input = `
This sentence contains !![symmetry] and also !![contrast]. You can write definitions of every !![concept] you need.

You can also repeat words like !![symmetry] or !![contrast].

<!-- @analytical-index title:"Index", headingLevel:"3", sortOrder:"alphabetical", columns:"2" -->
`

const output = md.render(input)
```

This will produce the following code.

```html
<p>This sentence contains <span id="symmetry-0">symmetry</span> and also <span id="contrast-0">contrast</span>.</p>
<p>You can also repeat words like <span id="symmetry-1">symmetry</span> or <span id="contrast-1">.</p>

<h3>Index</h3>
<p style="column-count: 2; column-gap: 20px;"><strong>Concept</strong> → <a href="#concept-0">0</a><br><strong>Contrast</strong> → <a href="#contrast-1">1</a><br><strong>Symmetry</strong> → <a href="#symmetry-1">1</a><br></p>
```


---

## Supported Syntax

| Input | Description |
|---|---|
| `!![Term]` | Highlights the term and links it in the index |
| `<!-- @analytical-index -->` | Placeholder for the index location and its title<br>If the placeholder is not present, the index will not appear.<br>You can specify some parameters here as described next. |


The parameters `title`, `headingLevel`, `sortOrder`, and `columns` can be specified in the placeholer, but `marker` can be only specified in the `Markdownit.use()` declaration. Some examples or placeholder declaration follow. As you can see all the values of the parameters are always contained by doulbe quotes.

```
<!-- @analytical-index title:"My title" -->
```

```
<!-- @analytical-index title:"My title", columns="2" -->
```

```
<!-- @analytical-index headingLevel="4" -->
```

---

## Options

Pass an object when registering the plugin to customize output:

| Option         | Type     | Default            | Description                                                    |
|----------------|----------|--------------------|----------------------------------------------------------------|
| `columns`      | number   | `1`                | Number of columns for the index. |
| `headingLevel` | number   | `2`                | HTML heading level for the index title (e.g. `h2`, `h3`)       |
| `marker`       | string   | `"!!"`             | Marker for terms (e.g. `%` for `%[term]` or use `!![term]` by default) |
| `sortOrder`    | `"frequency" \| "alphabetical"` | `"alphabetical"` | Order the terms by frequency number or alphabetically         |
| `title`        | string   | `"Analytical Index"` | The title of the index. |

---

## HTML Output Example

Given this Markdown:

```markdown
This sentence contains !![symmetry] and also !![contrast]. You can write definitions of every !![concept] you need.

You can also repeat words like !![symmetry] or !![contrast].

<!-- @analytical-index title:"Index", headingLevel:"3", sortOrder:"alphabetical", columns:"2" -->

const output = md.render(input)
```

This will produce the following code.

```html
<p>This sentence contains <span id="symmetry-0">symmetry</span> and also <span id="contrast-0">contrast</span>.</p>
<p>You can also repeat words like <span id="symmetry-1">symmetry</span> or <span id="contrast-1">.</p>

<h3>Index</h3>
<p style="column-count: 2; column-gap: 20px;"><strong>Concept</strong> → <a href="#concept-0">0</a><br><strong>Contrast</strong> → <a href="#contrast-1">1</a><br><strong>Symmetry</strong> → <a href="#symmetry-1">1</a><br></p>
```

Each term receives a unique anchor and is listed with clickable references in the index.

---

## Notes

- The index is generated **only** if the special comment `<!-- @analytical-index -->` (with or without a title) is present in the Markdown.
- The index title can be set with the placeholder comment.
- The plugin supports multiple references to the same term and automatically increments the index.
- You must use double quotes `"` for the parameters.

---

## License

MIT — free to use, modify, and distribute.

---

## Author

Created by Roberto.  
