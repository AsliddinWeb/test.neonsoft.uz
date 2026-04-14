<script setup>
import { ref, computed } from 'vue'
import { loadResults, deleteResult, clearAll, loadSettings, saveSettings } from '../utils/storage.js'
import { QUESTIONS } from '../data/questions.js'

const ENV_USER = import.meta.env.VITE_ADMIN_USER || 'admin'
const ENV_PASS = import.meta.env.VITE_ADMIN_PASS || 'ilhom2025'

const authed = ref(sessionStorage.getItem('ilhom_admin') === '1')
const login = ref('')
const pass = ref('')
const err = ref('')
const results = ref(loadResults())
const settings = ref(loadSettings())
const settingsMsg = ref('')
const query = ref('')
const MAX_Q = QUESTIONS.length

function doLogin() {
  if (login.value.trim() === ENV_USER && pass.value === ENV_PASS) {
    sessionStorage.setItem('ilhom_admin', '1')
    authed.value = true
    err.value = ''
    pass.value = ''
  } else {
    err.value = 'Kiritilgan login yoki parol noto\'g\'ri.'
  }
}
function logout() {
  sessionStorage.removeItem('ilhom_admin')
  authed.value = false
}
function refresh() { results.value = loadResults() }
function remove(id) {
  if (!confirm('Ushbu natijani butunlay o\'chirishni tasdiqlaysizmi?')) return
  deleteResult(id); refresh()
}
function clearAllNow() {
  if (!confirm('DIQQAT! Barcha ishtirokchilar natijalari o\'chiriladi. Davom etasizmi?')) return
  clearAll(); refresh()
}

function saveSettingsNow() {
  let n = Number(settings.value.questionCount) || 1
  n = Math.max(1, Math.min(MAX_Q, Math.floor(n)))
  let d = Number(settings.value.durationMin) || 1
  d = Math.max(1, Math.min(600, Math.floor(d)))
  settings.value = saveSettings({ questionCount: n, durationMin: d })
  settingsMsg.value = `Muvaffaqiyatli saqlandi: ${n} ta savol, ${d} daqiqa vaqt.`
  setTimeout(() => settingsMsg.value = '', 3500)
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(results.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `ilhom_natijalar_${new Date().toISOString().slice(0,10)}.json`
  a.click(); URL.revokeObjectURL(url)
}
function exportCSV() {
  const rows = [['Ishtirokchi F.I.Sh.', 'Foiz', 'To\'g\'ri javoblar', 'Jami savollar', 'Sarflangan vaqt (soniya)', 'Topshirilgan sana']]
  results.value.forEach(r => rows.push([r.name, r.percent, r.correct, r.total, r.durationSec, r.at]))
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `ilhom_natijalar_${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

const filtered = computed(() => {
  const q = query.value.trim().toUpperCase()
  if (!q) return results.value
  return results.value.filter(r => r.name.includes(q))
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
</script>

<template>
  <div v-if="!authed" class="max-w-sm mx-auto mt-10">
    <div class="bg-white rounded-2xl shadow-xl border p-6">
      <h2 class="text-lg font-bold text-slate-800 mb-1">Boshqaruv paneli</h2>
      <p class="text-xs text-slate-500 mb-4">Tizimga kirish faqat administrator uchun ruxsat etilgan.</p>
      <div class="space-y-2.5">
        <input
          v-model="login" type="text" placeholder="Login"
          class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        />
        <input
          v-model="pass" @keyup.enter="doLogin" type="password" placeholder="Parol"
          class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        />
      </div>
      <p v-if="err" class="text-xs text-red-600 mt-1.5">{{ err }}</p>
      <button @click="doLogin" class="mt-3 w-full py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">Tizimga kirish</button>
    </div>
  </div>

  <div v-else class="space-y-4">
    <!-- Settings -->
    <div class="bg-white rounded-2xl border shadow-sm p-5">
      <div class="text-sm font-bold text-slate-800 mb-3">Test sozlamalari</div>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-slate-600 font-medium mb-1.5">Savollar soni (eng ko'pi {{ MAX_Q }} ta)</label>
          <input
            v-model.number="settings.questionCount" type="number" min="1" :max="MAX_Q"
            class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 outline-none text-sm"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-600 font-medium mb-1.5">Test davomiyligi (daqiqa)</label>
          <input
            v-model.number="settings.durationMin" type="number" min="1" max="600"
            class="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 outline-none text-sm"
          />
        </div>
      </div>
      <div class="flex items-center gap-3 mt-4">
        <button @click="saveSettingsNow" class="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">Saqlash</button>
        <p v-if="settingsMsg" class="text-xs text-emerald-700">{{ settingsMsg }}</p>
      </div>
    </div>

    <!-- Stats -->
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

    <!-- Results -->
    <div class="bg-white rounded-2xl border shadow-sm">
      <div class="p-4 flex flex-wrap items-center gap-2 border-b">
        <input v-model="query" placeholder="Ishtirokchini F.I.Sh. bo'yicha qidiring..." class="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 outline-none text-sm" />
        <button @click="refresh" class="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">↻ Yangilash</button>
        <button @click="exportCSV" class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">CSV yuklab olish</button>
        <button @click="exportJSON" class="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800">JSON yuklab olish</button>
        <button @click="clearAllNow" class="px-3 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700">Barchasini tozalash</button>
        <button @click="logout" class="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm">Tizimdan chiqish</button>
      </div>

      <div v-if="filtered.length === 0" class="p-8 text-center text-slate-500 text-sm">
        Ayni paytda tizimda hech qanday natija saqlanmagan.
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-600 text-xs uppercase">
          <tr>
            <th class="text-left p-3">#</th>
            <th class="text-left p-3">Ishtirokchi F.I.Sh.</th>
            <th class="text-left p-3">Natija</th>
            <th class="text-left p-3">To'g'ri javoblar</th>
            <th class="text-left p-3">Sarflangan vaqt</th>
            <th class="text-left p-3">Topshirilgan sana</th>
            <th class="p-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in filtered" :key="r.id" class="border-t hover:bg-slate-50">
            <td class="p-3 text-slate-500">{{ i + 1 }}</td>
            <td class="p-3 font-semibold text-slate-800">{{ r.name }}</td>
            <td class="p-3">
              <span :class="['px-2 py-1 rounded-md text-xs font-bold',
                r.percent >= 75 ? 'bg-emerald-100 text-emerald-700'
                : r.percent >= 60 ? 'bg-amber-100 text-amber-700'
                : 'bg-rose-100 text-rose-700']">{{ r.percent }}%</span>
            </td>
            <td class="p-3">{{ r.correct }} / {{ r.total }}</td>
            <td class="p-3 text-slate-600">{{ Math.floor(r.durationSec/60) }}m {{ r.durationSec%60 }}s</td>
            <td class="p-3 text-slate-600">{{ fmt(r.at) }}</td>
            <td class="p-3 text-right whitespace-nowrap">
              <router-link :to="`/result/${r.id}`" class="text-brand-600 hover:underline text-xs font-semibold">Batafsil</router-link>
              <button @click="remove(r.id)" class="ml-3 text-rose-600 hover:underline text-xs font-semibold">O'chirish</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
