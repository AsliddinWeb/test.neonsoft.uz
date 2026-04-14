import express from 'express'
import Database from 'better-sqlite3'
import cors from 'cors'
import 'dotenv/config'
import path from 'node:path'
import fs from 'node:fs'

const app = express()
app.use(express.json({ limit: '2mb' }))
app.use(cors())

const DATA_DIR = path.resolve('data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'ilhom.db'))
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  percent INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL,
  time_up INTEGER NOT NULL DEFAULT 0,
  at TEXT NOT NULL,
  details TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_results_at ON results(at DESC);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`)

const seed = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
seed.run('questionCount', '30')
seed.run('durationMin', '60')

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'ilhom2025'

function requireAdmin(req, res, next) {
  const auth = req.header('authorization') || ''
  if (!auth.startsWith('Basic ')) return res.status(401).json({ error: 'auth_required' })
  const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8')
  const i = decoded.indexOf(':')
  const u = decoded.slice(0, i), p = decoded.slice(i + 1)
  if (u !== ADMIN_USER || p !== ADMIN_PASS) return res.status(401).json({ error: 'invalid_credentials' })
  next()
}

function rowToResult(row) {
  return {
    id: row.id, name: row.name, total: row.total, correct: row.correct, percent: row.percent,
    durationSec: row.duration_sec, timeUp: !!row.time_up, at: row.at,
    details: JSON.parse(row.details)
  }
}

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Settings (public read, admin write)
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all()
  const s = {}
  rows.forEach(r => s[r.key] = Number.isNaN(Number(r.value)) ? r.value : Number(r.value))
  res.json(s)
})

app.put('/api/settings', requireAdmin, (req, res) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  const body = req.body || {}
  const tx = db.transaction(() => {
    for (const [k, v] of Object.entries(body)) stmt.run(String(k), String(v))
  })
  tx()
  res.json({ ok: true })
})

// Submit result (public)
app.post('/api/results', (req, res) => {
  const r = req.body
  if (!r?.id || !r?.name || !Array.isArray(r.details)) return res.status(400).json({ error: 'invalid_payload' })
  try {
    db.prepare(`INSERT INTO results (id, name, total, correct, percent, duration_sec, time_up, at, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      r.id, String(r.name), r.total | 0, r.correct | 0, r.percent | 0,
      r.durationSec | 0, r.timeUp ? 1 : 0, r.at || new Date().toISOString(),
      JSON.stringify(r.details)
    )
    res.json({ ok: true, id: r.id })
  } catch (e) {
    res.status(500).json({ error: 'db_error', message: e.message })
  }
})

// Get single (public — long opaque id)
app.get('/api/results/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })
  res.json(rowToResult(row))
})

// Admin
app.post('/api/auth/check', requireAdmin, (req, res) => res.json({ ok: true }))

app.get('/api/results', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM results ORDER BY at DESC').all()
  res.json(rows.map(rowToResult))
})

app.delete('/api/results/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

app.delete('/api/results', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM results').run()
  res.json({ ok: true })
})

const PORT = Number(process.env.PORT || 3001)
app.listen(PORT, '127.0.0.1', () => {
  console.log(`ILHOM API running on http://127.0.0.1:${PORT}`)
  console.log(`DB: ${path.join(DATA_DIR, 'ilhom.db')}`)
})
