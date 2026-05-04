import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Test from './views/Test.vue'
import Result from './views/Result.vue'
import Admin from './views/Admin.vue'
import SurveyHome from './views/SurveyHome.vue'
import Survey from './views/Survey.vue'
import SurveyDone from './views/SurveyDone.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/test', component: Test },
    { path: '/result/:id', component: Result, props: true },
    { path: '/sorovnoma', component: SurveyHome },
    { path: '/sorovnoma/yakun/:type', component: SurveyDone },
    { path: '/sorovnoma/:type', component: Survey },
    { path: '/admin', component: Admin }
  ]
})

createApp(App).use(router).mount('#app')
