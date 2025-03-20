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
            <img src="@/assets/banner.png" alt="专升本上岸全攻略" class="w-full h-full object-cover" />
          </el-carousel-item>
          <!-- 可以添加更多轮播项 -->
        </el-carousel>
      </div>
      
      <!-- 右侧登录区域 -->
      <div class="h-[360px] w-[200px] bg-white rounded flex flex-col items-center pt-4">
        <div class="rounded-full bg-gray-100 w-16 h-16 mb-4 flex justify-center items-center">
          <img src="@/assets/avatar-default.png" alt="" class="w-12 h-12 rounded-full" />
        </div>
        <div class="text-center mb-4">免费学习来自名校名师的精品课程</div>
        <el-button type="primary" class="w-3/4" @click="showLoginModal">登录/注册</el-button>
      </div>
    </div>
    <div class="w-full h-[60px] bg-white rounded-md mt-4"></div>
  </div>
</template>

<script setup lang="ts">
import LeftNavMenu from '@/components/leftNavMenu/index.vue'
import { ref } from 'vue'

const showLoginModal = () => {
  // 这里可以调用登录弹窗逻辑
}
</script>