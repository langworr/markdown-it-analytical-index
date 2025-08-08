import MarkdownIt from 'markdown-it'
import analyticalIndexPlugin from '../index.mjs'
import fs from 'fs'

const md = new MarkdownIt({ html: true })
md.use(analyticalIndexPlugin)

const input = fs.readFileSync('./test/example.md', 'utf8')
const output = md.render(input)

console.log(output)