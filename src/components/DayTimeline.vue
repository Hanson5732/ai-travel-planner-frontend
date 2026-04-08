<template>
  <div class="timeline-container">
    <el-timeline v-if="targetSchedule && targetSchedule.length > 0">
      <el-timeline-item
        v-for="(dayItem, dIndex) in targetSchedule"
        :key="dIndex"
        :timestamp="`第 ${dayItem.day} 天 · ${dayItem.theme}`"
        placement="top"
        type="primary"
        size="large"
      >
        <el-card shadow="never" class="day-detail-card">
          <div v-for="(act, aIndex) in dayItem.activities" :key="aIndex" class="activity-row">
            <div class="act-time">
              <el-tag size="small" effect="plain" type="info">{{ act.time }}</el-tag>
            </div>
            <div class="act-info">
              <div class="act-location">📍 {{ act.location }}</div>
              <div class="act-desc">{{ act.description }}</div>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-else description="暂无详细日程数据" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 🌟 1. 定义严谨的类型接口
interface Activity {
  time: string
  location: string
  description: string
}

interface DayPlan {
  day: number | string
  theme: string
  activities: Activity[]
}

// 🌟 2. 规范 Props 定义
const props = defineProps({
  schedule: { type: Array as () => DayPlan[], default: () => [] },
  plans: { type: Array as () => DayPlan[], default: () => [] },
  data: { type: Array as () => DayPlan[], default: () => [] }
})

// 🌟 3. 计算属性：增加类型断言，彻底消除“未知”报错
const targetSchedule = computed<DayPlan[]>(() => {
  const list = (props.schedule?.length ? props.schedule : 
                props.plans?.length ? props.plans : 
                props.data) as DayPlan[]
  return list || []
})
</script>

<style scoped>
.timeline-container {
  padding: 10px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 1.15rem;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
}

.day-detail-card {
  border-radius: 8px;
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
}

.activity-row {
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}

.activity-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.act-time {
  width: 70px;
  flex-shrink: 0;
  padding-top: 2px;
}

.act-info {
  flex: 1;
}

.act-location {
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  font-size: 1.05rem;
}

.act-desc {
  font-size: 0.95rem;
  color: #606266;
  line-height: 1.6;
}
</style>