// Rendering function of the analytical index.
// Similar to:
// <h2>Indice analitico</h2>
// <p><strong>Pippo</strong> → <a href="#pippo-1">1</a></p>
function render_anaind_index(tokens, idx, options, env, slf) {
  return true
}

// Rendering of the anchor for each term.
// Similar to:
// <span id="pippo-1">pippo</span>
function render_anaind_anchor(tokens, idx, options, env, slf) {
  const n = tokens[idx].attrIndex('id')
  if (n < 0) return ''

  let prefix = ''
  if (typeof env.docId === 'string') prefix = `-${env.docId}-`

  return '<span id="' + prefix + tokens[idx].attrs[n][1] + '">' + tokens[idx].content + '</span>'
}

export default function analyticalIndexPlugin (md, options) {
  options = options || {}
  const marker  = options.marker || '!!'
  md.renderer.ruler.anaind_a = render_anaind_anchor
  md.renderer.ruler.anaind_i = render_anaind_index

  // Process the anchor tags
  function anchorRule(state, silent) {
    const start = state.pos
    const max = state.posMax

    // Check if the marker is present at the start of the line
    // and if it is followed by an opening square bracket.
    // Set start and end positions pointer.
    if (start + 1 + marker.length >= max) return false
    if (state.src.slice(start, start + marker.length ) !== marker) return false
    if (state.src.charCodeAt(start + marker.length ) !== 0x5B/* [ */) return false

    const labelStart = start + marker.length + 1
    const labelEnd = parseLinkLabel(state, labelStart)
    if (labelEnd < 0) return false
    
    // Check if the term is not empty.
    const term = state.src.slice(labelStart, labelEnd).trim()
    if (!term) return false

    // If is not silent, parse the label content
    if (!silent) {
       if (!state.env.anaind) state.env.anaind = {}

      const tokens = []
      state.md.inline.parse(
        state.src.slice(labelStart, labelEnd),
        state.md,
        state.env,
        tokens
      )
    }


    // Check if the term already exists in the analytical index.
    // If it does, increment the term ID, otherwise set it to 0.
    if (!(term in state.env.anaind)) state.env.anaind[term] = 0
    else state.env.anaind[term] += 1
    // BOB
    // if (!(term in state.env.anaind)) {
    //   state.env.anaind[term] = [0]
    //   termId = 0
    // }
    // else {
    //   termId = state.env.anaind[term][state.env.anaind[term].length - 1] + 1
    //   state.env.anaind[term].push(termId)
    // }

    const token = state.push('anaind_a', 'span', 0)
    // token.attrs = [['id', `${term}-${termId}`]] BOB
    token.attrs = [['id', `${term}-${state.env.anaind[term]}`]]

    state.pos = labelEnd + 1
    state.posMax = max
    return true
  }

  // Process the analytical index tag.
  function analyticalIndexRule(state, silent) {
    return true
  }

  md.inline.ruler.push('anaind_a', anchorRule);
  md.block.ruler.before('fence', 'anaind_i', analyticalIndexRule);
};