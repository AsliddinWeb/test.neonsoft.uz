<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSurvey } from '../data/surveys.js'
import { apiSubmitSurvey, uid } from '../utils/api.js'

const route = useRoute()
const router = useRouter()
const survey = computed(() => getSurvey(route.params.type))

const fullName = ref('')
const answers = reactive({})
const errors = ref({})
const submitting = ref(false)
const submitErr = ref('')

onMounted(() => {
  if (!survey.value) router.replace('/sorovnoma')
})

function validate() {
  errors.value = {}
  let ok = true
  for (const q of survey.value.questions) {
    if (!q.required) continue
    const v = answers[q.id]
    if (q.type === 'radio' && !v) { errors.value[q.id] = 'Javob tanlang'; ok = false }
    else if (q.type === 'scale' && !v) { errors.value[q.id] = 'Bahoni tanlang'; ok = false }
    else if (q.type === 'checkbox' && (!v || v.length === 0)) { errors.value[q.id] = 'Kamida bittasini tanlang'; ok = false }
    else if (q.type === 'matrix') {
      const missing = q.statements.filter(s => !v?.[s.id])
      if (missing.length) { errors.value[q.id] = `Barcha bayonotlarni baholang (${missing.length} ta qoldi)`; ok = false }
    }
  }
  return ok
}

function toggleCheckbox(qid, opt, max) {
  if (!answers[qid]) answers[qid] = []
  const arr = answers[qid]
  const i = arr.indexOf(opt)
  if (i >= 0) arr.splice(i, 1)
  else {
    if (max && arr.length >= max) return
    arr.push(opt)
  }
}

function setMatrix(qid, sid, val) {
  if (!answers[qid]) answers[qid] = {}
  answers[qid][sid] = val
}

async function submit() {
  submitErr.value = ''
  if (!validate()) {
    submitErr.value = 'Iltimos, majburiy savollarga javob bering.'
    const first = Object.keys(errors.value)[0]
    if (first) {
      const el = document.getElementById('q-' + first)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }
  submitting.value = true
  const id = uid()
  const name = fullName.value.trim().replace(/\s+/g, ' ').toUpperCase()
  try {
    await apiSubmitSurvey({
      id,
      type: survey.value.type,
      name: name || null,
      data: { answers: { ...answers } }
    })
    router.push(`/sorovnoma/yakun/${survey.value.type}`)
  } catch (e) {
    submitErr.value = 'Saqlashda xatolik: ' + e.message
  } finally {
    submitting.value = false
  }
}

const accent = computed(() => survey.value?.type === 'oqituvchi'
  ? { ring: 'ring-emerald-500', bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-700', border: 'border-emerald-500', light: 'bg-emerald-50', light2: 'bg-emerald-100' }
  : { ring: 'ring-brand-500', bg: 'bg-brand-600', hover: 'hover:bg-brand-700', text: 'text-brand-700', border: 'border-brand-500', light: 'bg-brand-50', light2: 'bg-brand-100' })
</script>

<template>
  <div v-if="survey" class="max-w-3xl mx-auto">
    <router-link to="/sorovnoma" class="text-sm text-slate-500 hover:text-slate-700">← So'rovnomalar ro'yxatiga</router-link>

    <div class="bg-white rounded-2xl shadow-lg border border-slate-200 mt-3 overflow-hidden">
      <div :class="['p-6 text-white', survey.type === 'oqituvchi' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-brand-600 to-indigo-600']">
        <div class="text-xs uppercase tracking-widest opacity-80">{{ survey.subtitle }}</div>
        <h1 class="text-2xl font-bold mt-1">{{ survey.title }}</h1>
      </div>

      <div class="p-6 space-y-5">
        <p class="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-4">{{ survey.intro }}</p>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Ism familiya <span class="font-normal text-slate-400">(ixtiyoriy)</span></label>
          <input v-model="fullName" type="text" placeholder="Anonim qoldirish uchun bo'sh qoldiring"
            class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none placeholder:normal-case"
            style="text-transform: uppercase" />
        </div>

        <!-- Questions -->
        <div v-for="(q, idx) in survey.questions" :key="q.id" :id="'q-' + q.id" class="border-t pt-5">
          <div class="flex items-start gap-3">
            <span :class="['shrink-0 w-7 h-7 rounded-lg grid place-items-center text-xs font-bold text-white', accent.bg]">{{ idx + 1 }}</span>
            <div class="flex-1">
              <div class="font-semibold text-slate-800 leading-relaxed">{{ q.label }}<span v-if="q.required" class="text-rose-500"> *</span></div>
              <div v-if="q.hint" class="text-xs text-slate-500 mt-0.5">{{ q.hint }}</div>
            </div>
          </div>

          <div class="mt-3 ml-10">
            <!-- Radio -->
            <div v-if="q.type === 'radio'" class="space-y-1.5">
              <label v-for="opt in q.options" :key="opt"
                :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition',
                  answers[q.id] === opt ? `${accent.border} ${accent.light}` : 'border-slate-200 hover:border-slate-300']">
                <input type="radio" :name="q.id" :value="opt" v-model="answers[q.id]" class="accent-current" />
                <span class="text-sm text-slate-800">{{ opt }}</span>
              </label>
            </div>

            <!-- Checkbox -->
            <div v-else-if="q.type === 'checkbox'" class="space-y-1.5">
              <label v-for="opt in q.options" :key="opt"
                :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition',
                  (answers[q.id]||[]).includes(opt) ? `${accent.border} ${accent.light}` : 'border-slate-200 hover:border-slate-300']">
                <input type="checkbox" :checked="(answers[q.id]||[]).includes(opt)"
                  @change="toggleCheckbox(q.id, opt, q.max)" class="accent-current" />
                <span class="text-sm text-slate-800">{{ opt }}</span>
              </label>
              <p v-if="q.max" class="text-xs text-slate-400">Eng ko'pi {{ q.max }} ta tanlash mumkin</p>
            </div>

            <!-- Scale -->
            <div v-else-if="q.type === 'scale'">
              <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>{{ q.leftLabel }}</span><span>{{ q.rightLabel }}</span>
              </div>
              <div class="grid grid-cols-5 gap-2">
                <button v-for="n in q.max" :key="n" type="button" @click="answers[q.id] = n"
                  :class="['py-3 rounded-lg border-2 font-bold transition',
                    answers[q.id] === n ? `${accent.border} ${accent.light} ${accent.text}` : 'border-slate-200 hover:border-slate-300 text-slate-600']">
                  {{ n }}
                </button>
              </div>
            </div>

            <!-- Matrix -->
            <div v-else-if="q.type === 'matrix'" class="space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>{{ q.leftLabel }}</span><span>{{ q.rightLabel }}</span>
              </div>
              <div v-for="s in q.statements" :key="s.id" class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div class="text-sm text-slate-800 mb-2">{{ s.text }}</div>
                <div class="grid grid-cols-5 gap-1.5">
                  <button v-for="n in q.max" :key="n" type="button" @click="setMatrix(q.id, s.id, n)"
                    :class="['py-2 rounded-md border-2 text-sm font-semibold transition',
                      answers[q.id]?.[s.id] === n ? `${accent.border} bg-white ${accent.text}` : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500']">
                    {{ n }}
                  </button>
                </div>
              </div>
            </div>

            <p v-if="errors[q.id]" class="text-xs text-rose-600 mt-2">{{ errors[q.id] }}</p>
          </div>
        </div>

        <div class="border-t pt-5">
          <p v-if="submitErr" class="text-sm text-rose-600 mb-3">{{ submitErr }}</p>
          <button @click="submit" :disabled="submitting"
            :class="['w-full py-3.5 rounded-xl text-white font-semibold shadow-lg transition disabled:opacity-60',
              survey.type === 'oqituvchi' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110' : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:brightness-110']">
            {{ submitting ? 'Yuborilmoqda…' : 'So\'rovnomani yuborish' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
