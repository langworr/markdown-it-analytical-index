// Capitalize the first letter of a string.
function capitalize(str) {  
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// Rendering function of the analytical index.
// Similar to:
// <h2>Indice analitico</h2>
// <p><strong>Pippo</strong> → <a href="#pippo-1">1</a></p>
function render_anaind_index(tokens, idx, options, env, slf) {
  const columns = parseInt(tokens[idx].meta.parameters.columns, 10)
  let string = '<h' + tokens[idx].meta.parameters.headingLevel + '>' +
    tokens[idx].meta.parameters.title + '</h' + tokens[idx].meta.parameters.headingLevel + '>\n'
  if (columns > '1') {
    string += '<p style="column-count: ' + columns +'; column-gap: 20px;">'
  } else {
    string += '<p>'
  }
  
  if (!env.anaind) return string + '</p>'

  if (tokens[idx].meta.parameters.sortOrder === 'alphabetical') {
    Object.entries(env.anaind)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // confronto alfabetico
      .forEach(([key, value]) => {
        string += '<strong>' + capitalize(key) + '</strong> → '
        value.forEach(id => { 
          string += '<a href="#' + key + '-' + id + '">' + (id + 1) + '</a> '
        })
        string += '<br>'
      })
  } else if (tokens[idx].meta.parameters.sortOrder === 'frequency') {
    Object.entries(env.anaind)
      .sort(([keyA], [keyB]) => keyB - keyA) // confronto numerico
      .forEach(([key, value]) => {
        string += '<strong>' + capitalize(key) + '</strong> → '
        value.forEach(id => { 
          string += '<a href="#' + key + '-' + id + '">' + (id + 1) + '</a> '
        })
        string += '<br>'
      })
  }

  return string + '</p>'
}

// Rendering of the anchor for each term.
// Similar to:
// <span id="pippo-1">pippo</span>
function render_anaind_anchor(tokens, idx, options, env, slf) {
  let prefix = ''
  if (typeof env.docId === 'string') prefix = `-${env.docId}-`

  return '<span id="' + prefix + tokens[idx].attrs[0][1] + '">' + tokens[idx].content + '</span>'
}

export default function analyticalIndex (md, options) {
  const parseLinkLabel = md.helpers.parseLinkLabel

  options = options || {}
  const marker  = options.marker || '!!'
  const indexMarkerStart = '<!-- @analytical-index '
  const indexMarkerEnd = '-->'
  const parameters = { title: "Analytical index", headingLevel: "2", sortOrder: "alphabetical", columns: "1" }
  const sortOrders = ['alphabetical', 'frequency']
  const regex = /(\w+):"([^"]*)"/g;
  md.renderer.rules.anaind_a = render_anaind_anchor
  md.renderer.rules.anaind_i = render_anaind_index

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
    const labelEnd = parseLinkLabel(state, start + marker.length)
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
    if (!state.env.anaind[term]) state.env.anaind[term] = []
    const id = state.env.anaind[term].length
    state.env.anaind[term].push(id)

    const token = state.push('anaind_a', 'span', 0)
    token.attrs = [['id', `${term}-${term}-${id}`]]
    token.content = term

    state.pos = labelEnd + 1
    state.posMax = max
    return true
  }

  // Process the analytical index tag.
  function analyticalIndexRule(state, startLine, endLine, silent) {
    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    // The line must start and end with the analytical index marker.
    if (state.src.slice(start, start + indexMarkerStart.length) !== indexMarkerStart ||
        state.src.slice(max - indexMarkerEnd.length, max) !== indexMarkerEnd) {
      return false
    }
    // If silent, we only check if the analytical index marker is present.
    if (silent) return true

    const pars = state.src.slice(start + indexMarkerStart.length, max - indexMarkerEnd.length)
    
    let match;
    while ((match = regex.exec(pars)) !== null) {
      const key = match[1];
      const value = match[2];
      if (key in parameters) {
        if (key === 'sortOrder' ) {
          if ( sortOrders.includes(value)) {
            parameters[key] = value;
          }
        } else {
          parameters[key] = value;
        }
      }
    }

    const token_i = new state.Token('anaind_i', '', 0)
    token_i.meta = { parameters }
    state.tokens.push(token_i) 
    return false
  }

  md.inline.ruler.push('anaind_a', anchorRule);
  // To check where to insert the analytical index.
  md.block.ruler.before('fence', 'anaind_i', analyticalIndexRule, {
    alt: ['paragraph', 'reference', 'blockquote']
  });
};