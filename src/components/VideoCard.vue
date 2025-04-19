<template>
  <div class="video-card">
    <div class="relative cursor-pointer" @click="goToVideo">
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
    <div class="mt-2">
      <div class="text-sm font-medium line-clamp-2">{{ video.title }}</div>
      <div class="flex items-center mt-1 text-xs text-gray-500">
        <div v-if="video.user" class="flex items-center mr-2 truncate">
          <img
            :src="video.user.avatar || '/src/assets/avatar-default.png'"
            class="w-4 h-4 rounded-full mr-1"
            alt="用户头像"
          />
          <span class="truncate">{{ video.user.username }}</span>
        </div>
      </div>
      <div class="flex justify-between items-center mt-1 text-xs text-gray-500">
        <span>{{ video.views }}次观看</span>
        <span v-if="timestamp">{{ formatDate(timestamp) }}</span>
        <span v-else>{{ formatDate(video.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps({
  video: {
    type: Object,
    required: true
  },
  timestamp: {
    type: String,
    default: ''
  }
})

const router = useRouter()

const goToVideo = () => {
  router.push(`/video?id=${props.video.id}`)
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