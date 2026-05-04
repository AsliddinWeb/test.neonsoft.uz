<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function go(path) { router.push(path) }
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800">So'rovnomalar</h1>
      <p class="text-slate-600 mt-2 max-w-2xl mx-auto">Jahon banki bilan hamkorlikda o'tkazilayotgan "Ta'limda sun'iy intellektga tayyorgarlikni baholash" tadqiqoti so'rovnomalari. Iltimos, o'zingizga mos bo'lganini tanlang.</p>
    </div>

    <div class="grid md:grid-cols-2 gap-5">
      <button @click="go('/sorovnoma/talaba')"
        class="group text-left bg-white rounded-2xl border-2 border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-xl transition p-6">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 grid place-items-center text-white shadow-lg mb-4">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
        </div>
        <div class="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">1-so'rovnoma</div>
        <h2 class="text-xl font-bold text-slate-800 group-hover:text-brand-700">Talabalar va o'quvchilar uchun</h2>
        <p class="text-sm text-slate-600 mt-2">Ta'limda SI vositalaridan qanday foydalanishingiz va bu jarayondagi tajribangiz haqida.</p>
        <div class="mt-4 inline-flex items-center text-sm font-semibold text-brand-600 group-hover:translate-x-1 transition">
          So'rovnomani boshlash →
        </div>
      </button>

      <button @click="go('/sorovnoma/oqituvchi')"
        class="group text-left bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition p-6">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white shadow-lg mb-4">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">2-so'rovnoma</div>
        <h2 class="text-xl font-bold text-slate-800 group-hover:text-emerald-700">Professor-o'qituvchilar uchun</h2>
        <p class="text-sm text-slate-600 mt-2">O'qitish faoliyatida SIdan foydalanish, treninglar va to'siqlar haqidagi fikringiz.</p>
        <div class="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600 group-hover:translate-x-1 transition">
          So'rovnomani boshlash →
        </div>
      </button>
    </div>

    <div class="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
      <div class="font-semibold mb-1">Eslatma</div>
      <p>So'rovnoma anonim. To'g'ri yoki noto'g'ri javoblar yo'q. Sizning haqiqiy tajribangiz va xavotirlaringiz biz uchun muhim.</p>
    </div>
  </div>
</template>
