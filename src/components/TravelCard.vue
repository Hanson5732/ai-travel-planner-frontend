<template>
  <el-card shadow="hover" class="travel-card">
    <div class="card-content">
      <div class="trip-info">
        <h3 class="destination">🌍 {{ targetData.destination || '神秘之旅' }}</h3>
        <p class="subtitle">AI 智能定制行程规划</p>
      </div>
      <div class="trip-tags">
        <el-tag type="success" effect="dark" round size="large" class="day-tag">
          全程 {{ targetData.total_days || targetData.days || 0 }} 天
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 💡 采用最强兼容性的 Props 接收方式
const props = defineProps({
  trip: { type: Object, default: () => ({}) },
  data: { type: Object, default: () => ({}) }
})

// 计算属性：不论父组件传的是 :trip 还是 :data，都能稳稳接住
const targetData = computed(() => {
  return Object.keys(props.data).length > 0 ? props.data : props.trip
})
</script>

<style scoped>
.travel-card {
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  border: none;
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.destination {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 0.95rem;
}

.day-tag {
  font-size: 1.1rem;
  padding: 0 20px;
}
</style>