<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const isTeacher = route.params.type === 'oqituvchi'
</script>

<template>
  <div class="max-w-md mx-auto text-center mt-10">
    <div :class="['w-20 h-20 mx-auto rounded-full grid place-items-center text-white shadow-xl mb-5',
      isTeacher ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-brand-500 to-indigo-600']">
      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
    </div>
    <h1 class="text-2xl font-extrabold text-slate-800">Rahmat!</h1>
    <p class="text-slate-600 mt-2">So'rovnoma muvaffaqiyatli yuborildi. Ishtirokingiz uchun minnatdormiz — javoblaringiz tadqiqotda hisobga olinadi.</p>
    <div class="flex gap-2 justify-center mt-6">
      <router-link to="/sorovnoma" class="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium">Boshqa so'rovnoma</router-link>
      <router-link to="/" class="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900">Bosh sahifa</router-link>
    </div>
  </div>
</template>
