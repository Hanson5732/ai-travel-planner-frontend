// src/api/planner.ts
import request from '../utils/request'

/**
 * 提交旅行参数，生成全新行程
 * @param data 包含目的地、天数、预算等信息的请求体
 */
export const generateTripAPI = (data: any) => {
  return request.post('/planner/generate', data)
}

/**
 * 重新生成某一天的行程
 * @param tripId 行程唯一 ID
 * @param day 需要重新生成的天数
 */
export const regenerateDayAPI = (tripId: string, day: number) => {
  return request.post('/planner/regenerate_day', { trip_id: tripId, day: day })
}


/**
 * 智能微调单个活动
 * @param tripId 行程唯一 ID
 * @param day 第几天
 * @param activityIndex 活动在当天的索引
 * @param userPrompt 用户的修改诉求（如：“不想去博物馆，换成吃海鲜”）
 */
export const editActivityAPI = (tripId: string, day: number, activityIndex: number, userPrompt: string) => {
  return request.post('/planner/edit_activity', {
    trip_id: tripId,
    day: day,
    activity_index: activityIndex,
    user_prompt: userPrompt
  })
}


/**
 * 添加新地点/活动
 */
export const addActivityAPI = (tripId: string, day: number, userPrompt: string) => {
  return request.post('/planner/add_activity', {
    trip_id: tripId,
    day: day,
    user_prompt: userPrompt
  })
}


/**
 * 获取用户的历史行程列表
 */
export const getTripHistoryAPI = () => {
  return request.get('/planner/history')
}

// 获取单个行程详情（包含具体的日程 schedule 数据）
export const getTripDetailAPI = (tripId: string) => {
  return request.get(`/planner/trips/${tripId}`)
}