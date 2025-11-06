import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import 'vant/lib/index.css'

// 确保Vue API全局可用
import * as VueAPI from 'vue'
window.Vue = VueAPI

// 导入页面组件
import Login from './pages/Login.vue'
import Home from './pages/Home.vue'
import MatchDetail from './pages/MatchDetail.vue'
import CreateMatch from './pages/CreateMatch.vue'
import Profile from './pages/Profile.vue'
import UserProfile from './pages/UserProfile.vue'
import MyMatches from './pages/MyMatches.vue'
import History from './pages/History.vue'

import AdminDashboard from './pages/AdminDashboard.vue'
import About from './pages/About.vue'
import HelpFeedback from './pages/HelpFeedback.vue'
import Leaderboard from './pages/Leaderboard.vue'

// 路由配置
const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  { path: '/home', component: Home },
  { path: '/match/:id', component: MatchDetail },
  { path: '/create', component: CreateMatch },
  { path: '/profile', component: Profile },
  { path: '/user/:id', component: UserProfile },
  { path: '/my-matches', component: MyMatches },
  { path: '/history', component: History },
  { path: '/admin', component: AdminDashboard },
  { path: '/about', component: About },
  { path: '/help-feedback', component: HelpFeedback },
  { path: '/leaderboard', component: Leaderboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 检查登录状态
router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  
  // 从localStorage获取登录状态
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (authRequired && !isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')