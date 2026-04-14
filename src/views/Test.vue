<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { QUESTIONS } from '../data/questions.js'
import { shuffle, apiSaveResult, uid } from '../utils/api.js'

const router = useRouter()
const participant = sessionStorage.getItem('ilhom_participant') || ''
const count = Number(sessionStorage.getItem('ilhom_count') || '30')
const durationMin = Number(sessionStorage.getItem('ilhom_duration') || '60')
const durationSec = Math.max(60, durationMin * 60)

if (!participant) router.replace('/')

const pool = shuffle(QUESTIONS).slice(0, Math.min(count, QUESTIONS.length))
const test = pool.map(q => ({
  q: q.q,
  correct: q.correct,
  options: shuffle([q.correct, ...q.others])
}))

const answers = ref(Array(test.length).fill(null))
const idx = ref(0)
const startedAt = Date.now()
const deadline = startedAt + durationSec * 1000
const remaining = ref(durationSec)
let timerId = null
let finished = false
const submitting = ref(false)

function tick() {
  const secs = Math.max(0, Math.round((deadline - Date.now()) / 1000))
  remaining.value = secs
  if (secs === 0 && !finished) {
    finished = true
    clearInterval(timerId)
    finish(true)
  }
}

const timerText = computed(() => {
  const s = remaining.value
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
})
const timerColor = computed(() => {
  if (remaining.value <= 60) return 'bg-rose-600 animate-pulse'
  if (remaining.value <= 300) return 'bg-amber-500'
  return 'bg-slate-800'
})

const current = computed(() => test[idx.value])
const progress = computed(() => Math.round(((idx.value + 1) / test.length) * 100))
const answeredCount = computed(() => answers.value.filter(a => a !== null).length)

function pick(opt) { answers.value[idx.value] = opt }
function next() { if (idx.value < test.length - 1) idx.value++ }
function prev() { if (idx.value > 0) idx.value-- }
function jump(i) { idx.value = i }

async function finish(timeUp = false) {
  if (finished && !timeUp) return
  finished = true
  clearInterval(timerId)
  submitting.value = true

  const correctCount = test.reduce((acc, q, i) => acc + (answers.value[i] === q.correct ? 1 : 0), 0)
  const percent = Math.round((correctCount / test.length) * 100)
  const result = {
    id: uid(),
    name: participant,
    total: test.length,
    correct: correctCount,
    percent,
    durationSec: Math.round((Date.now() - startedAt) / 1000),
    timeUp,
    at: new Date().toISOString(),
    details: test.map((q, i) => ({
      q: q.q,
      correct: q.correct,
      chosen: answers.value[i],
      ok: answers.value[i] === q.correct
    }))
  }

  try {
    await apiSaveResult(result)
  } catch (e) {
    alert('Natijani serverga saqlashda xatolik: ' + e.message + '\nIltimos, administrator bilan bog\'laning.')
    submitting.value = false
    finished = false
    return
  }

  if (timeUp) alert('Belgilangan vaqt tugadi. Test avtomatik yakunlandi.')
  router.push(`/result/${result.id}`)
}

function confirmFinish() {
  const unanswered = test.length - answeredCount.value
  let msg
  if (unanswered === 0) msg = 'Barcha savollarga javob berdingiz. Testni yakunlaysizmi?'
  else if (unanswered === test.length) msg = 'Siz hali biron bir savolga javob bermadingiz. Shunga qaramay testni yakunlamoqchimisiz?'
  else msg = `Siz ${unanswered} ta savolga hali javob bermadingiz. Shunga qaramay testni yakunlamoqchimisiz?`
  if (!confirm(msg)) return
  finish(false)
}

function beforeUnload(e) { e.preventDefault(); e.returnValue = '' }
onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
  tick()
  timerId = setInterval(tick, 1000)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload)
  clearInterval(timerId)
})
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-3 gap-3 flex-wrap">
      <div class="text-sm text-slate-600">Ishtirokchi: <span class="font-semibold text-slate-800">{{ participant }}</span></div>
      <div class="flex items-center gap-3">
        <div class="text-sm text-slate-600">Javoblar: <span class="font-semibold text-slate-800">{{ answeredCount }} / {{ test.length }}</span></div>
        <div :class="['px-3 py-1.5 rounded-lg text-white font-mono font-bold text-sm shadow flex items-center gap-1.5', timerColor]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ timerText }}
        </div>
      </div>
    </div>

    <div class="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
      <div class="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <span class="text-xs font-semibold uppercase tracking-wider text-brand-600">Savol {{ idx + 1 }} / {{ test.length }}</span>
        <span class="text-xs text-slate-500">{{ progress }}%</span>
      </div>

      <h2 class="text-lg md:text-xl font-semibold text-slate-800 leading-relaxed mb-5">{{ current.q }}</h2>

      <div class="space-y-2.5">
        <button
          v-for="(opt, i) in current.options"
          :key="i"
          @click="pick(opt)"
          :class="['w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-start gap-3',
            answers[idx] === opt
              ? 'border-brand-600 bg-brand-50 shadow'
              : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50']"
        >
          <span :class="['w-7 h-7 rounded-lg grid place-items-center text-xs font-bold shrink-0',
            answers[idx] === opt ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600']">
            {{ ['A','B','C','D'][i] }}
          </span>
          <span class="text-slate-800">{{ opt }}</span>
        </button>
      </div>

      <div class="flex items-center justify-between mt-6 pt-5 border-t">
        <button @click="prev" :disabled="idx === 0 || submitting"
          class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
          ← Orqaga
        </button>
        <div class="flex gap-2">
          <button v-if="idx < test.length - 1" @click="next" :disabled="submitting"
            class="px-5 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow disabled:opacity-60">
            Keyingisi →
          </button>
          <button @click="confirmFinish" :disabled="submitting"
            class="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow disabled:opacity-60">
            {{ submitting ? 'Saqlanmoqda…' : 'Testni yakunlash ✓' }}
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow border border-slate-200 p-4 mt-4">
      <div class="text-xs font-semibold text-slate-600 mb-2">Savollar bo'yicha harakatlanish</div>
      <div class="grid gap-1.5" style="grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))">
        <button
          v-for="(_, i) in test"
          :key="i"
          @click="jump(i)"
          :class="['h-8 w-8 rounded-md text-xs font-medium transition',
            i === idx ? 'bg-brand-600 text-white ring-2 ring-brand-300'
            : answers[i] !== null ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200']"
        >{{ i + 1 }}</button>
      </div>
    </div>
  </div>
</template>
