<template>
  <div class="bg-[#f5f5f5] py-4 ">
    <div>
      <!-- 标题部分 -->
      <div class="flex items-center mb-4">
        <h2 class="text-xl font-bold mr-6">热门视频推荐</h2>
        <div class="text-green-500 border-b-2 border-green-500 pb-1">最新热门推荐</div>
      </div>
      
      <!-- 热门视频列表 -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else class="grid grid-cols-5 gap-4">
        <div v-for="video in videos" :key="video.id" class="video-item">
          <VideoCard :video="formatVideoData(video)" />
        </div>
      </div>
      
      <!-- 第二行视频 -->
      <div class="mt-8">
        <div class="flex items-center mb-4">
          <h2 class="text-xl font-bold mr-6">最新上传</h2>
          <div class="text-green-500 border-b-2 border-green-500 pb-1">查看更多</div>
        </div>
        
        <div v-if="isLoadingRecent" class="flex justify-center py-8">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else class="grid grid-cols-5 gap-4">
          <div v-for="video in recentVideos" :key="video.id" class="video-item">
            <VideoCard :video="formatVideoData(video)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { videoApi } from '../../services/api'
import VideoCard from './videoCard.vue'
import { ElMessage } from 'element-plus'

const videos = ref([])
const recentVideos = ref([])
const isLoading = ref(true)
const isLoadingRecent = ref(true)

// 格式化后端返回的视频数据为前端组件需要的格式
const formatVideoData = (video) => {
  return {
    id: video.id,
    title: video.title,
    cover: video.cover,
    duration: video.duration || '00:00',
    author: video.user?.username || '未知作者',
    views: video.views.toString(),
    uploadTime: formatUploadTime(video.createdAt),
    isPremium: video.isPremium,
    status: video.status,
    hasWisdomCourse: video.hasWisdomCourse,
    teacher: video.teacher || '未知教师'
  }
}

// 格式化上传时间
const formatUploadTime = (dateString) => {
  const now = new Date()
  const uploadDate = new Date(dateString)
  const diffInMs = now.getTime() - uploadDate.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes}分钟前`
    }
    return `${diffInHours}小时前`
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)}周前`
  } else {
    return `${Math.floor(diffInDays / 30)}月前`
  }
}

// 获取热门视频
const fetchPopularVideos = async () => {
  try {
    isLoading.value = true
    const response = await videoApi.getPopularVideos()
    videos.value = response
  } catch (error) {
    console.error('获取热门视频失败:', error)
    ElMessage.error('获取热门视频失败，请稍后再试')
    videos.value = []
  } finally {
    isLoading.value = false
  }
}

// 获取最新视频
const fetchRecentVideos = async () => {
  try {
    isLoadingRecent.value = true
    const response = await videoApi.getRecentVideos()
    recentVideos.value = response
  } catch (error) {
    console.error('获取最新视频失败:', error)
    ElMessage.error('获取最新视频失败，请稍后再试')
    recentVideos.value = []
  } finally {
    isLoadingRecent.value = false
  }
}

onMounted(() => {
  fetchPopularVideos()
  fetchRecentVideos()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .grid-cols-5 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .grid-cols-5 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-cols-5 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .grid-cols-5 {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style> 