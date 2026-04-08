import { defineStore } from 'pinia'
import { generateTripAPI, regenerateDayAPI, editActivityAPI, addActivityAPI } from '../api/planner'

export const usePlannerStore = defineStore('planner', {
  state: () => ({
    currentRequest: {
      destination: '',
      days: 3,
      budget: '适中',
      companions: '朋友',
      pace: '适中',
      preferences: ''
    },
    tripResult: null as any,
    isLoading: false,
    error: null as string | null
  }),

  actions: {
    // 1. 生成全新行程
    async generateTrip() {
      this.isLoading = true
      this.error = null
      try {
        // 直接调用封装好的 API
        const data: any = await generateTripAPI(this.currentRequest)
        
        // 注意：因为 request.ts 拦截器里已经返回了 response.data，所以这里直接赋值 data 即可
        this.tripResult = data 
        return true 
      } catch (err: any) {
        // 兼容处理拦截器抛出的错误结构
        this.error = err.response?.data?.detail || err.message || '生成行程时发生错误'
        return false 
      } finally {
        this.isLoading = false
      }
    },

    // 2. 重新生成单日行程
    async regenerateDay(tripId: string, day: number) {
      this.error = null
      try {
        // 直接调用封装好的 API
        const data: any = await regenerateDayAPI(tripId, day)
        
        // 用后端返回的最新完整行程替换本地数据
        this.tripResult = data 
        return true
      } catch (err: any) {
        this.error = err.response?.data?.detail || err.message || '重生成失败'
        return false
      }
    },

    // 3. 智能微调单个活动
    async editActivity(tripId: string, day: number, activityIndex: number, userPrompt: string) {
      this.error = null
      try {
        const data: any = await editActivityAPI(tripId, day, activityIndex, userPrompt)
        // 同样，直接用后端返回的最新完整行程替换本地数据，Vue 会自动驱动界面局部更新
        this.tripResult = data 
        return true
      } catch (err: any) {
        this.error = err.response?.data?.detail || err.message || '活动修改失败'
        return false
      }
    },

    // 4. 添加新活动
    async addActivity(tripId: string, day: number, userPrompt: string) {
      this.error = null
      try {
        const data: any = await addActivityAPI(tripId, day, userPrompt)
        this.tripResult = data 
        return true
      } catch (err: any) {
        this.error = err.response?.data?.detail || err.message || '添加活动失败'
        return false
      }
    },
    
    // 5. 从历史行程加载
    loadHistoryTrip(historyPlanData: any) {
      this.tripResult = historyPlanData
    }
  }
})