<template>
  <div class="home-container">
    <section class="hero">
      <h1 class="title">用 AI，规划你的下一次完美旅行</h1>
      <p class="subtitle">个性化、智能化、实时调整的旅行体验</p>
      <el-button type="primary" size="large" @click="startPlanning" class="start-btn">
        开 始 规 划
      </el-button>
    </section>

    <section class="features">
      <el-row :gutter="20" justify="center" class="features-row">
        <el-col 
          :xs="24" :sm="12" :md="12" :lg="6" 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-col"
        >
          <el-card class="feature-card" shadow="hover">
            <div class="icon-wrapper">
              <el-icon size="36"><component :is="feature.icon" /></el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { MagicStick, Setting, Refresh, MapLocation } from '@element-plus/icons-vue'

const router = useRouter()

const features = [
  { icon: MagicStick, title: 'AI 智能生成', desc: '基于大模型，秒级生成您的专属行程' },
  { icon: Setting, title: '个性化偏好', desc: '预算、节奏、兴趣...一切完全由你掌控' },
  { icon: Refresh, title: '动态修改', desc: '行程中随时调整单日计划，无缝衔接不扫兴' },
  { icon: MapLocation, title: '实时优化', desc: '智能重算路线，告别绕路烦恼，节省每一分钟' }
]

const startPlanning = () => {
  router.push('/planner')
}
</script>

<style scoped>
/* 4. 解决背景单一问题：增加清新的天空淡蓝渐变背景，铺满全屏 */
.home-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #d9ecff 100%);
  box-sizing: border-box;
}

.hero {
  text-align: center;
  margin-top: -50px; /* 稍微向上提一点，视觉居中更好 */
  margin-bottom: 60px;
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 30px; /* 2. 增加主副标题之间的留白 */
  letter-spacing: 2px;
}

.subtitle {
  font-size: 1.6rem;
  color: #606266;
  margin-top: 50px;
  margin-bottom: 50px; /* 2. 增加副标题与按钮之间的留白 */
  font-weight: 300;
}

.start-btn {
  font-size: 1.25rem;
  padding: 20px 50px;
  border-radius: 30px; /* 圆角按钮更显亲和力 */
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(64, 158, 255, 0.4);
}

.features {
  width: 100%;
  max-width: 1200px;
}

/* 3. 解决框大小不一问题：让 row 里面的 col 等高铺满 */
.features-row {
  align-items: stretch; 
}

.feature-col {
  margin-bottom: 20px; /* 响应式换行时，上下卡片保持间距 */
  display: flex;
}

/* 3. 卡片内部使用 Flex 布局，让内容区自动撑开 */
.feature-card {
  width: 100%;
  text-align: center;
  padding: 30px 20px;
  border-radius: 16px;
  border: none;
  background-color: rgba(255, 255, 255, 0.7); /* 半透明质感 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.icon-wrapper {
  margin-bottom: 20px;
  color: #409EFF;
  background: #ecf5ff;
  width: 70px;
  height: 70px;
  line-height: 80px; /* 垂直居中图标 */
  border-radius: 50%;
  margin-left: auto;
  margin-right: auto;
}

.feature-card h3 {
  margin-top: 0;
  color: #303133;
  font-size: 1.3rem;
}

.feature-desc {
  color: #606266;
  line-height: 1.6;
  flex-grow: 1; /* 核心：让描述文字占据剩余空间，把所有卡片撑到等高 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 针对小屏幕(手机)的字体大小微调 */
@media (max-width: 768px) {
  .title {
    font-size: 2.2rem;
  }
  .subtitle {
    font-size: 1.2rem;
  }
}
</style>