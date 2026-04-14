const KEY = 'ilhom_results_v1'

export function saveResult(result) {
  const all = loadResults()
  all.unshift(result)
  localStorage.setItem(KEY, JSON.stringify(all))
  return result
}

export function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch { return [] }
}

export function findResult(id) {
  return loadResults().find(r => r.id === id)
}

export function deleteResult(id) {
  const all = loadResults().filter(r => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function clearAll() {
  localStorage.removeItem(KEY)
}

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const SETTINGS_KEY = 'ilhom_settings_v1'
const DEFAULT_SETTINGS = { questionCount: 30, durationMin: 60 }

export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }
  } catch { return { ...DEFAULT_SETTINGS } }
}

export function saveSettings(partial) {
  const merged = { ...loadSettings(), ...partial }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged))
  return merged
}
