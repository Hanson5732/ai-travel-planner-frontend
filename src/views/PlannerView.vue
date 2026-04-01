<template>
  <div class="planner-container">
    <el-card class="planner-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>告诉我们你的旅行计划</h2>
          <p>AI 将为你量身定制专属行程</p>
        </div>
      </template>

      <el-form 
        ref="formRef" 
        :model="plannerStore.currentRequest" 
        label-position="top" 
        size="large"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="你想去哪里？" prop="destination" required>
              <el-input 
                v-model="plannerStore.currentRequest.destination" 
                placeholder="例如：澳门、东京、巴黎..." 
                clearable 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划去几天？" prop="days" required>
              <el-input-number 
                v-model="plannerStore.currentRequest.days" 
                :min="1" 
                :max="14" 
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="旅行预算水平">
          <el-radio-group v-model="plannerStore.currentRequest.budget">
            <el-radio-button label="经济" />
            <el-radio-button label="适中" />
            <el-radio-button label="豪华" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="随行人员">
          <el-radio-group v-model="plannerStore.currentRequest.companions">
            <el-radio-button label="独自" />
            <el-radio-button label="情侣" />
            <el-radio-button label="家庭" />
            <el-radio-button label="朋友" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出行节奏">
          <el-radio-group v-model="plannerStore.currentRequest.pace">
            <el-radio-button label="轻松" />
            <el-radio-button label="适中" />
            <el-radio-button label="紧凑" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="有什么特殊偏好吗？（选填）">
          <el-input 
            v-model="plannerStore.currentRequest.preferences" 
            type="textarea" 
            :rows="3" 
            placeholder="例如：必须包含当地特色美食打卡、想去小众历史建筑等..." 
          />
        </el-form-item>

        <div class="submit-wrapper">
          <el-button 
            type="primary" 
            size="large" 
            class="generate-btn" 
            :loading="plannerStore.isLoading" 
            @click="submitPlan"
          >
            {{ plannerStore.isLoading ? 'AI 正在为你施展魔法...' : '生成专属行程' }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlannerStore } from '../store/usePlannerStore'

const router = useRouter()
const plannerStore = usePlannerStore()
const formRef = ref()

const submitPlan = async () => {
  // 确保 form 实例存在
  if (!formRef.value) return
  
  // 调用 Element Plus 的原生校验方法
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 校验通过，开始调用后端 AI 接口
      const success = await plannerStore.generateTrip()
      
      if (success) {
        ElMessage.success('行程生成成功！')
        router.push('/result')
      } else {
        ElMessage.error(plannerStore.error || '生成失败，请稍后再试')
      }
    } else {
      // 校验失败时的提示
      ElMessage.warning('请先完善必填的旅行信息哦！')
    }
  })
}
</script>

<style scoped>
.planner-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}
.planner-card { width: 100%; max-width: 800px; border-radius: 12px; }
.card-header { text-align: center; }
.card-header h2 { margin: 0 0 10px 0; color: #303133; }
.card-header p { margin: 0; color: #909399; }
.full-width { width: 100%; }
.submit-wrapper { margin-top: 40px; text-align: center; }
.generate-btn {
  width: 60%; font-size: 1.2rem; padding: 15px 0; border-radius: 8px;
  background: linear-gradient(90deg, #409EFF, #67C23A); border: none; transition: transform 0.2s; color: white;
}
.generate-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4); }
</style>