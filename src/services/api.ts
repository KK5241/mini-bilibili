import axios from 'axios'

// 假设API_BASE_URL已经在文件顶部定义，如果没有，添加此定义
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
    // 直接返回响应数据
    return response.data
  },
  (error) => {
    if (error.response) {
      // 服务器返回了错误状态码
      if (error.response.status === 401) {
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // 如果在非登录页面，可以考虑跳转到登录页
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/'
        }
      } else if (error.response.status === 403) {
        // 权限不足
        console.error('权限不足')
      } else if (error.response.status === 404) {
        // 资源不存在
        console.error('请求的资源不存在')
      } else if (error.response.status === 500) {
        // 服务器内部错误
        console.error('服务器内部错误')
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      console.error('无法连接到服务器，请检查网络连接')
    } else {
      // 请求设置有误
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  },
)

// 类型定义
interface ChatMessage {
  id: number
  senderId: number
  receiverId: number
  content: string
  createdAt: string
  isRead: boolean
}

interface ChatResponse {
  messages: ChatMessage[]
  hasMore: boolean
}

interface VideoResponse {
  id: number
  title: string
  description?: string
  cover: string
  videoUrl: string
  duration?: string
  views: number
  likes: number
  favorites: number
  shares: number
  createdAt: string
  updatedAt: string
  userId: number
  status: 'pending' | 'approved' | 'rejected'
  user?: {
    id: number
    username: string
    avatar?: string
  }
}

interface UserProfile {
  id: number
  username: string
  avatar?: string
  bio?: string
  followingCount: number
  followersCount: number
  likeCount: number
}

// 管理员相关API
export const adminApi = {
  // 获取所有用户
  getAllUsers() {
    return api.get('/admin/users')
  },

  // 创建用户
  createUser(userData: any) {
    return api.post('/admin/users', userData)
  },

  // 删除用户
  deleteUser(userId: number) {
    return api.delete(`/admin/users/${userId}`)
  },

  // 获取待审核视频
  getPendingVideos() {
    return api.get('/admin/videos/pending')
  },

  // 审核视频
  reviewVideo(
    videoId: number,
    status: 'approved' | 'rejected',
    reason?: string,
  ) {
    return api.post(`/admin/videos/${videoId}/review`, {
      status,
      reason,
    })
  },

  // 获取所有视频
  getAllVideos() {
    return api.get('/videos')
  },

  // 删除视频
  deleteVideo(videoId: number) {
    return api.delete(`/admin/videos/${videoId}`)
  },
}

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
  getUserProfile(userId: number): Promise<UserProfile> {
    return api.get(`/users/${userId}/profile`)
  },

  // 更新用户信息
  updateProfile(data: any, id: number) {
    return api.put(`/users/${id}/profile`, data)
  },

  // 更新密码
  updatePassword(currentPassword: string, newPassword: string) {
    return api.put(`/users/password`, { currentPassword, newPassword })
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
  getUserVideos(userId: number): Promise<VideoResponse[]> {
    return api.get(`/users/${userId}/videos`)
  },

  // 获取用户收藏的视频
  getUserFavorites(userId: number): Promise<VideoResponse[]> {
    return api.get(`/users/${userId}/favorites`)
  },

  // 获取用户观看历史
  getViewHistory(userId: number) {
    return api.get(`/users/${userId}/history`)
  },

  // 获取用户观看视频的分类统计
  getCategoryStats(userId: number) {
    return api.get(`/users/${userId}/category-stats`)
  },

  // 标记消息为已读
  markMessagesAsRead(senderId: number) {
    return api.post(`/chat/messages/read/${senderId}`)
  },

  // 获取用户学习统计
  getLearningStats(userId: number) {
    return api.get(`/users/${userId}/learning-stats`)
  },

  // 获取用户观看时长统计
  getWatchTimeStats(userId: number, period: 'day' | 'week' | 'month' | 'year') {
    return api.get(`/users/${userId}/watch-time-stats`, {
      params: { period },
    })
  },

  // 获取用户每日学习记录
  getDailyLearningRecords(userId: number, startDate: string, endDate: string) {
    return api.get(`/users/${userId}/daily-learning`, {
      params: { startDate, endDate },
    })
  },
}

// 视频相关API
export const videoApi = {
  // 获取所有视频
  getAllVideos(): Promise<VideoResponse[]> {
    return api.get('/videos')
  },

  // 获取热门视频
  getPopularVideos(): Promise<VideoResponse[]> {
    return api.get('/videos/popular')
  },

  // 获取最新视频
  getRecentVideos(): Promise<VideoResponse[]> {
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
    return api.get('/videos/search', {
      params: {
        q: query,
        sort,
        limit,
      },
    })
  },

  // 获取视频详情
  getVideoDetail(id: number): Promise<VideoResponse> {
    return api.get(`/videos/${id}`)
  },

  // 添加观看记录
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

  // 创建视频
  createVideo(videoData: {
    title: string
    description?: string
    cover: string
    videoUrl: string
    duration?: string
    isPremium?: boolean
    hasWisdomCourse?: boolean
    teacher?: string
  }) {
    return api.post('/videos', videoData)
  },

  // 更新视频信息
  updateVideo(
    id: number,
    videoData: {
      title?: string
      description?: string
      cover?: string
      videoUrl?: string
      duration?: string
      isPremium?: boolean
      hasWisdomCourse?: boolean
      teacher?: string
    },
  ) {
    return api.put(`/videos/${id}`, videoData)
  },

  // 删除视频
  deleteVideo(id: number) {
    return api.delete(`/videos/${id}`)
  },
}

// 聊天相关API
export const chatApi = {
  // 获取会话列表
  getConversations(): Promise<ChatMessage[]> {
    return api.get('/chat/conversations')
  },

  // 获取与指定用户的聊天历史
  getMessageHistory(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<ChatResponse> {
    return api.get(`/chat/messages/${userId}`, {
      params: { page, limit },
    })
  },

  // 发送消息
  sendMessage(receiverId: number, content: string): Promise<ChatMessage> {
    return api.post('/chat/messages', { receiverId, content })
  },

  // 获取未读消息数量
  getUnreadCount(): Promise<number> {
    return api.get('/chat/unread-count')
  },

  // 标记消息为已读
  markAsRead(senderId: number) {
    return api.post(`/chat/messages/read/${senderId}`)
  },

  // 获取最近的聊天用户列表
  getRecentChats() {
    return api.get('/chat/recent')
  },

  // 删除聊天记录
  deleteMessages(userId: number) {
    return api.delete(`/chat/messages/${userId}`)
  },

  // 获取与用户的未读消息数
  getUnreadCountWithUser(userId: number) {
    return api.get(`/chat/unread-count/${userId}`)
  },
}

// 上传相关API
export const uploadApi = {
  // 上传封面图片
  uploadCover: async (file: File, token: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/uploads/cover`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('上传封面失败')
    }

    const data = await response.json()
    return data.url
  },

  // 上传头像
  uploadAvatar: async (file: File, token: string): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/uploads/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('上传头像失败')
    }

    const data = await response.json()
    return data.url
  },

  // 上传视频文件
  uploadVideo: async (
    file: File,
    token: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            onProgress(percent)
          }
        }
      }

      xhr.open('POST', `${API_BASE_URL}/uploads/video`, true)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText)
          resolve(data.path)
        } else {
          reject(new Error('上传视频失败'))
        }
      }

      xhr.onerror = () => {
        reject(new Error('网络错误'))
      }

      xhr.send(formData)
    })
  },
}

// WebSocket服务
export const socketService = {
  socket: null as WebSocket | null,
  messageHandlers: new Set<(message: any) => void>(),

  init() {
    if (this.socket?.readyState === WebSocket.OPEN) return

    const token = localStorage.getItem('token')
    if (!token) return

    const wsUrl = `ws://localhost:3000/ws?token=${token}`
    this.socket = new WebSocket(wsUrl)

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.messageHandlers.forEach((handler) => handler(message))
    }

    this.socket.onclose = () => {
      console.log('WebSocket连接已关闭')
      // 可以在这里添加重连逻辑
      setTimeout(() => this.init(), 3000)
    }
  },

  onNewMessage(handler: (message: any) => void) {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  },

  markAsRead(userId: number) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'markAsRead',
          data: { userId },
        }),
      )
    }
  },

  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'message',
          data: message,
        }),
      )
    }
  },

  close() {
    this.socket?.close()
    this.socket = null
    this.messageHandlers.clear()
  },
}

// 评论相关API
export const commentApi = {
  // 获取视频评论列表
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

  // 取消点赞评论
  unlikeComment(commentId: number) {
    return api.post(`/comments/${commentId}/unlike`)
  },

  // 获取评论的回复列表
  getReplies(commentId: number) {
    return api.get(`/comments/${commentId}/replies`)
  },

  // 获取用户发表的所有评论
  getUserComments(userId: number) {
    return api.get(`/comments/user/${userId}`)
  },

  // 获取评论详情
  getCommentDetail(commentId: number) {
    return api.get(`/comments/${commentId}`)
  },

  // 举报评论
  reportComment(commentId: number, reason: string) {
    return api.post(`/comments/${commentId}/report`, {
      reason,
    })
  },

  // 获取热门评论
  getHotComments(videoId: number) {
    return api.get(`/comments/video/${videoId}/hot`)
  },

  // 置顶评论（管理员或视频作者）
  pinComment(commentId: number) {
    return api.post(`/comments/${commentId}/pin`)
  },

  // 取消置顶评论
  unpinComment(commentId: number) {
    return api.post(`/comments/${commentId}/unpin`)
  },
}
