import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  },
)

// 用户相关API
export const userApi = {
  // 登录
  login(username: string, password: string) {
    return api.post('/auth/login', { username, password })
  },

  // 注册
  register(username: string, password: string, avatar?: string, bio?: string) {
    return api.post('/auth/register', { username, password, avatar, bio })
  },

  // 获取用户信息
  getUserInfo(userId: number) {
    return api.get(`/users/${userId}`)
  },

  // 获取用户详细资料（含关注数、粉丝数等）
  getUserProfile(userId: number) {
    return api.get(`/users/${userId}/profile`)
  },

  // 更新用户信息
  updateProfile(data: any) {
    return api.put(`/users/profile`, data)
  },

  // 关注用户
  followUser(followId: number) {
    return api.post(`/users/follow/${followId}`)
  },

  // 取消关注
  unfollowUser(followId: number) {
    return api.post(`/users/unfollow/${followId}`)
  },

  // 获取关注列表
  getFollowing(userId: number) {
    return api.get(`/users/${userId}/following`)
  },

  // 获取粉丝列表
  getFollowers(userId: number) {
    return api.get(`/users/${userId}/followers`)
  },

  // 获取用户发布的视频
  getUserVideos(userId: number) {
    return api.get(`/users/${userId}/videos`)
  },

  // 获取用户收藏的视频
  getUserFavorites(userId: number) {
    return api.get(`/users/${userId}/favorites`)
  },

  // 获取用户观看历史
  getViewHistory(userId: number) {
    return api.get(`/users/${userId}/history`)
  },
}

// 视频相关API
export const videoApi = {
  // 获取所有视频
  getAllVideos() {
    return api.get('/videos')
  },

  // 获取热门视频
  getPopularVideos() {
    return api.get('/videos/popular')
  },

  // 获取最新视频
  getRecentVideos() {
    return api.get('/videos/recent')
  },

  // 获取热搜词
  getHotSearches() {
    return api.get('/videos/hot-searches')
  },

  // 获取搜索建议
  getSearchSuggestions(query: string) {
    return api.get(`/videos/search-suggestions?q=${query}`)
  },

  // 搜索视频
  searchVideos(query: string, sort?: string, limit?: number) {
    let url = `/videos/search?q=${encodeURIComponent(query)}`
    if (sort) url += `&sort=${encodeURIComponent(sort)}`
    if (limit && !isNaN(Number(limit))) url += `&limit=${limit}`
    return api.get(url)
  },

  // 获取视频详情
  getVideoDetail(id: number) {
    return api.get(`/videos/${id}`)
  },

  // 添加浏览量
  addView(id: number) {
    return api.post(`/videos/${id}/view`)
  },

  // 点赞视频
  likeVideo(id: number) {
    return api.post(`/videos/${id}/like`)
  },

  // 收藏视频
  favoriteVideo(id: number) {
    return api.post(`/videos/${id}/favorite`)
  },

  // 分享视频
  shareVideo(id: number) {
    return api.post(`/videos/${id}/share`)
  },

  // 获取用户与视频的互动状态（点赞、收藏、分享）
  getVideoInteraction(id: number) {
    return api.get(`/videos/${id}/interaction`)
  },
}

// 评论相关API
export const commentApi = {
  // 获取视频评论
  getVideoComments(videoId: number) {
    return api.get(`/comments/video/${videoId}`)
  },

  // 发表评论
  createComment(content: string, videoId: number, parentId?: number) {
    return api.post('/comments', {
      content,
      videoId,
      parentId,
    })
  },

  // 删除评论
  deleteComment(commentId: number) {
    return api.delete(`/comments/${commentId}`)
  },

  // 点赞评论
  likeComment(commentId: number) {
    return api.post(`/comments/${commentId}/like`)
  },
}

export default api
