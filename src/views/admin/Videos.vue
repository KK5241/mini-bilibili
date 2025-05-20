<template>
  <div class="videos-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待审核视频" name="pending">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待审核视频</span>
              <el-button type="primary" @click="refreshList">刷新</el-button>
            </div>
          </template>

          <el-empty v-if="videos.length === 0" description="暂无待审核视频" />

          <el-table v-else :data="videos" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" />
            <el-table-column label="封面" width="120">
              <template #default="{ row }">
                <img
                  v-if="row.cover"
                  :src="row.cover"
                  class="video-cover"
                  alt="视频封面"
                />
                <div v-else class="no-cover">无封面</div>
              </template>
            </el-table-column>
            <el-table-column label="上传者" width="120">
              <template #default="{ row }">
                {{ row.user?.username || '未知用户' }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="上传时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button
                    type="primary"
                    @click="handleReview(row, 'approved')"
                  >
                    通过
                  </el-button>
                  <el-button
                    type="danger"
                    @click="handleReview(row, 'rejected')"
                  >
                    拒绝
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="所有视频" name="all">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>所有视频</span>
              <el-button type="primary" @click="refreshAllVideos"
                >刷新</el-button
              >
            </div>
          </template>

          <el-empty v-if="allVideos.length === 0" description="暂无视频" />

          <el-table v-else :data="allVideos" v-loading="loadingAll">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" />
            <el-table-column label="封面" width="120">
              <template #default="{ row }">
                <img
                  v-if="row.cover"
                  :src="row.cover"
                  class="video-cover"
                  alt="视频封面"
                />
                <div v-else class="no-cover">无封面</div>
              </template>
            </el-table-column>
            <el-table-column label="上传者" width="120">
              <template #default="{ row }">
                {{ row.user?.username || '未知用户' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.reviewStatus)">{{
                  getStatusText(row.reviewStatus)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="上传时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  @click="handleDelete(row)"
                  :loading="row.deleting"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewType === 'approved' ? '通过视频' : '拒绝视频'"
      width="500px"
    >
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="拒绝原因" v-if="reviewType === 'rejected'">
          <el-input
            v-model="reviewForm.reason"
            type="textarea"
            rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submitting">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteDialogVisible" title="删除视频" width="400px">
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
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { adminApi } from '@/services/api'

interface Video {
  id: number
  title: string
  cover: string
  status: 'pending' | 'approved' | 'rejected'
  user?: {
    id: number
    username: string
  }
  createdAt: string
  deleting?: boolean
}

const videos = ref<Video[]>([])
const loading = ref(false)
const reviewDialogVisible = ref(false)
const reviewType = ref<'approved' | 'rejected'>('approved')
const currentVideo = ref<Video | null>(null)
const submitting = ref(false)
const reviewForm = ref({
  reason: '',
})

const activeTab = ref('pending')
const allVideos = ref<Video[]>([])
const loadingAll = ref(false)
const deleteDialogVisible = ref(false)
const deleting = ref(false)

const fetchVideos = async () => {
  loading.value = true

  try {
    const response = await adminApi.getPendingVideos()
    console.log('1234', response)

    if (Array.isArray(response)) {
      videos.value = response
    } else {
      videos.value = []
      console.error('API返回的数据格式不正确:', response)
    }
  } catch (error) {
    console.error('获取视频列表失败:', error)
    ElMessage.error('获取视频列表失败')
    videos.value = []
  } finally {
    loading.value = false
  }
}

const handleReview = (video: Video, type: 'approved' | 'rejected') => {
  currentVideo.value = video
  reviewType.value = type
  reviewForm.value.reason = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  if (!currentVideo.value) return

  submitting.value = true
  try {
    await adminApi.reviewVideo(
      currentVideo.value.id,
      reviewType.value,
      reviewType.value === 'rejected' ? reviewForm.value.reason : undefined,
    )

    ElMessage.success('审核操作成功')
    reviewDialogVisible.value = false
    fetchVideos()
  } catch (error) {
    console.error('审核操作失败:', error)
    ElMessage.error('审核操作失败')
  } finally {
    submitting.value = false
  }
}

const refreshList = () => {
  fetchVideos()
}

const fetchAllVideos = async () => {
  loadingAll.value = true
  try {
    const response = await adminApi.getAllVideos()
    if (Array.isArray(response)) {
      allVideos.value = response
      console.log('a', allVideos.value)
    } else {
      allVideos.value = []
      console.error('API返回的数据格式不正确:', response)
    }
  } catch (error) {
    console.error('获取视频列表失败:', error)
    ElMessage.error('获取视频列表失败')
    allVideos.value = []
  } finally {
    loadingAll.value = false
  }
}

const refreshAllVideos = () => {
  fetchAllVideos()
}

const getStatusType = (status: string) => {
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

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知'
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
    await adminApi.deleteVideo(currentVideo.value.id)
    ElMessage.success('删除成功')
    deleteDialogVisible.value = false
    if (activeTab.value === 'pending') {
      fetchVideos()
    } else {
      fetchAllVideos()
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleString()
  } catch (e) {
    return dateString
  }
}

onMounted(() => {
  fetchVideos()
  fetchAllVideos()
})
</script>

<style scoped>
.videos-page {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.video-cover {
  width: 100px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
}

.no-cover {
  width: 100px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 4px;
  color: #999;
  font-size: 12px;
}

.el-tabs {
  margin-bottom: 20px;
}
</style>
