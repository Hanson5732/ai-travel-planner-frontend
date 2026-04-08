<template>
  <div class="post-detail-container">
    <el-skeleton :loading="loadingPost" animated :count="1">
      <template #template>
        <div class="skeleton-layout">
          <el-skeleton-item variant="p" style="width: 30%" />
          <el-skeleton-item variant="h1" style="width: 80%; margin-top: 20px;" />
          <el-skeleton-item variant="image" style="height: 400px; margin-top: 30px;" />
          <el-skeleton-item variant="text" style="margin-top: 30px;" />
          <el-skeleton-item variant="text" style="margin-top: 10px;" />
          <el-skeleton-item variant="text" style="margin-top: 10px; width: 60%;" />
        </div>
      </template>

      <template #default>
        <div v-if="post" class="post-layout">
          <header class="post-header">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/community' }">旅行社区</el-breadcrumb-item>
              <el-breadcrumb-item>帖子详情</el-breadcrumb-item>
            </el-breadcrumb>
            
            <h1 class="post-title">{{ post.title }}</h1>
            
            <div class="author-bar">
              <div class="author-info">
                <el-avatar :size="40"> {{ post.author.username.charAt(0).toUpperCase() }} </el-avatar>
                <div class="name-date">
                  <span class="username">{{ post.author.username }}</span>
                  <span class="date">发布于 {{ formatDate(post.created_at) }}</span>
                </div>
              </div>
              <div class="actions">
                <el-button 
                  :type="isLiked ? 'danger' : 'default'" 
                  icon="Heart" 
                  round 
                  @click="handleLike"
                  :loading="loadingLike"
                >
                  {{ isLiked ? '已点赞' : '点赞' }} ({{ post.like_count }})
                </el-button>
              </div>
            </div>
          </header>

          <section class="media-section" v-if="post.media_urls && post.media_urls?.length > 0">
            <el-carousel trigger="click" height="500px" :autoplay="false" ref="carouselRef">
              <el-carousel-item v-for="(url, index) in post.media_urls" :key="index">
                <video 
                  v-if="url.toLowerCase().endsWith('.mp4')" 
                  :src="`http://localhost:8000${url}`" 
                  controls 
                  class="carousel-media"
                />
                <el-image 
                  v-else
                  :src="`http://localhost:8000${url}`" 
                  fit="contain" 
                  class="carousel-media"
                  :preview-src-list="fullMediaUrls"
                  :initial-index="index"
                />
              </el-carousel-item>
            </el-carousel>
          </section>

          <article class="post-content">
            <p v-for="(paragraph, index) in contentParagraphs" :key="index">
              {{ paragraph }}
            </p>
          </article>

          <section class="trip-section" v-if="post.trip_id">
            <el-divider content-position="left">
              <el-icon><MapLocation /></el-icon> 关联的 AI 旅行规划
            </el-divider>
            
            <el-skeleton :loading="loadingTrip" animated :count="1">
              <template #template>
                <el-skeleton-item variant="rect" style="height: 150px;" />
              </template>
              <template #default>
                <div v-if="tripData" class="trip-display">
                  <TravelCard :trip="tripData" />
                  
                  <div class="timeline-wrapper" v-if="tripSchedule?.length > 0">
                    <DayTimeline :schedule="tripSchedule" />
                  </div>
                </div>
              </template>
            </el-skeleton>
          </section>

          <section class="comment-section">
            <el-divider content-position="left">
              <el-icon><ChatDotRound /></el-icon> 评论交流 ({{ post.comment_count }})
            </el-divider>

            <div class="comment-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar :size="36"> {{ comment.author.username.charAt(0).toUpperCase() }} </el-avatar>
                <div class="comment-content-wrap">
                  <div class="comment-meta">
                    <span class="comment-author">{{ comment.author.username }}</span>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <el-image 
                    v-if="comment.image_url"
                    :src="`http://localhost:8000${comment.image_url}`"
                    fit="cover"
                    class="comment-image"
                    :preview-src-list="[`http://localhost:8000${comment.image_url}`]"
                  />
                </div>
              </div>
              
              <el-empty v-if="comments?.length === 0" description="暂无评论，快来抢沙发！" />
            </div>

            <div class="comment-form">
              <el-avatar :size="40"> {{ authStore.username?.charAt(0).toUpperCase() || '?' }} </el-avatar>
              <el-form :model="commentForm" class="form-box">
                <el-form-item>
                  <el-input 
                    v-model="commentForm.content" 
                    type="textarea" 
                    :rows="3" 
                    placeholder="说点什么吧..." 
                    resize="none"
                  />
                </el-form-item>
                
                <div class="form-actions">
                  <el-upload
                    action="#"
                    list-type="picture"
                    :http-request="customUploadCommentImage"
                    :on-remove="handleRemoveCommentImage"
                    :limit="1"
                    :file-list="commentFileList"
                    accept="image/*"
                  >
                    <el-button icon="Picture" size="small">添加图片</el-button>
                  </el-upload>
                  
                  <el-button type="primary" :loading="submittingComment" @click="submitComment">
                    发表评论
                  </el-button>
                </div>
              </el-form>
            </div>
          </section>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPostDetailAPI, toggleLikeAPI, getCommentsAPI, createCommentAPI, uploadMediaAPI } from '../api/community'
import DayTimeline from '../components/DayTimeline.vue'
import TravelCard from '../components/TravelCard.vue'
import { getTripDetailAPI } from '../api/planner'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const postId = computed(() => Number(route.params.id))
const post = ref<any>(null)
const loadingPost = ref(true)

// 点赞相关状态
const isLiked = ref(false)
const loadingLike = ref(false)

// 行程加载相关状态
const tripData = ref<any>(null)
const tripSchedule = ref<any[]>([])
const loadingTrip = ref(false)

// 评论相关状态
const comments = ref<any[]>([])
const commentForm = reactive({
  content: '',
  image_url: ''
})
const commentFileList = ref<any[]>([]) // 用于 el-upload 显示
const submittingComment = ref(false)

// 计算属性：将媒体URL拼接完整，用于 Carousel 内部点击预览
const fullMediaUrls = computed(() => {
  if (!post.value || !post.value.media_urls) return []
  return post.value.media_urls.map((url: string) => `http://localhost:8000${url}`)
})

// 计算属性：将帖子正文按换行符拆分为段落数组
const contentParagraphs = computed(() => {
  if (!post.value || !post.value.content) return []
  return post.value.content.split('\n').filter((p: string) => p.trim() !== '')
})

// 初始化获取数据：确保先有 postId
onMounted(async () => {
  if (!postId.value) {
    ElMessage.error('帖子ID无效')
    router.push('/community')
    return
  }
  
  await fetchPostDetail()
  await fetchComments()
})

// 1. 获取帖子详情主逻辑
const fetchPostDetail = async () => {
  try {
    loadingPost.value = true
    const res = await getPostDetailAPI(postId.value)
    // 注意 Axios 返回需要 .data
    post.value = res as any
    
    // 初始化点赞状态（后端需返回 liked 字段表明当前用户是否已赞，如果没有则默认 false）
    isLiked.value = post.value.liked || false 

    // 🌟 2. 核心逻辑：如果帖子关联了行程，则异步拉取具体的行程日程详情
    if (post.value.trip_id) {
      await fetchTripDetail(post.value.trip_id)
    }
  } catch (error) {
    ElMessage.error('获取帖子详情失败')
    router.push('/community')
  } finally {
    loadingPost.value = false
  }
}

// 🌟 3. 异步获取关联行程详情的逻辑
const fetchTripDetail = async (tripId: string) => {
  try {
    loadingTrip.value = true
    
    // 🌟 修复关键：加上 : any，告诉 TS 放弃对 res 的类型检查
    let res: any = await getTripDetailAPI(tripId)
    
    // 如果是字符串，先解析为 JSON 对象
    if (typeof res === 'string') {
      try { res = JSON.parse(res) } catch (e) {}
    }

    tripData.value = {
      ...res, 
      title: `${res.destination || '未知'}旅行规划`,
      days: res.total_days || res.daily_plans?.length || 0,
      total_days: res.total_days || 0,
      budget: res.budget || '未设置',
      created_at: post.value?.created_at || new Date().toISOString(),
    }
    
    // 提取时间轴需要的纯数组
    tripSchedule.value = res.daily_plans || res.schedule || [] 
    
  } catch (error) {
    console.error('获取关联行程失败:', error)
    ElMessage.warning('未能加载关联的行程规划')
  } finally {
    loadingTrip.value = false
  }
}
// 4. 获取评论列表
const fetchComments = async () => {
  try {
    const res = await getCommentsAPI(postId.value, 0, 100) // 默认拉取前100条
    comments.value = res as any
  } catch (error) {
    ElMessage.error('获取评论列表失败')
  }
}

// 处理点赞操作
const handleLike = async () => {
  if (!authStore.isAuthenticated) {
    ElMessageBox.confirm('您必须先登录才能点赞。是否前往登录界面？', '需要登录', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/login')
    })
    return
  }

  try {
    loadingLike.value = true
    const res = await toggleLikeAPI(postId.value)
    // 更新本地状态和计数
    isLiked.value = res.data.liked
    post.value.like_count = res.data.like_count
    ElMessage({
      type: isLiked.value ? 'success' : 'info',
      message: res.data.message
    })
  } catch (error) {
    ElMessage.error('点赞操作失败')
  } finally {
    loadingLike.value = false
  }
}

// 💡 评论区文件自定义上传逻辑
const customUploadCommentImage = async (options: any) => {
  try {
    const formData = new FormData()
    formData.append('file', options.file)
    const res = await uploadMediaAPI(formData)
    // 保存返回的纯 URL 路径
    commentForm.image_url = res.data.url
    // 必须调用 onSuccess 移除 loading
    options.onSuccess(res.data)
  } catch (error) {
    options.onError(error)
    ElMessage.error('上传图片失败')
  }
}

// 移除评论附带的图片
const handleRemoveCommentImage = () => {
  commentForm.image_url = ''
  commentFileList.value = []
}

// 提交评论
const submitComment = async () => {
  if (!authStore.isAuthenticated) {
    ElMessageBox.confirm('您必须先登录才能发表评论。是否前往登录界面？', '需要登录', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/login')
    })
    return
  }

  if (!commentForm.content.trim()) {
    ElMessage.warning('评论内容不能为空哦')
    return
  }

  try {
    submittingComment.value = true
    await createCommentAPI(postId.value, commentForm)
    ElMessage.success('评论成功')
    
    // 🌟 重置表单
    commentForm.content = ''
    commentForm.image_url = ''
    commentFileList.value = []
    
    // 🌟 关键：重新拉取评论列表
    await fetchComments() 
    
    // 增加计数显示
    if (post.value) post.value.comment_count++
  } catch (error) {
    console.error("评论失败:", error)
  } finally {
    submittingComment.value = false
  }
}

// 格式化日期工具函数
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  })
}
</script>

<style scoped>
.post-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 50px;
}

.skeleton-layout {
  padding: 20px;
}

.post-layout {
  background-color: #fff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.post-header {
  margin-bottom: 30px;
}

.post-title {
  font-size: 2.2rem;
  color: var(--el-text-color-primary);
  margin: 20px 0;
  font-weight: 700;
  line-height: 1.3;
}

.author-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.name-date {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.date {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
}

.actions {
  display: flex;
  gap: 10px;
}

.media-section {
  margin-bottom: 40px;
  background-color: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
}

.carousel-media {
  width: 100%;
  height: 100%;
  display: block;
}

/* 覆盖 el-carousel 样式，让指示器更好看 */
:deep(.el-carousel__indicators--horizontal) {
  bottom: 20px;
}

.post-content {
  font-size: 1.1rem;
  color: #303133;
  line-height: 1.8;
  margin-bottom: 50px;
}

.post-content p {
  margin-bottom: 1.5em; /* 增加段落呼吸间距 */
}

/* 🌟 行程区域样式 */
.trip-section {
  margin-bottom: 50px;
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 12px;
}

.trip-display {
  margin-top: 20px;
}

.timeline-wrapper {
  margin-top: 25px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

/* 自定义 el-divider 样式 */
:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--el-color-primary);
}

/* 评论区样式 */
.comment-section {
  margin-top: 50px;
}

.comment-list {
  margin-bottom: 40px;
}

.comment-item {
  display: flex;
  gap: 15px;
  padding: 20px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.comment-content-wrap {
  flex: 1;
}

.comment-meta {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-author {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.comment-date {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
}

.comment-text {
  margin: 0;
  font-size: 0.95rem;
  color: #303133;
  line-height: 1.6;
}

.comment-image {
  margin-top: 10px;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  cursor: zoom-in;
}

.comment-form {
  display: flex;
  gap: 15px;
  padding-top: 20px;
}

.form-box {
  flex: 1;
}

.form-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 覆盖el-upload列表样式，让图片紧凑点 */
:deep(.el-upload-list--picture) {
  margin-top: 0;
  max-width: 200px;
}
:deep(.el-upload-list__item) {
  margin-bottom: 0;
  padding: 5px;
  height: 50px;
}
:deep(.el-upload-list__item-thumbnail) {
  width: 40px;
  height: 40px;
}
</style>