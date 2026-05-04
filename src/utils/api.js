const BASE = '/api'
const TOKEN_KEY = 'ilhom_admin_token'

function authHeader() {
  const t = sessionStorage.getItem(TOKEN_KEY)
  return t ? { Authorization: 'Basic ' + t } : {}
}

async function req(path, opts = {}) {
  const r = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(opts.headers || {})
    }
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }))
    throw Object.assign(new Error(err.error || r.statusText), { status: r.status, body: err })
  }
  if (r.status === 204) return null
  return r.json()
}

// Auth
export async function apiLogin(user, pass) {
  const token = btoa(unescape(encodeURIComponent(`${user}:${pass}`)))
  const r = await fetch(BASE + '/auth/check', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + token }
  })
  if (!r.ok) return false
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem('ilhom_admin', '1')
  return true
}

export function apiLogout() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem('ilhom_admin')
}

export function isAdmin() {
  return sessionStorage.getItem('ilhom_admin') === '1'
}

// Settings
export const apiGetSettings = () => req('/settings')
export const apiSetSettings = (obj) => req('/settings', { method: 'PUT', body: JSON.stringify(obj) })

// Results
export const apiSaveResult = (r) => req('/results', { method: 'POST', body: JSON.stringify(r) })
export const apiGetResult = (id) => req('/results/' + encodeURIComponent(id))
export const apiListResults = () => req('/results')
export const apiDeleteResult = (id) => req('/results/' + encodeURIComponent(id), { method: 'DELETE' })
export const apiClearResults = () => req('/results', { method: 'DELETE' })

// Surveys
export const apiSubmitSurvey = (payload) => req('/surveys', { method: 'POST', body: JSON.stringify(payload) })
export const apiListSurveys = (type) => req('/surveys' + (type ? `?type=${encodeURIComponent(type)}` : ''))
export const apiDeleteSurvey = (id) => req('/surveys/' + encodeURIComponent(id), { method: 'DELETE' })
export const apiClearSurveys = (type) => req('/surveys' + (type ? `?type=${encodeURIComponent(type)}` : ''), { method: 'DELETE' })

// Helpers
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
