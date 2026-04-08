import request from '../utils/request'

// 1. 上传文件 (图片/视频)
export const uploadMediaAPI = (formData: FormData) => {
  // 注意：上传文件必须传递 FormData 对象，并且 axios 会自动处理 Content-Type: multipart/form-data
  return request.post('/community/upload', formData)
}

// 2. 发布新帖子
export const createPostAPI = (data: { title: string; content: string; trip_id?: string; media_urls: string[] }) => {
  return request.post('/community/posts', data)
}

// 3. 获取帖子列表 (支持分页)
export const getPostsAPI = (skip: number = 0, limit: number = 20) => {
  return request.get('/community/posts', { params: { skip, limit } })
}

// 4. 获取帖子详情 (可选，如果后端有写的话，没写可以前端从列表中获取或后续补上)
export const getPostDetailAPI = (postId: number) => {
  return request.get(`/community/posts/${postId}`)
}

// 5. 点赞 / 取消点赞
export const toggleLikeAPI = (postId: number) => {
  return request.post(`/community/posts/${postId}/like`)
}

// 6. 获取评论列表
export const getCommentsAPI = (postId: number, skip: number = 0, limit: number = 50) => {
  return request.get(`/community/posts/${postId}/comments`, { params: { skip, limit } })
}

// 7. 发表评论
export const createCommentAPI = (postId: number, data: { content: string; image_url?: string }) => {
  return request.post(`/community/posts/${postId}/comments`, data)
}