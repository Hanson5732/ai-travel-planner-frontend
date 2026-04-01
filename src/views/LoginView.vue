<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <div class="header-titles">
        <h2>AI Travel Planner</h2>
        <p>开启你的智能旅行规划</p>
      </div>

      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="登录" name="login">
          <el-form 
            ref="loginFormRef" 
            :model="loginForm" 
            :rules="rules" 
            size="large"
            @keyup.enter="handleSubmit(loginFormRef, 'login')"
          >
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="请输入密码" 
                :prefix-icon="Lock" 
                show-password 
              />
            </el-form-item>
            <el-button 
              type="primary" 
              class="submit-btn" 
              :loading="isLoading" 
              @click="handleSubmit(loginFormRef, 'login')"
            >
              登 录
            </el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="注册" name="register">
          <el-form 
            ref="registerFormRef" 
            :model="registerForm" 
            :rules="rules" 
            size="large"
            @keyup.enter="handleSubmit(registerFormRef, 'register')"
          >
            <el-form-item prop="username">
              <el-input v-model="registerForm.username" placeholder="设置用户名" :prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="设置密码 (至少6位)" 
                :prefix-icon="Lock" 
                show-password 
              />
            </el-form-item>
            <el-button 
              type="primary" 
              class="submit-btn" 
              :loading="isLoading" 
              @click="handleSubmit(registerFormRef, 'register')"
            >
              注 册
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '../store/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

// 状态控制
const activeTab = ref('login')
const isLoading = ref(false)

// 表单引用
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({ username: '', password: '' })

// 表单校验规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
})

// 统一的提交处理逻辑
const handleSubmit = async (formEl: FormInstance | undefined, action: 'login' | 'register') => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      isLoading.value = true
      try {
        if (action === 'login') {
          await authStore.login(loginForm)
          ElMessage.success('登录成功，欢迎回来！')
        } else {
          await authStore.register(registerForm)
          ElMessage.success('注册成功，已为您自动登录！')
        }
        // 成功后跳转到行程规划页面
        router.push('/planner')
      } catch (error: any) {
        // 提取后端的错误提示
        const errorMsg = error.response?.data?.detail || `${action === 'login' ? '登录' : '注册'}失败，请稍后重试`
        ElMessage.error(errorMsg)
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  /* 使用天空蓝和白色的渐变背景，呼应旅行主题 */
  background: linear-gradient(135deg, #f5f7fa 0%, #4DA3FF 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.header-titles {
  text-align: center;
  margin-bottom: 30px;
}

.header-titles h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.header-titles p {
  margin: 8px 0 0;
  color: #909399;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
  border-radius: 8px;
  font-weight: bold;
}

/* 深度覆盖 Element Plus 的一些默认样式，使其更柔和 */
:deep(.el-tabs__item) {
  font-size: 16px;
}
</style>