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
            :src="userStore.user?.avatar || '@/assets/avatar-default.png'"
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
      <a href="">全部合作学校200所 ></a>
      <img src="@/assets/school.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school.png" alt="" class="h-[40px] w-[110px]" />
      <img src="@/assets/school.png" alt="" class="h-[40px] w-[110px]" /><img
        src="@/assets/school.png"
        alt=""
        class="h-[40px] w-[110px]"
      />
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
import { ref } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loginModalRef = ref()
</script>
