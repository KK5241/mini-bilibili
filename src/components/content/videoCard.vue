<template>
  <div class="video-card bg-white rounded shadow-md overflow-hidden cursor-pointer" @click="goToVideo">
    <div class="relative">
      <img :src="video.cover"  class="w-full h-32 object-cover" />
      <div class="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
        {{ video.duration }}
      </div>
      <div v-if="video.isPremium" class="absolute top-0 left-0 bg-amber-500 text-white text-xs px-2 py-1">
        国家精品
      </div>
    </div>
    <div class="p-3">
      <div class="text-sm font-semibold mb-1 line-clamp-2">{{ video.title }}</div>
      <div class="text-xs text-gray-500 mb-2">{{ video.author }}</div>
      <div class="flex justify-between items-center">
        <div v-if="video.status" class="flex gap-1">
          <button class="bg-blue-500 text-white text-xs px-2 py-1 rounded" @click.stop="certifiedStudy">认证学习</button>
          <button v-if="video.hasWisdomCourse" class="bg-green-500 text-white text-xs px-2 py-1 rounded" @click.stop="wisdomCourse">智慧课程</button>
        </div>
        <div v-else class="text-xs text-gray-400">
          {{ video.progress || '进行至第6周' }}
        </div>
        <div class="text-xs text-gray-400">
          {{ video.views }}人参加
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

// 点击卡片跳转到视频详情页
const goToVideo = () => {
  router.push(`/video?id=${props.video.id}`)
}

// 认证学习按钮点击事件
const certifiedStudy = (event: MouseEvent) => {
  event.stopPropagation() // 阻止事件冒泡
  console.log('认证学习', props.video.title)
  // 可以添加具体的学习逻辑
}

// 智慧课程按钮点击事件
const wisdomCourse = (event: MouseEvent) => {
  event.stopPropagation() // 阻止事件冒泡
  console.log('智慧课程', props.video.title)
  // 可以添加具体的跳转逻辑
}
</script>

<style scoped>
.video-card {
  width: 100%;
  transition: transform 0.2s;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 