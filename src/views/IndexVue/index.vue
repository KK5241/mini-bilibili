<template>
  <div class="bg-[#f5f5f5] h-full container">
    <div class="flex justify-between py-2">
      <!-- 左侧导航菜单 -->
      <div class="h-[360px] w-[200px] bg-white rounded">
        <LeftNavMenu></LeftNavMenu>
      </div>

      <!-- 中间轮播图 -->
      <div class="h-[360px] w-[760px] bg-white rounded overflow-hidden">
        <el-carousel height="360px">
          <el-carousel-item>
            <img
              src="@/assets/banner1.png"
              alt="专升本上岸全攻略"
              class="w-full h-full object-cover"
            />
          </el-carousel-item>
          <el-carousel-item>
            <img
              src="@/assets/banner2.png"
              alt="专升本上岸全攻略"
              class="w-full h-full object-cover"
            />
          </el-carousel-item>
          <el-carousel-item>
            <img
              src="@/assets/banner3.png"
              alt="专升本上岸全攻略"
              class="w-full h-full object-cover"
            />
          </el-carousel-item>
          <!-- 可以添加更多轮播项 -->
        </el-carousel>
      </div>

      <!-- 右侧登录区域 -->
      <div
        class="h-[360px] w-[200px] bg-white rounded flex flex-col items-center pt-4"
      >
        <div
          class="rounded-full bg-gray-100 w-16 h-16 mb-4 flex justify-center items-center"
        >
          <img
            :src="user?.avatar ? getCompleteFileUrl(user.avatar) : '/src/assets/avatar-default.png'"
            alt=""
            class="w-12 h-12 rounded-full"
          />
        </div>
        <div v-if="userStore.isLoggedIn" class="text-center mb-4">
          <div class="font-medium">{{ userStore.username }}</div>
          <div class="text-sm text-gray-500 mt-1">欢迎回来</div>
        </div>
        <div v-else class="text-center mb-4">免费学习来自名校名师的精品课程</div>
        <el-button 
          v-if="userStore.isLoggedIn" 
          type="danger" 
          class="w-3/4" 
          @click="userStore.logout()"
        >退出登录</el-button>
        <el-button 
          v-else 
          type="primary" 
          class="w-3/4" 
          @click="loginModalRef.open()"
        >登录/注册</el-button>
      </div>
    </div>
    <div
      class="w-full h-[60px] bg-white flex justify-around items-center rounded-md mt-4 center text-gray-700"
    >
      <a href="/school">全部合作学校200多所 ></a>
      
      <img src="@/assets/school1.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school2.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school3.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school4.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school5.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school6.png" alt="" class="h-[40px] w-[110px]" />
      
      
    </div>
    
    <!-- 视频内容区 -->
    <VideoContent></VideoContent>

    <!-- 登录模态框 -->
    <LoginModal ref="loginModalRef" />
  </div>
</template>

<script setup lang="ts">
import LeftNavMenu from '@/components/leftNavMenu/index.vue'
import VideoContent from '@/components/content/videoContent.vue'
import LoginModal from '@/components/LoginModal.vue'
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { userApi } from '@/services/api'

const userStore = useUserStore()
const loginModalRef = ref()
const user = ref(userStore.user)
onMounted(async () => {
  if(userStore.user?.id){
    user.value = await userApi.getUserInfo(userStore.user.id)
  }
})

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

const imageModules: any = import.meta.glob(
  '@/assets/school/*.{png,jpg,jpeg,svg}',
  {
    eager: true,
  },
)
const images = Object.keys(imageModules).map((path) => ({
  src: imageModules[path].default,
  name: path.split('/').pop(),
}))
</script>
