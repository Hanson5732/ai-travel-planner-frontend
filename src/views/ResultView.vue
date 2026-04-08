<template>
  <div class="result-container">
    <div v-if="!hasResult" class="empty-state">
      <el-empty description="您的旅行魔法箱还是空的，先去规划一下吧！">
        <el-button type="primary" size="large" @click="goBack">前往规划页</el-button>
      </el-empty>
    </div>

    <div v-else class="timeline-wrapper">
      <div class="header-section">
        <h1 class="main-title">您的 {{ tripData.destination }} {{ tripData.total_days }} 日专属行程</h1>
        <p class="subtitle">AI 已为您规划完毕，开启精彩之旅！</p>
        <div class="header-actions">
          <el-button type="primary" plain @click="goBack">返回重新规划</el-button>
        </div>
      </div>

      <el-timeline class="custom-timeline">
        <el-timeline-item
          v-for="(dayPlan, index) in tripData.daily_plans"
          :key="index"
          :timestamp="`Day ${dayPlan.day} · ${dayPlan.theme}`"
          placement="top"
          size="large"
          type="primary"
        >
          <el-card class="day-card" shadow="always">
            <div class="day-header">
              <h3>🗓️ 今日概览</h3>
              <el-button 
                type="success" 
                size="small" 
                plain 
                :icon="Refresh" 
                @click="regenerateDay(dayPlan.day)"
              >
                重新生成此日
              </el-button>
            </div>
            
            <div class="activity-list">
              <div 
                v-for="(activity, aIndex) in dayPlan.activities" 
                :key="aIndex" 
                class="activity-item"
              >
                <div class="activity-time">
                  <el-tag type="info" effect="dark" round>{{ activity.time }}</el-tag>
                </div>
                <div class="activity-content">
                  <h4 class="location-title">📍 {{ activity.location }}</h4>
                  <p class="location-desc">{{ activity.description }}</p>
                  
                  <div class="activity-actions">
                    <el-button 
                        link 
                        type="primary"
                        size="small" 
                        :icon="Edit" 
                        @click="openEditDialog(dayPlan.day, Number(aIndex), activity)">编辑
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <div class="add-action-wrapper">
               <el-button type="primary" link :icon="Plus" @click="openAddDialog(dayPlan.day)">
                 + 添加新地点或活动
               </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-dialog v-model="editDialogVisible" title="✨ AI 智能微调活动" width="500px" align-center>
        <div v-if="currentEditContext" class="edit-dialog-content">
          <p class="edit-target-title">
            原计划：<el-tag type="info">{{ currentEditContext.activity.time }}</el-tag> 
            <strong>{{ currentEditContext.activity.location }}</strong>
          </p>
          <p class="edit-target-desc">{{ currentEditContext.activity.description }}</p>
          
          <el-divider border-style="dashed" />
          
          <p class="prompt-label">你想怎么修改？</p>
          <el-input
            v-model="editPrompt"
            type="textarea"
            :rows="3"
            placeholder="例如：不想去博物馆，帮我换成一个适合喝咖啡放松的地方..."
            @keyup.enter="submitEditActivity"
          />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" :loading="isEditing" @click="submitEditActivity">
              {{ isEditing ? 'AI 施法中...' : '让 AI 帮我改' }}
            </el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="addDialogVisible" title="🌟 召唤 AI 插入新行程" width="500px" align-center>
        <div class="edit-dialog-content">
          <p class="prompt-label">你想在 Day {{ currentAddDay }} 加点什么？</p>
          <p class="edit-target-desc" style="margin-bottom: 15px;">
            AI 会自动为您调整当天的时间线，确保行程顺畅。
          </p>
          <el-input
            v-model="addPrompt"
            type="textarea"
            :rows="3"
            placeholder="例如：晚上想加一个去当地酒吧喝一杯的行程..."
            @keyup.enter="submitAddActivity"
          />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="success" :loading="isAdding" @click="submitAddActivity">
              {{ isAdding ? 'AI 重新排片中...' : '插入行程' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Edit, Plus } from '@element-plus/icons-vue'
import { usePlannerStore } from '../stores/planner'

const router = useRouter()
const plannerStore = usePlannerStore()

// 1. 获取 AI 生成的数据
const tripData = computed(() => plannerStore.tripResult)
const hasResult = computed(() => !!tripData.value && !!tripData.value.daily_plans)

const goBack = () => {
  router.push('/planner')
}

// 2. 动态规划操作（占位方法，方便下一阶段对接）
const regenerateDay = (day: number) => {
  ElMessage.success(`正在呼叫 AI 重新生成第 ${day} 天的行程... (接口对接中)`)
}

// --- 智能微调（编辑单项活动）状态 ---
const editDialogVisible = ref(false)
const isEditing = ref(false)
const editPrompt = ref('')
// 用于记录当前正在编辑哪一天、第几个活动、以及旧活动数据
const currentEditContext = ref<{day: number, index: number, activity: any} | null>(null)

// 点击“编辑”按钮时打开弹窗
const openEditDialog = (day: number, index: number, activity: any) => {
  currentEditContext.value = { day, index, activity }
  editPrompt.value = '' // 清空上次的输入
  editDialogVisible.value = true
}

// 提交给 AI 进行修改
const submitEditActivity = async () => {
  if (!editPrompt.value.trim()) {
    ElMessage.warning('请告诉 AI 您的修改诉求哦！')
    return
  }
  if (!tripData.value?.trip_id || !currentEditContext.value) return

  isEditing.value = true
  const success = await plannerStore.editActivity(
    tripData.value.trip_id,
    currentEditContext.value.day,
    currentEditContext.value.index,
    editPrompt.value
  )
  isEditing.value = false

  if (success) {
    ElMessage.success('✨ 魔法生效，活动已为您替换！')
    editDialogVisible.value = false
  } else {
    ElMessage.error(plannerStore.error || '修改失败，请重试')
  }
}

// --- 添加新活动状态 ---
const addDialogVisible = ref(false)
const isAdding = ref(false)
const addPrompt = ref('')
const currentAddDay = ref<number | null>(null)

// 点击“+ 添加新地点”打开弹窗
const openAddDialog = (day: number) => {
  currentAddDay.value = day
  addPrompt.value = ''
  addDialogVisible.value = true
}

// 提交添加请求
const submitAddActivity = async () => {
  if (!addPrompt.value.trim()) {
    ElMessage.warning('请告诉 AI 您想添加什么行程！')
    return
  }
  if (!tripData.value?.trip_id || !currentAddDay.value) return

  isAdding.value = true
  const success = await plannerStore.addActivity(
    tripData.value.trip_id,
    currentAddDay.value,
    addPrompt.value
  )
  isAdding.value = false

  if (success) {
    ElMessage.success('✨ 魔法生效，新活动已完美融合进当日行程！')
    addDialogVisible.value = false
  } else {
    ElMessage.error(plannerStore.error || '添加失败，请重试')
  }
}
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 20px;
}

.empty-state {
  margin-top: 100px;
}

.timeline-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 50px;
}

.main-title {
  font-size: 2.5rem;
  color: #303133;
  margin-bottom: 10px;
}

.subtitle {
  margin-top: 30px;
  font-size: 1.2rem;
  color: #909399;
  margin-bottom: 20px;
}

/* 自定义时间轴样式 */
.custom-timeline {
  padding-left: 10px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 15px;
}

.day-card {
  border-radius: 12px;
  border: none;
  background-color: #ffffff;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.day-header h3 {
  margin: 0;
  color: #303133;
}

.activity-item {
  display: flex;
  margin-bottom: 25px;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-time {
  flex: 0 0 120px;
  padding-top: 2px;
}

.activity-content {
  flex: 1;
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  position: relative;
  transition: background-color 0.3s ease;
}

.activity-content:hover {
  background: #ecf5ff;
}

.location-title {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #303133;
}

.location-desc {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.activity-actions {
  position: absolute;
  right: 15px;
  top: 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.activity-content:hover .activity-actions {
  opacity: 1;
}

.add-action-wrapper {
  margin-top: 20px;
  text-align: center;
  padding-top: 15px;
  border-top: 1px dashed #ebeef5;
}

/* 智能微调弹窗样式 */
.edit-target-title {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #303133;
}
.edit-target-desc {
  margin: 0;
  color: #909399;
  font-size: 0.9rem;
  line-height: 1.5;
}
.prompt-label {
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}
</style>