<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QUESTIONS } from '../data/questions.js'
import { apiGetSettings } from '../utils/api.js'

const router = useRouter()
const fullName = ref('')
const error = ref('')
const count = ref(30)
const durationMin = ref(60)
const loading = ref(true)

onMounted(async () => {
  try {
    const s = await apiGetSettings()
    count.value = Math.min(s.questionCount || 30, QUESTIONS.length)
    durationMin.value = s.durationMin || 60
  } catch (e) {
    // fallback: if server unreachable use defaults
    console.warn('settings fetch failed', e)
  } finally {
    loading.value = false
  }
})

function start() {
  const name = fullName.value.trim().replace(/\s+/g, ' ').toUpperCase()
  if (name.length < 3) {
    error.value = 'Ism familiyani to\'liq kiriting (kamida 3 ta harf).'
    return
  }
  sessionStorage.setItem('ilhom_participant', name)
  sessionStorage.setItem('ilhom_count', String(count.value))
  sessionStorage.setItem('ilhom_duration', String(durationMin.value))
  router.push('/test')
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div class="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 text-white p-6">
        <div class="text-xs uppercase tracking-widest opacity-80">Xalqaro Innovatsion Universiteti</div>
        <h1 class="text-2xl md:text-3xl font-bold mt-1">"ILHOM" mukofoti — test sinovi</h1>
        <p class="text-sm text-white/85 mt-2 leading-relaxed">O'zbek adabiyoti va adabiyotshunosligi yo'nalishi bo'yicha bilim sinovi. Savollar va javob variantlari har bir ishtirokchi uchun tasodifiy tartibda taqdim etiladi.</p>
      </div>

      <div class="p-6 space-y-5">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">Ism va familiyangiz</label>
          <input
            v-model="fullName"
            @input="error=''"
            type="text"
            placeholder="Abdujabborov Asliddin"
            class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition placeholder:normal-case"
            style="text-transform: uppercase"
          />
          <p class="text-xs text-slate-500 mt-1">Kiritilgan ma'lumot avtomatik ravishda BOSH HARFLARDA saqlanadi.</p>
          <p v-if="error" class="text-xs text-red-600 mt-1.5">{{ error }}</p>
        </div>

        <div class="bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 rounded-xl p-4 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-white grid place-items-center shrink-0 shadow-sm">
            <svg class="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          </div>
          <div class="flex-1">
            <div class="text-xs text-slate-600 font-medium">Test hajmi</div>
            <div class="text-base font-bold text-slate-800">{{ count }} ta savol · {{ durationMin }} daqiqa</div>
          </div>
        </div>

        <button
          @click="start"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition disabled:opacity-60"
        >{{ loading ? 'Yuklanmoqda…' : 'Testni boshlash →' }}</button>

        <div class="text-xs text-slate-600 border-t pt-3 space-y-1.5">
          <div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span><span>Savollar va javob variantlari har bir urinishda aralashtirilgan holda beriladi.</span></div>
          <div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span><span>Test yakunida natija serverda saqlanadi va PDF shaklida yuklab olish imkoniyati mavjud.</span></div>
          <div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span><span>Test davomida sahifani yangilamang — javoblar yo'qotilishi mumkin.</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
