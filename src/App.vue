<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const isAdmin = computed(() => sessionStorage.getItem('ilhom_admin') === '1')
const showAdminLink = computed(() => isAdmin.value || route.path.startsWith('/admin'))
const mobileOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
    <header class="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30 shadow-sm">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-3 group">
            <div class="relative">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-600 text-white grid place-items-center font-extrabold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition">IL</div>
              <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white"></div>
            </div>
            <div class="leading-tight">
              <div class="font-extrabold text-slate-800 text-[15px] tracking-tight">"ILHOM" mukofoti</div>
              <div class="text-[11px] text-slate-500 font-medium">Xalqaro Innovatsion Universiteti</div>
            </div>
          </router-link>

          <nav class="hidden md:flex items-center gap-1">
            <router-link
              to="/"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition flex items-center gap-2"
              active-class="!text-brand-700 !bg-brand-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              ILHOM testi
            </router-link>

            <router-link
              to="/sorovnoma"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition flex items-center gap-2"
              active-class="!text-brand-700 !bg-brand-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              So'rovnomalar
            </router-link>

            <router-link
              v-if="showAdminLink"
              to="/admin"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition flex items-center gap-2"
              active-class="!text-brand-700 !bg-brand-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              Admin
              <span v-if="isAdmin" class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </router-link>

            <a
              href="https://xiuedu.uz"
              target="_blank"
              rel="noopener"
              class="ml-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:brightness-110 shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
            >
              xiuedu.uz
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
          </nav>

          <button
            @click="mobileOpen = !mobileOpen"
            class="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700"
            aria-label="Menu"
          >
            <svg v-if="!mobileOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div v-if="mobileOpen" class="md:hidden pb-3 space-y-1">
          <router-link @click="mobileOpen=false" to="/" class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-brand-50" active-class="!bg-brand-50 !text-brand-700">ILHOM testi</router-link>
          <router-link @click="mobileOpen=false" to="/sorovnoma" class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-brand-50" active-class="!bg-brand-50 !text-brand-700">So'rovnomalar</router-link>
          <router-link v-if="showAdminLink" @click="mobileOpen=false" to="/admin" class="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-brand-50" active-class="!bg-brand-50 !text-brand-700">Admin</router-link>
          <a href="https://xiuedu.uz" target="_blank" class="block px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600">xiuedu.uz →</a>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
      <router-view />
    </main>

    <footer class="border-t border-slate-200/70 bg-white/50">
      <div class="max-w-6xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>© {{ new Date().getFullYear() }} Xalqaro Innovatsion Universiteti — "ILHOM" mukofoti</div>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Tizim faol</span>
        </div>
      </div>
    </footer>
  </div>
</template>
