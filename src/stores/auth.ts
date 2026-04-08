import { defineStore } from 'pinia'
import request from '../utils/request'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(loginForm: any) {
      // FastAPI OAuth2 需要 form-data 格式
      const formData = new URLSearchParams()
      formData.append('username', loginForm.username)
      formData.append('password', loginForm.password)

      const response: any = await request.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      
      this.token = response.access_token
      this.username = loginForm.username
      localStorage.setItem('token', this.token)
      localStorage.setItem('username', this.username)
    },
    async register(registerForm: any) {
      await request.post('/auth/register', registerForm)
      // 注册成功后直接调用登录
      await this.login(registerForm)
    },
    logout() {
      this.token = ''
      this.username = ''
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    }
  }
})