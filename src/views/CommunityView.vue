<template>
  <div class="community-container">
    <div class="header">
      <h2>🌍 旅行发现</h2>
      <el-button type="primary" size="large" @click="goToCreate">
        ✍️ 发布我的旅行
      </el-button>
    </div>

    <el-skeleton :loading="loading" animated :count="6">
      <template #template>
        <div class="skeleton-card">
          <el-skeleton-item variant="image" style="height: 200px" />
          <div style="padding: 14px">
            <el-skeleton-item variant="h3" style="width: 50%" />
            <el-skeleton-item variant="text" style="width: 100%; margin-top: 10px;" />
          </div>
        </div>
      </template>

      <template #default>
        <div v-if="posts.length === 0" class="empty-state">
          <el-empty description="社区空空如也，快来发布第一篇帖子吧！" />
        </div>
        
        <div v-else class="post-grid">
          <el-card 
            v-for="post in posts" 
            :key="post.id" 
            class="post-card" 
            shadow="hover"
            @click="goToDetail(post.id)"
          >
            <div class="media-preview" v-if="post.media_urls && post.media_urls.length > 0">
              <div v-if="post.media_urls.length > 1" class="image-grid">
                <div 
                  v-for="(url, index) in (post.media_urls || []).slice(0, 9)" 
                  :key="index"
                  class="grid-image-item"
                  @click.stop="openViewer(post.media_urls, Number(index))"
                >
                  <el-image 
                    :src="`http://localhost:8000${url}`" 
                    fit="cover"
                    lazy
                  />
                  <div v-if="index === 8 && (post.media_urls?.length || 0) > 9" class="more-mask">
                    +{{ (post.media_urls?.length || 0) - 9 }}
                  </div>
                </div>
              </div>
              <div v-else class="single-media" @click.stop="openViewer(post.media_urls, 0)">
                <el-image 
                  :src="`http://localhost:8000${post.media_urls?.[0]}`" 
                  fit="cover"
                  lazy
                />
              </div>
            </div>
            <div v-else class="no-image-cover">
              📝 纯文本分享
            </div>

            <div class="post-info" @click="goToDetail(post.id)">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-content">{{ post.content }}</p>
              
              <div class="post-footer">
                <div class="author">
                  <el-avatar :size="24"> {{ post.author.username.charAt(0).toUpperCase() }} </el-avatar>
                  <span class="username">{{ post.author.username }}</span>
                </div>
                <div class="stats">
                  <span>❤️ {{ post.like_count }}</span>
                  <span>💬 {{ post.comment_count }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </template>
    </el-skeleton>

    <el-image-viewer
      v-if="showViewer"
      :url-list="viewerUrls"
      :initial-index="initialIndex"
      @close="showViewer = false"
      teleported
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPostsAPI } from '../api/community'
import { ElMessage } from 'element-plus'

const router = useRouter()
const posts = ref<any[]>([])
const loading = ref(true)

// 🌟 新增：图片查看器状态变量
const showViewer = ref(false)
const viewerUrls = ref<string[]>([])
const initialIndex = ref(0)

const fetchPosts = async () => {
  try {
    loading.value = true
    const res = await getPostsAPI(0, 50)
    // 🌟 修复 TS 报错：使用 res.data 获取纯数组数据赋给 posts
    posts.value = res as any
  } catch (error) {
    ElMessage.error('获取社区帖子失败')
  } finally {
    loading.value = false
  }
}

const goToCreate = () => {
  router.push('/community/create')
}

const goToDetail = (id: number) => {
  router.push(`/community/${id}`)
}

// 打开图片查看器的逻辑
const openViewer = (urls: string[] | undefined, index: number) => {
  if (!urls || urls.length === 0) return
  viewerUrls.value = urls.map(url => `http://localhost:8000${url}`)
  initialIndex.value = index
  showViewer.value = true
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.community-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 2rem;
  color: var(--el-text-color-primary);
  margin: 0;
}

/* 帖子卡片瀑布流网格 */
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.post-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

/* 覆盖 el-card 的默认 padding */
:deep(.el-card__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 🌟 修改：媒体预览区域样式 */
.media-preview {
  width: 100%;
}

/* 🌟 多图九宫格布局：使用 Grid */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px; /* 留出一点边距，和 Element Plus 的 Picture-Card 风格统一 */
}

.grid-image-item {
  position: relative;
  /* 🌟 核心：强制保持 1:1 正方形比例 */
  aspect-ratio: 1 / 1; 
  overflow: hidden;
  border-radius: 4px;
  cursor: zoom-in;
}

.grid-image-item .el-image {
  width: 100%;
  height: 100%;
}

/* 更多图片蒙层 */
.more-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
}

/* 单图样式 */
.single-media {
  width: 100%;
  height: 250px;
  cursor: zoom-in;
}

.single-media .el-image {
  width: 100%;
  height: 100%;
}

.no-image-cover {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: #606266;
}

.post-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.post-title {
  margin: 0 0 8px 0;
  font-size: 1.15rem;
  color: #303133;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-content {
  margin: 0;
  font-size: 0.95rem;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  line-clamp: 2; /* 限制显示两行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #909399;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}

.author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 15px;
}

.skeleton-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
</style>