<template>
  <el-menu
    :default-active="route.path"
    class="nav-menu"
    mode="horizontal"
    :router="true"
    :ellipsis="false"
  >
    <router-link to="/" class="logo-link">
      <span class="logo-text">✈️ AI Travel</span>
    </router-link>

    <el-menu-item index="/community">旅行社区</el-menu-item>

    <template v-if="authStore.isAuthenticated">
      <el-menu-item index="/planner">规划行程</el-menu-item>
      <el-menu-item index="/history">历史记录</el-menu-item>
    </template>

    <div class="flex-grow" />

    <template v-if="authStore.isAuthenticated">
      <el-sub-menu index="user-menu">
        <template #title>
          <span class="username">你好，{{ authStore.username || '旅行家' }}</span>
        </template>
        <el-menu-item @click="handleLogout">退出登录</el-menu-item>
      </el-sub-menu>
    </template>

    <template v-else>
      <el-menu-item index="/login">登录 / 注册</el-menu-item>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  
  authStore.token = ''
  authStore.username = ''
  
  router.push('/')
}
</script>

<style scoped>
.nav-menu {
  padding: 0 5%;
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* 专门为 Logo 写的样式，让它垂直居中且没有链接下划线 */
.logo-link {
  display: flex;
  align-items: center;
  padding: 0 20px;
  text-decoration: none;
  margin-right: 10px; /* 让 Logo 和后面的“规划行程”留出一点呼吸空间 */
}

/* 禁用 Logo 的原生 hover 背景变化，保持纯净 */
.logo-link:hover {
  background-color: transparent;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--el-color-primary);
}

.flex-grow {
  flex-grow: 1;
}

.username {
  font-weight: 500;
}
</style>