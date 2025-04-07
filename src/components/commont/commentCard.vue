<template>
    <div class="comment-item flex">
      <img
        :src="
          comment.user?.avatar || 'https://picsum.photos/100/100?random=user'
        "
        alt="评论头像"
        class="rounded-full mr-3"
        :class="child === 'child' ? 'w-8 h-8' : 'w-10 h-10'"
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

console.log(123);
console.log(5678);



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
</script>

<style scoped></style>
