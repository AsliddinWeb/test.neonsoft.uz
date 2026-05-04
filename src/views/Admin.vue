<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { QUESTIONS } from '../data/questions.js'
import { SURVEYS } from '../data/surveys.js'
import {
  apiLogin, apiLogout, isAdmin,
  apiGetSettings, apiSetSettings,
  apiListResults, apiDeleteResult, apiClearResults,
  apiListSurveys, apiDeleteSurvey, apiClearSurveys
} from '../utils/api.js'

const authed = ref(isAdmin())
const login = ref('')
const pass = ref('')
const err = ref('')
const tab = ref('test') // 'test' | 'talaba' | 'oqituvchi'

const results = ref([])
const surveys = ref({ talaba: [], oqituvchi: [] })
const settings = ref({ questionCount: 30, durationMin: 60 })
const settingsMsg = ref('')
const query = ref('')
const loading = ref(false)
const expanded = ref(null)
const MAX_Q = QUESTIONS.length

async function doLogin() {
  err.value = ''
  const ok = await apiLogin(login.value.trim(), pass.value)
  if (!ok) { err.value = 'Kiritilgan login yoki parol noto\'g\'ri.'; return }
  authed.value = true; pass.value = ''
  await loadAll()
}

function logout() { apiLogout(); authed.value = false }

async function loadAll() {
  loading.value = true
  try {
    const [s, rs, st, so] = await Promise.all([
      apiGetSettings(),
      apiListResults(),
      apiListSurveys('talaba'),
      apiListSurveys('oqituvchi')
    ])
    settings.value = { questionCount: s.questionCount || 30, durationMin: s.durationMin || 60 }
    results.value = rs
    surveys.value = { talaba: st, oqituvchi: so }
  } catch (e) {
    if (e.status === 401) { authed.value = false; apiLogout() }
    else console.error(e)
  } finally { loading.value = false }
}

watch(tab, () => { query.value = ''; expanded.value = null })

// === TEST RESULTS ===
async function refreshResults() { try { results.value = await apiListResults() } catch (e) { console.error(e) } }
async function removeResult(id) {
  if (!confirm('Ushbu natijani butunlay o\'chirishni tasdiqlaysizmi?')) return
  await apiDeleteResult(id); await refreshResults()
}
async function clearResults() {
  if (!confirm('DIQQAT! Barcha test natijalari o\'chiriladi. Davom etasizmi?')) return
  await apiClearResults(); await refreshResults()
}

// === SETTINGS ===
async function saveSettingsNow() {
  let n = Number(settings.value.questionCount) || 1
  n = Math.max(1, Math.min(MAX_Q, Math.floor(n)))
  let d = Number(settings.value.durationMin) || 1
  d = Math.max(1, Math.min(600, Math.floor(d)))
  await apiSetSettings({ questionCount: n, durationMin: d })
  settings.value = { questionCount: n, durationMin: d }
  settingsMsg.value = `Saqlandi: ${n} ta savol, ${d} daqiqa.`
  setTimeout(() => settingsMsg.value = '', 3500)
}

// === SURVEYS ===
async function refreshSurveys(type) {
  try { surveys.value[type] = await apiListSurveys(type) } catch (e) { console.error(e) }
}
async function removeSurvey(type, id) {
  if (!confirm('Ushbu javobni o\'chirishni tasdiqlaysizmi?')) return
  await apiDeleteSurvey(id); await refreshSurveys(type)
}
async function clearSurveys(type) {
  if (!confirm(`DIQQAT! "${type}" so'rovnomasi javoblari o'chiriladi. Davom etasizmi?`)) return
  await apiClearSurveys(type); await refreshSurveys(type)
}

// === EXPORTS ===
function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
}

function exportTestCSV() {
  const rows = [['Ishtirokchi F.I.Sh.', 'Foiz', 'To\'g\'ri javoblar', 'Jami savollar', 'Sarflangan vaqt (s)', 'Topshirilgan sana']]
  results.value.forEach(r => rows.push([r.name, r.percent, r.correct, r.total, r.durationSec, r.at]))
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  downloadBlob(`test_natijalari_${new Date().toISOString().slice(0,10)}.csv`, '﻿' + csv, 'text/csv;charset=utf-8')
}

function exportSurveyCSV(type) {
  const survey = SURVEYS[type]
  const headers = ['ID', 'F.I.Sh.', 'Sana']
  for (const q of survey.questions) {
    if (q.type === 'matrix') for (const s of q.statements) headers.push(`${q.id}.${s.id}`)
    else headers.push(q.id)
  }
  const rows = [headers]
  for (const item of surveys.value[type]) {
    const row = [item.id, item.name || 'anonim', item.at]
    const ans = item.data?.answers || {}
    for (const q of survey.questions) {
      if (q.type === 'matrix') for (const s of q.statements) row.push(ans[q.id]?.[s.id] || '')
      else if (q.type === 'checkbox') row.push((ans[q.id] || []).join(' | '))
      else row.push(ans[q.id] || '')
    }
    rows.push(row)
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  downloadBlob(`sorovnoma_${type}_${new Date().toISOString().slice(0,10)}.csv`, '﻿' + csv, 'text/csv;charset=utf-8')
}

function exportSurveyJSON(type) {
  downloadBlob(`sorovnoma_${type}_${new Date().toISOString().slice(0,10)}.json`,
    JSON.stringify(surveys.value[type], null, 2), 'application/json')
}

// === COMPUTED ===
const filteredResults = computed(() => {
  const q = query.value.trim().toUpperCase()
  if (!q) return results.value
  return results.value.filter(r => r.name.includes(q))
})

const filteredSurveys = computed(() => {
  const q = query.value.trim().toUpperCase()
  const list = surveys.value[tab.value] || []
  if (!q) return list
  return list.filter(r => (r.name || '').toUpperCase().includes(q))
})

const stats = computed(() => {
  const n = results.value.length
  if (!n) return { n: 0, avg: 0, best: 0 }
  const avg = Math.round(results.value.reduce((a, r) => a + r.percent, 0) / n)
  const best = Math.max(...results.value.map(r => r.percent))
  return { n, avg, best }
})

function fmt(iso) {
  return new Date(iso).toLocaleString('uz-UZ', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
}

function answerText(q, value) {
  if (value === undefined || value === null || value === '') return '—'
  if (q.type === 'checkbox') return Array.isArray(value) ? value.join(' • ') : ''
  if (q.type === 'matrix') {
    return q.statements.map(s => `${s.text}: ${value?.[s.id] ?? '—'}`).join('\n')
  }
  return String(value)
}

const currentSurvey = computed(() => SURVEYS[tab.value])

onMounted(() => { if (authed.value) loadAll() })
</script>

<template>
  <div v-if="!authed" class="max-w-sm mx-auto mt-10">
    <div class="bg-white rounded-2xl shadow-xl border p-6">
      <h2 class="text-lg font-bold text-slate-800 mb-1">Boshqaruv paneli</h2>
      <p class="text-xs text-slate-500 mb-4">Tizimga kirish faqat administrator uchun ruxsat etilgan.</p>
      <div class="space-y-2.5">
        <input v-model="login" type="text" placeholder="Login"
          class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
        <input v-model="pass" @keyup.enter="doLogin" type="password" placeholder="Parol"
          class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
      </div>
      <p v-if="err" class="text-xs text-red-600 mt-1.5">{{ err }}</p>
      <button @click="doLogin" class="mt-3 w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">Tizimga kirish</button>
    </div>
  </div>

  <div v-else class="space-y-4">
    <!-- Tabs -->
    <div class="bg-white rounded-2xl border shadow-sm p-1.5 inline-flex flex-wrap gap-1">
      <button @click="tab='test'" :class="['px-4 py-2 rounded-xl text-sm font-semibold transition',
        tab==='test' ? 'bg-brand-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100']">
        ILHOM testi <span class="ml-1 opacity-70">({{ results.length }})</span>
      </button>
      <button @click="tab='talaba'" :class="['px-4 py-2 rounded-xl text-sm font-semibold transition',
        tab==='talaba' ? 'bg-brand-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100']">
        Talabalar so'rovnomasi <span class="ml-1 opacity-70">({{ surveys.talaba.length }})</span>
      </button>
      <button @click="tab='oqituvchi'" :class="['px-4 py-2 rounded-xl text-sm font-semibold transition',
        tab==='oqituvchi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100']">
        O'qituvchilar so'rovnomasi <span class="ml-1 opacity-70">({{ surveys.oqituvchi.length }})</span>
      </button>
      <div class="flex-1"></div>
      <button @click="logout" class="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm">Chiqish</button>
    </div>

    <!-- ===== TEST TAB ===== -->
    <template v-if="tab === 'test'">
      <div class="bg-white rounded-2xl border shadow-sm p-5">
        <div class="text-sm font-bold text-slate-800 mb-3">Test sozlamalari</div>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-slate-600 font-medium mb-1.5">Savollar soni (eng ko'pi {{ MAX_Q }} ta)</label>
            <input v-model.number="settings.questionCount" type="number" min="1" :max="MAX_Q"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 outline-none text-sm" />
          </div>
          <div>
            <label class="block text-xs text-slate-600 font-medium mb-1.5">Test davomiyligi (daqiqa)</label>
            <input v-model.number="settings.durationMin" type="number" min="1" max="600"
              class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 outline-none text-sm" />
          </div>
        </div>
        <div class="flex items-center gap-3 mt-4">
          <button @click="saveSettingsNow" class="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">Saqlash</button>
          <p v-if="settingsMsg" class="text-xs text-emerald-700">{{ settingsMsg }}</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white rounded-2xl border p-4 shadow-sm">
          <div class="text-xs text-slate-500 uppercase">Jami ishtirokchilar</div>
          <div class="text-3xl font-bold text-slate-800">{{ stats.n }}</div>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm">
          <div class="text-xs text-slate-500 uppercase">O'rtacha ko'rsatkich</div>
          <div class="text-3xl font-bold text-brand-700">{{ stats.avg }}%</div>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm">
          <div class="text-xs text-slate-500 uppercase">Eng yuqori natija</div>
          <div class="text-3xl font-bold text-emerald-700">{{ stats.best }}%</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border shadow-sm">
        <div class="p-4 flex flex-wrap items-center gap-2 border-b">
          <input v-model="query" placeholder="F.I.Sh. bo'yicha qidirish..." class="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 outline-none text-sm" />
          <button @click="refreshResults" class="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">↻ Yangilash</button>
          <button @click="exportTestCSV" class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">CSV</button>
          <button @click="clearResults" class="px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700">Hammasini tozalash</button>
        </div>
        <div v-if="loading" class="p-8 text-center text-slate-500 text-sm">Yuklanmoqda…</div>
        <div v-else-if="filteredResults.length === 0" class="p-8 text-center text-slate-500 text-sm">Hech qanday natija topilmadi.</div>
        <table v-else class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th class="text-left p-3">#</th>
              <th class="text-left p-3">Ishtirokchi</th>
              <th class="text-left p-3">Natija</th>
              <th class="text-left p-3">To'g'ri</th>
              <th class="text-left p-3">Vaqt</th>
              <th class="text-left p-3">Sana</th>
              <th class="p-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in filteredResults" :key="r.id" class="border-t hover:bg-slate-50">
              <td class="p-3 text-slate-500">{{ i + 1 }}</td>
              <td class="p-3 font-semibold text-slate-800">{{ r.name }}</td>
              <td class="p-3"><span :class="['px-2 py-1 rounded-md text-xs font-bold',
                r.percent >= 75 ? 'bg-emerald-100 text-emerald-700'
                : r.percent >= 60 ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-100 text-rose-700']">{{ r.percent }}%</span></td>
              <td class="p-3">{{ r.correct }} / {{ r.total }}</td>
              <td class="p-3 text-slate-600">{{ Math.floor(r.durationSec/60) }}m {{ r.durationSec%60 }}s</td>
              <td class="p-3 text-slate-600">{{ fmt(r.at) }}</td>
              <td class="p-3 text-right whitespace-nowrap">
                <router-link :to="`/result/${r.id}`" class="text-brand-600 hover:underline text-xs font-semibold">Batafsil</router-link>
                <button @click="removeResult(r.id)" class="ml-3 text-rose-600 hover:underline text-xs font-semibold">O'chirish</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ===== SURVEY TAB ===== -->
    <template v-else>
      <div class="bg-white rounded-2xl border shadow-sm">
        <div class="p-4 flex flex-wrap items-center gap-2 border-b">
          <div class="font-bold text-slate-800 mr-2">{{ currentSurvey.title }}</div>
          <div class="flex-1"></div>
          <input v-model="query" placeholder="F.I.Sh. bo'yicha qidirish..." class="min-w-[200px] px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 outline-none text-sm" />
          <button @click="refreshSurveys(tab)" class="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">↻</button>
          <button @click="exportSurveyCSV(tab)" class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">CSV</button>
          <button @click="exportSurveyJSON(tab)" class="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800">JSON</button>
          <button @click="clearSurveys(tab)" class="px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700">Tozalash</button>
        </div>

        <div v-if="filteredSurveys.length === 0" class="p-8 text-center text-slate-500 text-sm">
          Bu so'rovnoma bo'yicha hali javoblar yo'q.
        </div>

        <div v-else class="divide-y">
          <div v-for="(item, i) in filteredSurveys" :key="item.id" class="p-4">
            <div class="flex items-center gap-3">
              <span class="text-slate-400 text-sm w-8">{{ i + 1 }}</span>
              <div class="flex-1">
                <div class="font-semibold text-slate-800">{{ item.name || 'Anonim ishtirokchi' }}</div>
                <div class="text-xs text-slate-500">{{ fmt(item.at) }}</div>
              </div>
              <button @click="expanded = expanded === item.id ? null : item.id"
                class="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium">
                {{ expanded === item.id ? 'Yopish' : 'Javoblarni ko\'rish' }}
              </button>
              <button @click="removeSurvey(tab, item.id)" class="text-rose-600 hover:underline text-xs font-semibold">O'chirish</button>
            </div>

            <div v-if="expanded === item.id" class="mt-3 ml-11 space-y-3 text-sm">
              <div v-for="(q, qi) in currentSurvey.questions" :key="q.id" class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div class="text-xs text-slate-500 mb-1">{{ qi + 1 }}. {{ q.label }}</div>
                <div v-if="q.type === 'matrix'" class="space-y-1">
                  <div v-for="s in q.statements" :key="s.id" class="text-slate-700">
                    <span class="text-slate-500">{{ s.text }}:</span>
                    <span class="font-semibold"> {{ item.data?.answers?.[q.id]?.[s.id] ?? '—' }}</span>
                  </div>
                </div>
                <div v-else-if="q.type === 'checkbox'" class="text-slate-700">
                  <ul v-if="(item.data?.answers?.[q.id] || []).length" class="list-disc list-inside">
                    <li v-for="opt in item.data.answers[q.id]" :key="opt">{{ opt }}</li>
                  </ul>
                  <span v-else class="text-slate-400">—</span>
                </div>
                <div v-else class="text-slate-700 font-medium">{{ item.data?.answers?.[q.id] ?? '—' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
