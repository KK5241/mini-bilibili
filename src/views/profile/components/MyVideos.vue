<template>
  <div class="my-videos">
    <el-empty v-if="videos?.length === 0" description="暂无上传视频" />

    <div v-else class="video-grid">
      <el-card v-for="video in videos" :key="video.id" class="video-card">
        <template #header>
          <div class="video-header">
            <div class="flex-1 overflow-hidden">
              <h3 class="video-title">{{ video.title }}</h3>
            </div>
            <el-tag
              :type="getReviewStatusType(video.reviewStatus)"
              size="small"
            >
              {{ getReviewStatusText(video.reviewStatus) }}
            </el-tag>
          </div>
        </template>

        <div class="video-cover">
          <img :src="getCompleteFileUrl(video.cover)" :alt="video.title" />
        </div>

        <div class="video-info">
          <div class="video-stats">
            <span>
              <el-icon><View /></el-icon>
              {{ video.views }}
            </span>
            <span>
              <el-icon><Star /></el-icon>
              {{ video.likes }}
            </span>
          </div>
          <div class="video-actions">
            <el-tooltip
              v-if="
                video.reviewStatus === 'rejected' &&
                video.reviews &&
                video.reviews.length > 0
              "
              :content="video.reviews[0].reason || '未提供拒绝原因'"
              placement="top"
            >
              <el-button type="danger" plain size="small">查看拒绝原因</el-button>
            </el-tooltip>
            <el-button type="danger" size="small" @click="handleDelete(video)">删除</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除视频"
      width="400px"
    >
      <p>确定要删除这个视频吗？此操作不可恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="deleting">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { View, Star } from '@element-plus/icons-vue'
import { userApi, videoApi } from '../../../services/api'
import { useUserStore } from '../../../store/user'
import { getCompleteFileUrl } from '@/utils/getCompleteFileUrl'
import { ElMessage } from 'element-plus'

interface VideoReview {
  id: number
  status: 'approved' | 'rejected'
  reason?: string
  createdAt: string
}

interface Video {
  id: number
  title: string
  cover: string
  views: number
  likes: number
  reviewStatus: 'pending' | 'approved' | 'rejected'
  reviews?: VideoReview[]
}

const videos = ref<Video[]>([])
const userStore = useUserStore()
const deleteDialogVisible = ref(false)
const deleting = ref(false)
const currentVideo = ref<Video | null>(null)

const fetchVideos = async () => {
  try {
    const response = await userApi.getUserVideos(userStore.userId)
    videos.value = response
    console.log('123', videos.value)
  } catch (error) {
    console.error('获取视频失败', error)
  }
}

const getReviewStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '审核中'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知状态'
  }
}

const getReviewStatusType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

const handleDelete = (video: Video) => {
  currentVideo.value = video
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  if (!currentVideo.value) return

  deleting.value = true
  try {
    await videoApi.deleteVideo(currentVideo.value.id)
    ElMessage.success('删除成功')
    deleteDialogVisible.value = false
    // 重新获取视频列表
    fetchVideos()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchVideos()
})
</script>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.video-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.video-title {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.video-cover {
  position: relative;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.video-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-info {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-stats {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 12px;
}

.video-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.video-actions {
  display: flex;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
