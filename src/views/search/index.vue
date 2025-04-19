<template>
  <div class="bg-[#f5f5f5] py-4">
    <div class="container">
      <!-- 搜索结果标题 -->
      <div class="bg-white p-4 rounded-lg mb-4">
        <h1 class="text-xl font-bold">
          <span class="text-blue-500">{{ searchQuery }}</span>
          的搜索结果
        </h1>
        <div class="flex justify-between items-center mt-2">
          <div class="text-sm text-gray-500">找到 {{ searchResults.length }} 个结果</div>
          <div class="flex items-center">
            <span class="text-sm text-gray-500 mr-2">排序：</span>
            <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
              <el-radio-button label="">相关度</el-radio-button>
              <el-radio-button label="latest">最新</el-radio-button>
              <el-radio-button label="popular">最热</el-radio-button>
              <el-radio-button label="likes">最多赞</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>

      <!-- 搜索结果列表 -->
      <div v-if="isLoading" class="bg-white p-4 rounded-lg">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else-if="searchResults.length === 0" class="bg-white p-8 rounded-lg text-center">
        <div class="text-gray-400 text-lg mb-4">暂无搜索结果</div>
        <p class="text-sm text-gray-500">
          尝试使用其他关键词，或者检查关键词拼写是否正确
        </p>
      </div>
      <div v-else class="bg-white p-4 rounded-lg">
        <div v-for="video in searchResults" :key="video.id" class="mb-4 border-b pb-4 last:border-0">
          <div class="flex cursor-pointer" @click="goToVideo(video.id)">
            <div class="relative w-1/5">
              <img
                :src="video.cover"
                alt="视频封面"
                class="w-full aspect-video object-cover rounded"
              />
              <div
                class="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded"
              >
                {{ video.duration || '00:00' }}
              </div>
            </div>
            <div class="w-4/5 pl-4">
              <h3 class="text-lg font-medium mb-2">{{ video.title }}</h3>
              <p class="text-sm text-gray-600 mb-2 line-clamp-2">
                {{ video.description || '暂无简介' }}
              </p>
              <div class="flex items-center text-xs text-gray-500">
                <div class="flex items-center mr-4">
                  <img
                    :src="video.user?.avatar || '/src/assets/avatar-default.png'"
                    class="w-5 h-5 rounded-full mr-1"
                    alt="用户头像"
                  />
                  <span>{{ video.user?.username }}</span>
                </div>
                <div class="mr-4">{{ video.views }}次观看</div>
                <div>{{ formatDate(video.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { videoApi } from '../../services/api'
import { ElMessage } from 'element-plus'

// 定义视频类型接口
interface VideoUser {
  id: number;
  username: string;
  avatar?: string;
}

interface Video {
  id: number;
  title: string;
  description?: string;
  cover: string;
  videoUrl: string;
  duration?: string;
  views: number;
  likes: number;
  favorites: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  user?: VideoUser;
}

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<Video[]>([])
const isLoading = ref(true)
const sortBy = ref('')

// 搜索视频
const searchVideos = async () => {
  if (!searchQuery.value) return

  try {
    isLoading.value = true
    const response = await videoApi.searchVideos(searchQuery.value, sortBy.value)
    searchResults.value = (response || []) as Video[]
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后再试')
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

// 处理排序变化
const handleSortChange = () => {
  searchVideos()
}

// 监听路由查询参数变化
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery as string
      searchVideos()
    }
  },
  { immediate: true }
)

// 跳转到视频详情页
const goToVideo = (id: number) => {
  router.push(`/video?id=${id}`)
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分钟前`
    }
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
