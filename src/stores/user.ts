import { defineStore } from 'pinia'
import axios from 'axios'

interface UserState {
  id: number | null
  username: string
  role: string
  token: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: null,
    username: '',
    role: '',
    token: localStorage.getItem('token'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    async login(username: string, password: string) {
      try {
        const response = await axios.post('/api/auth/login', {
          username,
          password,
        })

        const { token, user } = response.data
        this.token = token
        this.id = user.id
        this.username = user.username
        this.role = user.role

        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (error) {
        throw error
      }
    },

    logout() {
      this.token = null
      this.id = null
      this.username = ''
      this.role = ''
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },

    async checkAuth() {
      if (!this.token) return false

      try {
        const response = await axios.get('/api/auth/me')
        const { user } = response.data
        this.id = user.id
        this.username = user.username
        this.role = user.role
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },
  },
}) 