<template>
    <div class="comment-item flex">
      <img
        :src="
          comment.user?.avatar ? getCompleteFileUrl(comment.user.avatar) : '/src/assets/avatar-default.png'
        "
        alt="评论头像"
        class="rounded-full mr-3 cursor-pointer"
        :class="child === 'child' ? 'w-8 h-8' : 'w-10 h-10'"
        @click="goToChat"
      />
      <div class="flex-1">
        <div class="flex items-center text-sm">
          <span class="font-bold text-blue-500 mr-2">{{
            comment.user?.username
          }}</span>
          <span class="text-gray-500 text-xs">{{
            formatDate(comment.createdAt)
          }}</span>
        </div>
        <p class="my-2 text-sm">{{ comment.content }}</p>
        <div class="flex items-center text-xs text-gray-500">
          <button
            class="mr-4 flex items-center hover:text-blue-500"
            @click="likeComment(comment.id)"
          >
            <i class="fas fa-thumbs-up mr-1"></i>
            <span>{{ comment.likes || 0 }}</span>
          </button>
          <button
            class="mr-4 flex items-center hover:text-blue-500"
            @click="replyToComment(comment.id)"
          >
            <i class="fas fa-reply mr-1"></i>
            <span>回复</span>
          </button>
        </div>
      </div>
      <div
        v-if="comment.replayComments && comment.replayComments.length > 0"
      ></div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'

console.log(123);
console.log(5678);

console.log(999);
console.log(888);

// 获取router和用户信息
const router = useRouter()
const userStore = useUserStore()

// 获取完整的文件URL
const getCompleteFileUrl = (filePath: string): string => {
  // 如果是空值则返回空字符串
  if (!filePath) {
    return '';
  }
  
  // 如果已经是完整URL，则直接返回
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // 获取环境变量中的服务器地址，默认为本地开发环境
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  // 如果以uploads开头，意味着是上传路径
  if (filePath.startsWith('/uploads/') || filePath.startsWith('uploads/')) {
    // 规范化路径
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${API_BASE_URL}${normalizedPath}`;
  }
  
  // 其他情况，确保添加uploads前缀
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${API_BASE_URL}/uploads${normalizedPath}`;
};

// 定义接收的属性
const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  child:{
    type:String
  }
})

// 定义事件
const emit = defineEmits(['like', 'reply'])

// 格式化日期函数
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

// 点赞评论
const likeComment = (commentId: number) => {
  emit('like', commentId)
}

// 回复评论
const replyToComment = (commentId: number) => {
  emit('reply', commentId)
}

// 点击头像跳转到聊天页面
const goToChat = () => {
  // 如果评论者是当前用户或未登录，不进行跳转
  if (!userStore.isLoggedIn || props.comment.user?.id === userStore.userId) {
    return
  }
  
  // 跳转到与评论者的聊天页面
  router.push(`/chat/${props.comment.user?.id}`)
}
</script>

<style scoped></style>
