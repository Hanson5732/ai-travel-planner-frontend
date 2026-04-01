<template>
  <div class="history-container">
    <div class="header-section">
      <h1 class="main-title">我的旅行足迹</h1>
      <p class="subtitle">在这里找回您曾经的心动瞬间与完美规划</p>
      
      <el-button type="primary" size="large" @click="goToPlanner" :icon="Plus" class="new-btn">
        创建新行程
      </el-button>
    </div>

    <el-skeleton :rows="5" animated v-if="isLoading" class="skeleton-wrapper" />

    <el-empty 
      v-else-if="historyList.length === 0" 
      description="您还没有生成过行程哦，快去开启第一次规划吧！" 
    />

    <el-row v-else :gutter="20" class="history-grid">
      <el-col 
        :xs="24" :sm="12" :md="8" :lg="6" 
        v-for="trip in historyList" 
        :key="trip.trip_id"
        class="card-col"
      >
        <el-card class="trip-card" shadow="hover" @click="viewTrip(trip.plan_data)">
          <div class="card-content">
            <div class="destination-header">
              <h3>📍 {{ trip.destination }}</h3>
              <el-tag type="success" effect="dark">{{ trip.plan_data.total_days }} 天</el-tag>
            </div>
            
            <p class="theme-text">
              ✨ 主题：{{ trip.plan_data.daily_plans[0]?.theme || '精彩旅程' }}
            </p>
            
            <div class="footer-info">
              <span class="date"><el-icon><Calendar /></el-icon> {{ trip.created_at }}</span>
              <el-button type="primary" link>查看详情 &rarr;</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getTripHistoryAPI } from '../api/planner'
import { usePlannerStore } from '../store/usePlannerStore'

const router = useRouter()
const plannerStore = usePlannerStore()

const historyList = ref<any[]>([])
const isLoading = ref(true)

// 页面挂载时拉取数据
onMounted(async () => {
  try {
    const data: any = await getTripHistoryAPI()
    historyList.value = data
  } catch (error) {
    ElMessage.error('获取历史记录失败')
  } finally {
    isLoading.value = false
  }
})

// 点击查看详情，将数据载入 Store 并跳转到结果页
const viewTrip = (planData: any) => {
  plannerStore.loadHistoryTrip(planData)
  router.push('/result')
}

const goToPlanner = () => {
  router.push('/planner')
}
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.main-title {
  font-size: 2.5rem;
  color: #303133;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #909399;
  margin-bottom: 20px;
}

.new-btn {
  border-radius: 20px;
  padding: 12px 30px;
}

.skeleton-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.history-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.card-col {
  margin-bottom: 20px;
}

.trip-card {
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
}

.trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.destination-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.destination-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #303133;
}

.theme-text {
  color: #606266;
  font-size: 0.95rem;
  margin-bottom: 20px;
  flex-grow: 1; /* 把底部信息推到最下面 */
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.date {
  font-size: 0.85rem;
  color: #a8abb2;
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>