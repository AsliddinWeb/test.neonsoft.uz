import fs from 'node:fs'
import path from 'node:path'

const SRC = path.resolve('savollar.txt')
const OUT = path.resolve('src/data/questions.js')

const raw = fs.readFileSync(SRC, 'utf8')
const lines = raw.split(/\r?\n/)

// Group lines into rows. A new row starts when line matches ^\d+\.\t
const rows = []
let current = null
for (const line of lines) {
  if (/^\d+\.\t/.test(line)) {
    if (current) rows.push(current)
    current = line
  } else if (/^\d+\.\s*$/.test(line)) {
    // Empty row like "84."
    if (current) rows.push(current)
    current = null
  } else {
    if (current !== null) {
      // Continuation — join with single space (merge tab-boundary cells via tab)
      current += (line.startsWith('\t') ? line : ' ' + line)
    }
  }
}
if (current) rows.push(current)

// Curly quote normalization
function norm(s) {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[«»]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

const questions = []
const skipped = []

for (const row of rows) {
  // Expect: "N.\tQuestion\tA\tB\tC\tD" (tabs)
  const parts = row.split('\t').map(s => s.trim())
  // First cell is "N." — drop
  const num = parts.shift()
  // Filter out empty cells from broken lines
  const cells = parts.filter(c => c.length > 0)
  if (cells.length < 5) { skipped.push({ num, row, reason: 'too few cells', cells }); continue }

  const [question, ...opts] = cells
  if (opts.length < 4) { skipped.push({ num, question, reason: 'not enough options', opts }); continue }

  // Take first 4 options
  const options = opts.slice(0, 4)
  const correctIdx = options.findIndex(o => o.trim().startsWith('*'))
  if (correctIdx === -1) { skipped.push({ num, question, reason: 'no * found', options }); continue }

  const cleanOptions = options.map(o => norm(o.replace(/^\s*\*\s*/, '')))
  const correct = cleanOptions[correctIdx]
  const others = cleanOptions.filter((_, i) => i !== correctIdx)

  questions.push({ q: norm(question), correct, others })
}

// Build JS file
const esc = s => JSON.stringify(s)
const body = questions.map(q =>
  `  { q: ${esc(q.q)}, correct: ${esc(q.correct)}, others: [${q.others.map(esc).join(', ')}] }`
).join(',\n')

const out = `// Avtomatik generatsiya qilingan fayl — savollar.txt dan.
// scripts/parse-questions.mjs orqali yangilang.
export const QUESTIONS = [
${body}
]
`

fs.writeFileSync(OUT, out)
console.log(`✔ ${questions.length} ta savol yozildi: ${OUT}`)
if (skipped.length) {
  console.log(`\n⚠ ${skipped.length} ta o'tkazib yuborildi:`)
  skipped.forEach(s => console.log(`  [${s.num}] ${s.reason}`))
}
