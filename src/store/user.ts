import { defineStore } from 'pinia'
import { userApi } from '../services/api'
import { ElMessage } from 'element-plus'
import router from '../router'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || '',
    loading: false,
    preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
    lastLogin: localStorage.getItem('lastLogin') || '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userId: (state) => state.user?.id || null,
    username: (state) => state.user?.username || '',
    avatar: (state) => state.user?.avatar || '',
  },

  actions: {
    async login(username: string, password: string) {
      try {
        this.loading = true
        const response = await userApi.login(username, password)
        this.setAuthData(response)
        ElMessage.success('登录成功')
        this.fetchUserAdditionalInfo()
        return true
      } catch (error: any) {
        console.error('登录失败:', error)
        ElMessage.error(
          error.response?.data?.message || '登录失败，请检查用户名和密码',
        )
        return false
      } finally {
        this.loading = false
      }
    },

    async register(userData: {
      username: string
      password: string
      avatar?: string
      bio?: string
    }) {
      try {
        this.loading = true
        const response = await userApi.register(
          userData.username,
          userData.password,
          userData.avatar,
          userData.bio,
        )
        this.setAuthData(response)
        ElMessage.success('注册成功')
        return true
      } catch (error: any) {
        console.error('注册失败:', error)
        ElMessage.error(error.response?.data?.message || '注册失败，请稍后再试')
        return false
      } finally {
        this.loading = false
      }
    },

    setAuthData(data: any) {
      this.token = data.access_token
      this.user = data.user
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      const now = new Date().toISOString()
      this.lastLogin = now
      localStorage.setItem('lastLogin', now)
      
      if (data.preferences) {
        this.preferences = data.preferences
        localStorage.setItem('userPreferences', JSON.stringify(data.preferences))
      }
    },

    async fetchUserAdditionalInfo() {
      if (!this.isLoggedIn || !this.userId) return
      
      try {
        const response = await userApi.getUserProfile(this.userId)
        const userInfo = response.data
        
        if (userInfo.preferences) {
          this.preferences = userInfo.preferences
          localStorage.setItem('userPreferences', JSON.stringify(userInfo.preferences))
        }
        
        this.updateUserInfo(userInfo)
        
        return userInfo
      } catch (error) {
        console.error('获取用户附加信息失败:', error)
      }
    },

    updateUserInfo(userData: any) {
      this.user = { ...this.user, ...userData }
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    logout() {
      this.user = null
      this.token = ''
      this.preferences = {}
      this.lastLogin = ''
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userPreferences')
      localStorage.removeItem('lastLogin')
      ElMessage.info('已退出登录')
      router.push('/')
    },
  },
})
