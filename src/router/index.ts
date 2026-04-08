import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/planner',
    name: 'Planner',
    component: () => import('../views/PlannerView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/ResultView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('../views/CommunityView.vue')
  },
  {
    path: '/community/create',
    name: 'CreatePost',
    component: () => import('../views/CreatePostView.vue'),
    meta: { requiresAuth: true } // 🌟 发布帖子必须登录
  },
  {
    path: '/community/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetailView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：拦截未登录访问
router.beforeEach((to, _, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router