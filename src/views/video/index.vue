<template>
  <div class="bg-[#f5f5f5] py-4">
    <div v-if="isLoading" class="container flex justify-center py-8">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else class="container flex flex-col lg:flex-row gap-4">
      <!-- 左侧区域：视频和评论 -->
      <div class="w-full lg:w-3/4">
        <!-- 视频标题区域 -->
        <div class="bg-white p-4 rounded-lg mb-4">
          <h1 class="text-xl font-bold mb-2">{{ videoDetail.title }}</h1>
          <div class="flex justify-between items-center text-sm text-gray-500">
            <div class="flex items-center">
              <span class="mr-4">{{ videoDetail.views }}次观看</span>
              <span>{{ formatDate(videoDetail.createdAt) }}</span>
            </div>
            <div class="flex items-center">
              <button class="flex items-center mr-4" @click="likeVideo">
                <i
                  class="fas fa-thumbs-up mr-1"
                  :class="{ 'text-blue-500': isLiked }"
                ></i>
                <span>{{ videoDetail.likes }}</span>
              </button>
              <button class="flex items-center mr-4" @click="favoriteVideo">
                <i
                  class="fas fa-star mr-1"
                  :class="{ 'text-blue-500': isCollected }"
                ></i>
                <span>{{ videoDetail.favorites }}</span>
              </button>
              <button class="flex items-center" @click="shareVideo">
                <i class="fas fa-share mr-1"></i>
                <span>{{ videoDetail.shares }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 视频播放区域 -->
        <div class="bg-black rounded-lg mb-4 relative">
          <div class="aspect-video">
            <video
              ref="videoPlayer"
              src="https://prod-streaming-video-msn-com.akamaized.net/a8c412fa-f696-4ff2-9c76-e8ed9cdffe0f/604a87fc-e7bc-463e-8d56-cde7e661d690.mp4"
              class="w-full h-full"
              controls
              :poster="videoDetail.cover"
              @play="startDanmu"
              @pause="stopDanmu"
            ></video>

            <!-- 弹幕区域 -->
            <div
              v-show="showDanmu"
              class="absolute inset-0 pointer-events-none overflow-hidden"
            >
              <div
                v-for="(danmu, index) in activeDanmu"
                :key="index"
                class="absolute text-white text-sm px-2 whitespace-nowrap"
                :style="{
                  top: `${danmu.top}px`,
                  right: `${danmu.position}px`,
                  opacity: danmu.opacity,
                  'text-shadow': '1px 1px 1px rgba(0,0,0,0.5)',
                }"
              >
                {{ danmu.content }}
              </div>
            </div>
          </div>

          <!-- 弹幕控制 -->
          <div
            class="absolute bottom-4 right-4 flex items-center bg-black bg-opacity-50 text-white text-xs p-2 rounded"
          >
            <span>弹幕</span>
            <el-switch v-model="showDanmu" class="mx-2"></el-switch>
          </div>
        </div>

        <!-- 评论区域 -->
        <div class="bg-white p-4 rounded-lg">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold">{{ comments.length }}条评论</h2>
            <el-select
              v-model="commentSort"
              placeholder="排序方式"
              size="small"
              @change="sortComments"
            >
              <el-option label="最新" value="latest"></el-option>
              <el-option label="最热" value="hottest"></el-option>
            </el-select>
          </div>

          <!-- 评论输入 -->
          <div class="flex mb-6">
            <img
              :src="
                userStore.user?.avatar ||
                'https://picsum.photos/100/100?random=user'
              "
              alt="用户头像"
              class="w-10 h-10 rounded-full mr-3"
            />
            <el-input
              v-model="commentText"
              placeholder="发一条友善的评论"
              class="flex-1"
            ></el-input>
            <el-button
              type="primary"
              class="ml-2"
              @click="submitComment"
              :disabled="!userStore.isLoggedIn"
              >发布</el-button
            >
          </div>

          <!-- 评论列表 -->
          <div v-if="isLoadingComments" class="flex justify-center py-4">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else class="comment-list space-y-4">
            <div v-for="comment in comments" :key="comment.id">
              <commentCard
                :comment="comment"
                @like="likeComment"
                @reply="replyToComment"
              ></commentCard>
              <div v-if="comment.replayComments.length > 0" class="mt-5">
                <div
                  v-for="comment1 in comment.replayComments"
                  :key="comment1.key"
                >
                  <commentCard
                    :comment="comment1"
                    child="child"
                    class="ml-10"
                    @like="likeComment"
                    @reply="replyToComment"
                  ></commentCard>
                </div>
              </div>
              <div class="flex justify-center">
                <el-divider />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧区域：UP主信息和推荐视频 -->
      <div class="w-full lg:w-1/4">
        <!-- UP主信息 -->
        <div class="bg-white p-4 rounded-lg mb-4">
          <div class="flex items-center mb-4">
            <img
              :src="
                videoDetail.user?.avatar ||
                'https://picsum.photos/100/100?random=uploader'
              "
              alt="UP主头像"
              class="w-12 h-12 rounded-full mr-3"
            />
            <div class="flex-1">
              <div class="font-bold">{{ videoDetail.user?.username }}</div>
              <div class="text-xs text-gray-500">
                {{ videoDetail.user?.followers || 0 }}粉丝
              </div>
            </div>
            <el-button
              type="primary"
              :disabled="
                !userStore.isLoggedIn || userStore.userId === videoDetail.userId
              "
              size="small"
              @click="followAuthor"
            >
              {{ isFollowed ? '已关注' : '关注' }}
            </el-button>
          </div>
          <p class="text-sm text-gray-700">
            {{ videoDetail.user?.bio || '这个人很懒，什么都没留下' }}
          </p>
        </div>

        <!-- 推荐视频列表 -->
        <div class="bg-white p-4 rounded-lg">
          <h3 class="font-bold mb-4">相关推荐</h3>
          <div v-if="isLoadingRecommended" class="flex justify-center py-4">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="video in recommendedVideos"
              :key="video.id"
              class="flex cursor-pointer"
              @click="goToVideo(video.id)"
            >
              <div class="relative w-1/3">
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
              <div class="w-2/3 pl-2">
                <p class="text-sm font-medium line-clamp-2">
                  {{ video.title }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ video.user?.username }}
                </p>
                <p class="text-xs text-gray-500">{{ video.views }}次观看</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { videoApi, commentApi, userApi } from '../../services/api'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import commentCard from '@/components/commont/commentCard.vue'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const videoId = computed(() => Number(route.query.id))
const isLiked = ref(false)
const isCollected = ref(false)
// 加载状态
const isLoading = ref(true)
const isLoadingComments = ref(true)
const isLoadingRecommended = ref(true)

// 视频播放器引用
const videoPlayer = ref(null)

// 视频详情
const videoDetail = ref({
  id: 0,
  title: '',
  description: '',
  cover: '',
  videoUrl: '',
  duration: '',
  views: 0,
  likes: 0,
  favorites: 0,
  shares: 0,
  createdAt: '',
  updatedAt: '',
  user: null,
  userId: 0,
})

// 是否已关注作者
const isFollowed = ref(false)

// 评论相关
const commentText = ref('')
const commentSort = ref('latest')
const comments = ref([])
const replyToId = ref(null)

// 推荐视频
const recommendedVideos = ref([])

// 弹幕相关
const showDanmu = ref(true)
const activeDanmu = ref([])
const danmuTimer = ref(null)
const danmuData = ref([])

// 格式化日期
const formatDate = (dateString) => {
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

// 加载视频详情
const loadVideoDetail = async () => {
  try {
    isLoading.value = true
    const response = await videoApi.getVideoDetail(videoId.value)
    videoDetail.value = response

    // 增加浏览量
    await videoApi.addView(videoId.value)

    // 检查是否已关注视频作者
    if (userStore.isLoggedIn && videoDetail.value.userId !== userStore.userId) {
      checkIfFollowingAuthor()
    }
  } catch (error) {
    console.error('获取视频详情失败:', error)
    ElMessage.error('获取视频详情失败，请稍后再试')
  } finally {
    isLoading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  try {
    isLoadingComments.value = true
    const response = await commentApi.getVideoComments(videoId.value)
    comments.value = response
    console.log(comments.value)

    sortComments()
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败，请稍后再试')
    comments.value = []
  } finally {
    isLoadingComments.value = false
  }
}

// 加载推荐视频
const loadRecommendedVideos = async () => {
  try {
    isLoadingRecommended.value = true
    const response = await videoApi.getPopularVideos()
    console.log(response)
    // 过滤掉当前视频
    recommendedVideos.value = response
      .filter((video) => video.id !== videoId.value)
      .slice(0, 6)
  } catch (error) {
    console.error('获取推荐视频失败:', error)
    recommendedVideos.value = []
  } finally {
    isLoadingRecommended.value = false
  }
}

// 发表评论
const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!commentText.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    await commentApi.createComment(
      commentText.value,
      videoId.value,
      replyToId.value,
    )

    ElMessage.success('评论发布成功')
    commentText.value = ''
    replyToId.value = null
    loadComments() // 重新加载评论
  } catch (error) {
    console.error('评论发布失败:', error)
    ElMessage.error('评论发布失败，请稍后再试')
  }
}

// 回复评论
const replyToComment = (commentId) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  replyToId.value = commentId
  const comment = comments.value.find((c) => c.id === commentId)
  if (comment) {
    commentText.value = `回复 @${comment.user?.username}：`
  }
}

// 点赞评论
const likeComment = async (commentId) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await commentApi.likeComment(commentId)
    const comment = comments.value.find((c) => c.id === commentId)
    if (comment) {
      comment.likes += 1
    }
    ElMessage.success('点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('点赞失败，请稍后再试')
  }
}

// 点赞视频
const likeVideo = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await videoApi.likeVideo(videoId.value)
    videoDetail.value.likes += 1
    ElMessage.success('点赞成功')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('点赞失败，请稍后再试')
  }
}

// 收藏视频
const favoriteVideo = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await videoApi.favoriteVideo(videoId.value)
    videoDetail.value.favorites += 1
    ElMessage.success('收藏成功')
  } catch (error) {
    console.error('收藏失败:', error)
    ElMessage.error('收藏失败，请稍后再试')
  }
}

// 分享视频
const shareVideo = async () => {
  try {
    await videoApi.shareVideo(videoId.value)
    videoDetail.value.shares += 1

    // 复制链接到剪贴板
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败，请稍后再试')
  }
}

// 排序评论
const sortComments = () => {
  if (commentSort.value === 'latest') {
    comments.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else {
    comments.value.sort((a, b) => b.likes - a.likes)
  }
}

// 检查是否已关注视频作者
const checkIfFollowingAuthor = async () => {
  if (!userStore.isLoggedIn || !videoDetail.value.userId) return

  try {
    console.log(userStore.userId)

    const following = await userApi.getFollowing(userStore.userId)
    isFollowed.value = following.some(
      (user) => user.id === videoDetail.value.userId,
    )
  } catch (error) {
    console.error('检查关注状态失败:', error)
  }
}

// 关注/取消关注作者
const followAuthor = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (userStore.userId === videoDetail.value.userId) {
    ElMessage.warning('不能关注自己')
    return
  }

  try {
    if (isFollowed.value) {
      await userApi.unfollowUser(videoDetail.value.userId)
      isFollowed.value = false
      ElMessage.success('已取消关注')
    } else {
      await userApi.followUser(videoDetail.value.userId)
      isFollowed.value = true
      ElMessage.success('关注成功')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请稍后再试')
  }
}

// 跳转到其他视频
const goToVideo = (id) => {
  router.push(`/video?id=${id}`)
  // 刷新页面数据
  videoId.value = id
  loadVideoDetail()
  loadComments()
}

// 弹幕相关函数
const startDanmu = () => {
  if (danmuTimer.value) return

  // 模拟弹幕数据
  danmuData.value = [
    { content: '讲得真好！', time: 5, color: 16777215 },
    { content: '这个知识点太重要了', time: 10, color: 16777215 },
    { content: '请问这个在实际中如何应用？', time: 15, color: 16777215 },
    { content: '我有个问题想问一下', time: 20, color: 16777215 },
    { content: '老师讲得非常清晰', time: 25, color: 16777215 },
    { content: '建议放慢速度', time: 30, color: 16777215 },
    { content: '已经学会了，太实用了', time: 35, color: 16777215 },
    { content: '这部分没听懂，可以再讲一遍吗', time: 40, color: 16777215 },
  ]

  danmuTimer.value = setInterval(() => {
    if (!videoPlayer.value) return

    const currentTime = Math.floor(videoPlayer.value.currentTime)
    const newDanmu = danmuData.value.filter(
      (d) => Math.abs(d.time - currentTime) < 1,
    )

    if (newDanmu.length) {
      const height = videoPlayer.value.clientHeight

      newDanmu.forEach((danmu) => {
        const top = Math.floor(Math.random() * (height - 40)) + 20

        activeDanmu.value.push({
          content: danmu.content,
          top: top,
          position: 0,
          opacity: 1,
        })
      })
    }

    // 更新现有弹幕位置
    activeDanmu.value.forEach((danmu) => {
      danmu.position += 3
      if (danmu.position > videoPlayer.value.clientWidth + 200) {
        danmu.opacity -= 0.05
      }
    })

    // 移除已消失的弹幕
    activeDanmu.value = activeDanmu.value.filter((danmu) => danmu.opacity > 0)
  }, 50)
}

const stopDanmu = () => {
  if (danmuTimer.value) {
    clearInterval(danmuTimer.value)
    danmuTimer.value = null
  }
}

onMounted(() => {
  if (videoId.value) {
    console.log(videoId.value)
    loadVideoDetail()
    loadComments()
    loadRecommendedVideos()
  }
})

onUnmounted(() => {
  stopDanmu()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-video {
  height: 100%;
  position: relative;
}

.aspect-video video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

::v-deep(.el-divider--horizontal) {
  border: none;
  height: 1px;
  width: 90%;
  background: linear-gradient(
    to right,
    rgba(237, 234, 234, 0.926),
    rgb(211, 197, 197) 50%,
    rgba(237, 234, 234, 0.926)
  );
  margin: 20px 0;
}
</style>
