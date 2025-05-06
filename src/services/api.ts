import axios from 'axios'

// 假设API_BASE_URL已经在文件顶部定义，如果没有，添加此定义
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 服务器返回了错误状态码
      if (error.response.status === 401) {
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 如果在非登录页面，可以考虑跳转到登录页
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } else if (error.response.status === 403) {
        // 权限不足
        console.error('权限不足');
      } else if (error.response.status === 404) {
        // 资源不存在
        console.error('请求的资源不存在');
      } else if (error.response.status === 500) {
        // 服务器内部错误
        console.error('服务器内部错误');
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      console.error('无法连接到服务器，请检查网络连接');
    } else {
      // 请求设置有误
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
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
  
  // 创建视频
  createVideo(videoData: {
    title: string;
    description?: string;
    cover: string;
    videoUrl: string;
    duration?: string;
    isPremium?: boolean;
    hasWisdomCourse?: boolean;
    teacher?: string;
  }) {
    console.log(videoData);
    
    return api.post('/videos', videoData)
  },
  
  // 更新视频信息
  updateVideo(id: number, videoData: {
    title?: string;
    description?: string;
    cover?: string;
    videoUrl?: string;
    duration?: string;
    isPremium?: boolean;
    hasWisdomCourse?: boolean;
    teacher?: string;
  }) {
    return api.put(`/videos/${id}`, videoData)
  },
  
  // 删除视频
  deleteVideo(id: number) {
    return api.delete(`/videos/${id}`)
  }
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

// 上传封面图片API
export const uploadApi = {
  // 上传封面图片
  uploadCover: async (file: File, token: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/uploads/cover`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('上传封面失败');
      }

      const data = await response.json();
      return data.url; // 返回图片的存储路径
    } catch (error) {
      console.error('上传封面失败:', error);
      throw error;
    }
  },

  // 上传头像
  uploadAvatar: async (file: File, token: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/uploads/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('上传头像失败');
      }

      const data = await response.json();
      return data.url; // 返回图片的存储路径
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    }
  },

  // 上传视频文件
  uploadVideo: async (file: File, token: string, onProgress?: (percent: number) => void): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 使用XMLHttpRequest来支持上传进度
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // 监听上传进度
        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.open('POST', `${API_BASE_URL}/uploads/video`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.path);
          } else {
            reject(new Error('上传视频失败'));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('网络错误'));
        };
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error('上传视频失败:', error);
      throw error;
    }
  }
};

export const chatApi = {
  // 获取会话列表
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response;
  },

  // 获取与指定用户的聊天历史
  getMessageHistory: async (userId: number, page = 1, limit = 20) => {
    const response = await api.get(`/chat/messages/${userId}`, {
      params: { page, limit }
    });
    return response;
  },

  // 发送消息
  sendMessage: async (receiverId: number, content: string) => {
    const response = await api.post('/chat/messages', { receiverId, content });
    return response;
  },

  // 获取未读消息数量
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread-count');
    return response;
  },
  
  // 获取用户资料
  getUserProfile: async (userId: number) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response;
  }
};

export default api
