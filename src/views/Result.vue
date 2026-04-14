<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiGetResult } from '../utils/api.js'
import html2pdf from 'html2pdf.js'

const props = defineProps({ id: String })
const router = useRouter()
const result = ref(null)
const loading = ref(true)
const pdfRef = ref(null)
const busy = ref(false)

onMounted(async () => {
  try {
    result.value = await apiGetResult(props.id)
  } catch (e) {
    router.replace('/')
    return
  } finally {
    loading.value = false
  }
})

const grade = computed(() => {
  const p = result.value?.percent ?? 0
  if (p >= 90) return { label: 'A\'LO DARAJADA', color: 'from-emerald-500 to-green-600' }
  if (p >= 75) return { label: 'YAXSHI NATIJA', color: 'from-blue-500 to-indigo-600' }
  if (p >= 60) return { label: 'QONIQARLI', color: 'from-amber-500 to-orange-500' }
  return { label: 'QAYTA TOPSHIRISH TAVSIYA ETILADI', color: 'from-rose-500 to-red-600' }
})

function fmt(iso) {
  return new Date(iso).toLocaleString('uz-UZ', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' })
}
function fmtDur(sec) {
  const m = Math.floor(sec / 60), s = sec % 60
  return `${m} daqiqa ${s} soniya`
}

async function downloadPDF() {
  if (!pdfRef.value) return
  busy.value = true
  try {
    await html2pdf().set({
      margin: 10,
      filename: `ILHOM_${result.value.name.replace(/\s+/g, '_')}_${result.value.percent}%.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }).from(pdfRef.value).save()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="text-center text-slate-500 py-10">Yuklanmoqda…</div>
  <div v-else-if="result" class="max-w-3xl mx-auto space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <router-link to="/" class="text-sm text-slate-600 hover:text-brand-600">← Bosh sahifaga qaytish</router-link>
      <div class="flex gap-2">
        <button @click="downloadPDF" :disabled="busy"
          class="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow disabled:opacity-60">
          {{ busy ? 'Tayyorlanmoqda…' : 'PDF shaklida yuklab olish ⬇' }}
        </button>
      </div>
    </div>

    <div ref="pdfRef" class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div :class="['bg-gradient-to-r text-white p-6', grade.color]">
        <div class="text-xs uppercase tracking-widest opacity-90">Xalqaro Innovatsion Universiteti</div>
        <div class="text-xl font-bold">"ILHOM" mukofoti — test natijasi</div>
        <div class="mt-4 flex items-end justify-between gap-4">
          <div>
            <div class="text-xs opacity-80">Ishtirokchi F.I.Sh.</div>
            <div class="text-2xl font-extrabold tracking-wide">{{ result.name }}</div>
          </div>
          <div class="text-right">
            <div class="text-[10px] uppercase opacity-80">Umumiy baho</div>
            <div class="text-lg font-bold">{{ grade.label }}</div>
          </div>
        </div>
      </div>

      <div class="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-slate-50 rounded-xl p-3">
          <div class="text-[11px] text-slate-500 uppercase">Foiz ko'rsatkichi</div>
          <div class="text-2xl font-bold text-slate-800">{{ result.percent }}%</div>
        </div>
        <div class="bg-slate-50 rounded-xl p-3">
          <div class="text-[11px] text-slate-500 uppercase">To'g'ri javoblar</div>
          <div class="text-2xl font-bold text-emerald-700">{{ result.correct }} / {{ result.total }}</div>
        </div>
        <div class="bg-slate-50 rounded-xl p-3">
          <div class="text-[11px] text-slate-500 uppercase">Sarflangan vaqt</div>
          <div class="text-base font-semibold text-slate-800">{{ fmtDur(result.durationSec) }}</div>
        </div>
        <div class="bg-slate-50 rounded-xl p-3">
          <div class="text-[11px] text-slate-500 uppercase">Topshirilgan sana</div>
          <div class="text-base font-semibold text-slate-800">{{ fmt(result.at) }}</div>
        </div>
      </div>

      <div class="px-6 pb-6">
        <div class="text-sm font-bold text-slate-700 mb-2">Savollar bo'yicha batafsil natija</div>
        <ol class="space-y-2 text-sm">
          <li v-for="(d, i) in result.details" :key="i"
            :class="['p-3 rounded-lg border', d.ok ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50']">
            <div class="font-medium text-slate-800"><span class="text-slate-500">{{ i + 1 }}.</span> {{ d.q }}</div>
            <div class="mt-1 text-xs">
              <span class="text-slate-500">Sizning javobingiz:</span>
              <span :class="d.ok ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'">
                {{ d.chosen || '— (javob belgilanmagan)' }}
              </span>
              <template v-if="!d.ok">
                <span class="text-slate-500"> · To'g'ri javob:</span>
                <span class="text-emerald-700 font-semibold"> {{ d.correct }}</span>
              </template>
            </div>
          </li>
        </ol>
      </div>

      <div class="px-6 py-3 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between border-t">
        <span>ID: {{ result.id }}</span>
        <span>© XIU "ILHOM" mukofoti</span>
      </div>
    </div>
  </div>
</template>
