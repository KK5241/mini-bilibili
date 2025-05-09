<template>
  <div>
    <h1 class="text-center text-2xl font-bold mb-6">上传视频</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- 左侧：上传区域 -->
      <div>
        <!-- 视频文件上传 -->
        <div class="mb-5">
          <div class="flex items-center mb-2">
            <span class="text-red-500 mr-1">*</span>
            <label class="text-gray-700 font-bold">
              视频文件
            </label>
          </div>
          <div>
            <input
              type="file"
              accept="video/*"
              class="hidden"
              ref="videoFileInput"
              @change="handleVideoFileChange"
            />
            <div 
              v-if="!videoFilename" 
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center" 
              @click="triggerVideoFileInput"
              @drop.prevent="handleVideoDrop"
              @dragover.prevent
              @dragenter.prevent="dragEnterVideo = true"
              @dragleave.prevent="dragEnterVideo = false"
              :class="{'border-blue-500': dragEnterVideo}"
              style="min-height: 200px;"
            >
              <el-icon class="text-5xl text-gray-400 mb-4"><i-ep-upload-filled /></el-icon>
              <div class="text-gray-500 mb-6">拖拽到此处也可上传</div>
              <el-button type="primary" size="large" class="w-40">上传视频</el-button>
              
              <div class="mt-6 text-sm text-gray-500">
                当前审核队列 <span class="ml-3 bg-blue-500 text-white px-2 py-0.5 rounded text-xs">快速</span>
              </div>
            </div>
            
            <div v-else class="border rounded-lg p-4 bg-gray-50">
              <div class="flex justify-between items-center">
                <div class="flex items-center">
                  <el-icon class="text-blue-500 mr-2"><i-ep-video-play /></el-icon>
                  <span class="text-gray-700">{{ videoFilename }}</span>
                </div>
                <div class="flex gap-2">
                  <el-button type="primary" plain size="small" @click="triggerVideoFileInput">
                    重新选择
                  </el-button>
                  <el-button type="danger" plain size="small" @click="clearVideoFile">
                    删除
                  </el-button>
                </div>
              </div>
              
              <!-- 上传进度条 -->
              <div v-if="uploadingVideo" class="mt-3">
                <el-progress 
                  :percentage="uploadProgress" 
                  :format="percentFormat"
                  status="success" 
                />
                <div class="text-xs text-gray-500 mt-1">
                  已上传: {{ formatFileSize(uploadProgress * videoFileSize / 100) }}/{{ formatFileSize(videoFileSize) }}
                  当前速度: {{ uploadSpeed }} MB/s
                  剩余时间: {{ estimatedTime }}
                </div>
              </div>
              
              <!-- 视频预览 -->
              <div v-if="videoPreview && !uploadingVideo" class="mt-3">
                <video 
                  class="w-full h-auto max-h-60 object-cover rounded" 
                  controls
                  :src="videoPreview"
                ></video>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 封面图片上传 -->
        <div class="mb-5">
          <div class="flex items-center mb-2">
            <span class="text-red-500 mr-1">*</span>
            <label class="text-gray-700 font-bold">
              封面图片
            </label>
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              ref="fileInput"
              @change="handleFileChange"
            />
            <div 
              v-if="!coverPreview" 
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center"
              @click="triggerFileInput"
              @drop.prevent="handleCoverDrop"
              @dragover.prevent
              @dragenter.prevent="dragEnterCover = true"
              @dragleave.prevent="dragEnterCover = false"
              :class="{'border-blue-500': dragEnterCover}"
              style="min-height: 200px;"
            >
              <el-icon class="text-5xl text-gray-400 mb-4"><i-ep-picture /></el-icon>
              <div class="text-gray-500 mb-6">拖拽到此处也可上传</div>
              <el-button type="primary" size="large" class="w-40">上传图片</el-button>
            </div>
            
            <div v-else class="relative group">
              <img :src="coverPreview" class="w-full h-48 object-cover rounded-lg" />
              <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <el-button type="primary" plain @click="triggerFileInput">
                  重新选择
                </el-button>
                <el-button type="danger" plain class="ml-2" @click="clearCoverFile">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：表单信息 -->
      <div>
        <!-- 视频标题 -->
        <div class="mb-5">
          <div class="flex items-center mb-2">
            <span class="text-red-500 mr-1">*</span>
            <label class="text-gray-700 font-bold">
              视频标题
            </label>
          </div>
          <el-input
            v-model="formData.title"
            placeholder="请输入视频标题"
            class="w-full"
          />
        </div>
        
        <!-- 视频描述 -->
        <div class="mb-5">
          <div class="flex items-center mb-2">
            <span class="text-red-500 mr-1">*</span>
            <label class="text-gray-700 font-bold">
              视频描述
            </label>
          </div>
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="5"
            placeholder="请输入视频描述"
            class="w-full"
          />
        </div>
        
        <el-divider />
        
        <!-- 基本设置 -->
        <h2 class="text-lg font-bold mb-4">基本设置</h2>
        
        <!-- 视频时长 -->
        <div class="mb-5">
          <div class="flex items-center mb-2">
            <span class="text-red-500 mr-1">*</span>
            <label class="text-gray-700 font-bold">
              视频时长
            </label>
          </div>
          <el-input
            v-model="formData.duration"
            placeholder="格式: 00:00"
            class="w-full"
          />
        </div>
        
        <!-- 视频类型 -->
        <div class="mb-5">
          <div class="flex items-center mb-2">
            <label class="text-gray-700 font-bold">
              视频类型
            </label>
          </div>
          <div class="flex space-x-6">
            <el-checkbox v-model="formData.isPremium">精品课程</el-checkbox>
            <el-checkbox v-model="formData.hasWisdomCourse">智慧课程</el-checkbox>
          </div>
        </div>
        
        <!-- 视频分类 -->
        <div class="mb-5">
          <div class="flex items-center mb-2">
            <span class="text-red-500 mr-1">*</span>
            <label class="text-gray-700 font-bold">
              视频分类
            </label>
          </div>
          <el-select v-model="formData.category" placeholder="请选择视频分类" class="w-full">
            <el-option label="文学" value="文学" />
            <el-option label="理学" value="理学" />
            <el-option label="计算机" value="计算机" />
            <el-option label="英语" value="英语" />
            <el-option label="金融" value="金融" />
            <el-option label="农学" value="农学" />
            <el-option label="建筑学" value="建筑学" />
          </el-select>
        </div>
        
        <!-- 教师名称 -->
        <div class="mb-6">
          <div class="flex items-center mb-2">
            <span class="text-red-500 mr-1">*</span>
            <label class="text-gray-700 font-bold">
              教师名称
            </label>
          </div>
          <el-input
            v-model="formData.teacher"
            placeholder="请输入教师名称"
            class="w-full"
          />
        </div>
      </div>
    </div>
    
    <el-divider />
    
    <!-- 提交按钮 -->
    <div class="flex justify-center">
      <el-button
        type="success"
        size="large"
        @click="handleSubmit"
        :loading="submitting"
        :disabled="submitting || uploadingVideo"
        class="w-32"
      >
        提交
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '../../store/user'
import { uploadApi, videoApi } from '../../services/api'
import { ElMessage } from 'element-plus'

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  cover: '',
  videoUrl: '',
  duration: '',
  isPremium: false,
  hasWisdomCourse: false,
  teacher: '',
  category: '计算机' // 默认为计算机分类
})

// 文件上传相关
const fileInput = ref<HTMLInputElement | null>(null)
const coverPreview = ref('')
const filename = ref('')
const uploadedCoverPath = ref('')
const dragEnterCover = ref(false)

// 视频文件上传相关
const videoFileInput = ref<HTMLInputElement | null>(null)
const videoPreview = ref('')
const videoFilename = ref('')
const uploadedVideoPath = ref('')
const uploadProgress = ref(0)
const uploadingVideo = ref(false)
const videoFileSize = ref(0)
const uploadSpeed = ref('0')
const uploadStartTime = ref(0)
const lastUploadedBytes = ref(0)
const currentUploadedBytes = ref(0)
const lastUpdateTime = ref(0)
const dragEnterVideo = ref(false)

const estimatedTime = computed(() => {
  if (uploadSpeed.value === '0' || uploadProgress.value === 0) return '--';
  
  const remainingBytes = videoFileSize.value - currentUploadedBytes.value;
  const remainingSeconds = remainingBytes / (parseFloat(uploadSpeed.value) * 1024 * 1024);
  
  if (remainingSeconds < 60) {
    return `${Math.ceil(remainingSeconds)}秒`;
  } else if (remainingSeconds < 3600) {
    return `${Math.ceil(remainingSeconds / 60)}分钟`;
  } else {
    return `${Math.floor(remainingSeconds / 3600)}小时${Math.ceil((remainingSeconds % 3600) / 60)}分钟`;
  }
});

// 格式化百分比
const percentFormat = (percentage: number) => {
  return percentage === 100 ? '上传完成' : `${percentage}%`;
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 提交状态
const submitting = ref(false)

// 用户信息
const userStore = useUserStore()

// 点击按钮触发封面文件输入
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 点击按钮触发视频文件输入
const triggerVideoFileInput = () => {
  videoFileInput.value?.click()
}

// 清除封面文件
const clearCoverFile = () => {
  coverPreview.value = ''
  filename.value = ''
  uploadedCoverPath.value = ''
  formData.cover = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 清除视频文件
const clearVideoFile = () => {
  videoPreview.value = ''
  videoFilename.value = ''
  uploadedVideoPath.value = ''
  formData.videoUrl = ''
  formData.duration = ''
  if (videoFileInput.value) {
    videoFileInput.value.value = ''
  }
}

// 处理封面文件变化
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  
  const file = target.files[0]
  filename.value = file.name
  
  // 显示预览
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  // 上传文件
  try {
    uploadedCoverPath.value = await uploadApi.uploadCover(file, userStore.token)
    
    // 更新表单值
    formData.cover = uploadedCoverPath.value
    ElMessage.success('封面上传成功')
  } catch (error) {
    console.error('上传封面失败:', error)
    ElMessage.error('封面上传失败，请重试')
    clearCoverFile()
  }
}

// 处理视频文件变化
const handleVideoFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  
  const file = target.files[0]
  videoFilename.value = file.name
  videoFileSize.value = file.size
  
  // 自动获取视频时长
  const videoElement = document.createElement('video')
  videoElement.preload = 'metadata'
  
  videoElement.onloadedmetadata = () => {
    const duration = videoElement.duration
    // 将秒数转换为 "mm:ss" 格式
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    formData.duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  // 创建本地预览URL
  videoPreview.value = URL.createObjectURL(file)
  videoElement.src = videoPreview.value
  
  // 上传文件
  try {
    uploadingVideo.value = true
    uploadProgress.value = 0
    uploadStartTime.value = Date.now()
    lastUpdateTime.value = Date.now()
    lastUploadedBytes.value = 0
    currentUploadedBytes.value = 0
    
    uploadedVideoPath.value = await uploadApi.uploadVideo(
      file, 
      userStore.token,
      (percent: number, loaded?: number) => {
        uploadProgress.value = percent
        if (loaded !== undefined) {
          currentUploadedBytes.value = loaded
          
          // 计算上传速度
          const now = Date.now()
          if (now - lastUpdateTime.value > 1000) { // 每秒更新一次速度
            const timeDiff = (now - lastUpdateTime.value) / 1000 // 秒
            const bytesDiff = loaded - lastUploadedBytes.value
            const speedMBps = (bytesDiff / timeDiff / (1024 * 1024)).toFixed(2)
            uploadSpeed.value = speedMBps
            
            lastUpdateTime.value = now
            lastUploadedBytes.value = loaded
          }
        }
      }
    )
    
    // 更新表单值
    formData.videoUrl = uploadedVideoPath.value
    ElMessage.success('视频上传成功')
  } catch (error) {
    console.error('上传视频失败:', error)
    ElMessage.error('视频上传失败，请重试')
    clearVideoFile()
  } finally {
    uploadingVideo.value = false
  }
}

// 处理拖拽上传视频
const handleVideoDrop = (event: DragEvent) => {
  dragEnterVideo.value = false
  if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return
  
  const file = event.dataTransfer.files[0]
  if (!file.type.startsWith('video/')) {
    ElMessage.warning('请上传视频文件')
    return
  }
  
  // 模拟文件输入变化
  const dT = new DataTransfer()
  dT.items.add(file)
  if (videoFileInput.value) {
    videoFileInput.value.files = dT.files
    videoFileInput.value.dispatchEvent(new Event('change'))
  }
}

// 处理拖拽上传封面图片
const handleCoverDrop = (event: DragEvent) => {
  dragEnterCover.value = false
  if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return
  
  const file = event.dataTransfer.files[0]
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  
  // 模拟文件输入变化
  const dT = new DataTransfer()
  dT.items.add(file)
  if (fileInput.value) {
    fileInput.value.files = dT.files
    fileInput.value.dispatchEvent(new Event('change'))
  }
}

// 表单提交
const handleSubmit = async () => {
  if (!formData.title) {
    ElMessage.warning('请输入视频标题')
    return
  }
  
  if (!formData.videoUrl) {
    ElMessage.warning('请上传视频文件')
    return
  }
  
  if (!formData.cover) {
    ElMessage.warning('请上传封面图片')
    return
  }
  
  if (!formData.category) {
    ElMessage.warning('请选择视频分类')
    return
  }
  
  try {
    submitting.value = true
    
    // 调用API保存视频信息
    await videoApi.createVideo(formData)
    
    ElMessage.success('视频上传成功')
    
    // 清空表单
    Object.assign(formData, {
      title: '',
      description: '',
      cover: '',
      videoUrl: '',
      duration: '',
      isPremium: false,
      hasWisdomCourse: false,
      teacher: '',
      category: '计算机'
    })
    
    // 清空预览
    clearCoverFile()
    clearVideoFile()
    
  } catch (error) {
    console.error('提交视频信息失败:', error)
    ElMessage.error('提交视频信息失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.el-divider {
  margin: 30px 0;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .grid {
    gap: 2rem;
  }
}
</style> 