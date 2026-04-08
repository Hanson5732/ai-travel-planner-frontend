<template>
  <div class="create-post-container">
    <div class="header">
      <h2>✍️ 分享我的旅行记录</h2>
    </div>

    <el-card shadow="never" class="form-card">
      <el-form :model="postForm" label-position="top" class="post-form">
        <el-form-item label="帖子标题" required>
          <el-input 
            v-model="postForm.title" 
            placeholder="给你的分享起个响亮的名字吧！" 
            maxlength="50" 
            show-word-limit 
            size="large"
          />
        </el-form-item>

        <el-form-item label="游记正文" required>
          <el-input 
            v-model="postForm.content" 
            type="textarea" 
            :rows="8" 
            placeholder="分享一下沿途的风景、好吃的美食，或者踩坑的经历..." 
          />
        </el-form-item>

        <el-form-item label="想关联哪个 AI 行程？（可选）">
          <el-select 
            v-model="postForm.trip_id" 
            placeholder="请选择你要分享的历史行程" 
            clearable 
            size="large"
            style="width: 100%;"
          >
            <el-option 
              v-for="trip in myTrips" 
              :key="trip.trip_id" 
              :label="`🌍 ${trip.destination} (${trip.created_at})`" 
              :value="trip.trip_id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="上传照片/视频">
          <el-upload
            action="#"
            list-type="picture-card"
            :http-request="customUpload"
            :on-remove="handleRemove"
            accept="image/*,video/mp4"
            multiple
          >
            <div class="upload-icon">+ 添加图片</div>
          </el-upload>
          <div class="el-upload__tip">支持 JPG / PNG 以及 MP4 视频，让分享更生动</div>
        </el-form-item>

        <div class="submit-action">
          <el-button @click="router.back()" size="large">取消</el-button>
          <el-button type="primary" size="large" :loading="submitting" @click="submitPost">
            🚀 立即发布
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { uploadMediaAPI, createPostAPI } from '../api/community'
import { getTripHistoryAPI } from '../api/planner'

const router = useRouter()

// 表单数据
const postForm = reactive({
  title: '',
  content: '',
  trip_id: '',
  media_urls: [] as string[]
})

// 用户历史行程列表
const myTrips = ref<any[]>([])
const submitting = ref(false)

// 页面加载时获取历史行程，塞进下拉框里
onMounted(async () => {
  try {
    const res = await getTripHistoryAPI()
    // 注意这里要加 .data 来获取真实数组
    myTrips.value = res.data || res
  } catch (error) {
    ElMessage.error('拉取历史行程失败了')
  }
})

// 💡 核心：自定义文件上传逻辑
const customUpload = async (options: any) => {
  try {
    const formData = new FormData()
    formData.append('file', options.file)

    const res: any = await uploadMediaAPI(formData)
    
    // 🌟 重点：如果你的拦截器返回的是 res.data，那么这里直接用 res.url
    // 如果没有拦截器，用 res.data.url
    const imageUrl = res.url || res.data?.url
    
    postForm.media_urls.push(imageUrl)
    
    // 必须调用这个，el-upload 才会从 "上传中" 变成 "已完成"
    options.onSuccess(res, options.file)
  } catch (error) {
    options.onError(error)
    ElMessage.error('上传失败')
  }
}

// 移除图片时，也要从表单数据中把对应的 URL 删掉
const handleRemove = (uploadFile: any) => {
  // 找到并删除对应的 url
  const targetUrl = uploadFile.response?.url || uploadFile.url
  postForm.media_urls = postForm.media_urls.filter(url => url !== targetUrl)
}

// 提交发布
const submitPost = async () => {
  if (!postForm.title.trim() || !postForm.content.trim()) {
    ElMessage.warning('标题和正文都必须要填哦！')
    return
  }

  try {
    submitting.value = true
    // 如果下拉框被清空，传给后端的 trip_id 设为 undefined，避免传空字符串导致外键报错
    const payload = {
      ...postForm,
      trip_id: postForm.trip_id || undefined
    }

    await createPostAPI(payload)
    
    ElMessage.success('🎉 发布成功！')
    // 发布完直接跳回社区首页
    router.push('/community')
  } catch (error) {
    ElMessage.error('发布失败了，请稍后再试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-post-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.header {
  margin-bottom: 20px;
}

.form-card {
  border-radius: 12px;
}

.upload-icon {
  font-size: 14px;
  color: #8c939d;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.submit-action {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}
</style>