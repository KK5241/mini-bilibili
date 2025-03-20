<template>
  <div class="flex container items-center h-[64px] bg-[#ffffff]">
    <!-- logo -->
    <img src="@/assets/logo.png" class="w-[120px] h-[90px]" alt="" />

    <!-- 头部导航栏 -->
    <nav class="w-[600px]">
      <HeaderNav></HeaderNav>
    </nav>

    <img src="@/assets/xx.png" alt="" class="w-[100px] h-[25px] pr-[10px]" />

    <!-- 搜索框 -->
    <div
      class="border-[1px] border-solid border-[#2976d3] rounded-full w-[250px] h-[30px] flex items-center"
    >
    <!-- 火花图标 -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 14 14"
        fill="none"
        class="ml-[15px] mr-[5px]"
      >
        <path
          d="M5.61753 0.367831C5.40287 1.0544 4.81838 2.28812 3.22884 3.92433C0.486652 6.75051 0.123243 11.3033 4.33656 13.5421C4.68247 13.7259 4.97121 13.6127 5.18821 13.3858C5.90569 12.6368 6.21718 11.5378 6.12385 10.09C6.0976 9.69103 6.27552 9.5872 6.62784 9.86019C7.62707 10.6337 8.27922 11.8254 8.27922 13.1064C8.27922 13.5421 8.45363 13.7725 8.86021 13.6938C11.547 13.1729 14.8212 9.32062 11.2927 3.67992C11.0815 3.39293 10.7694 3.39293 10.7747 3.78725C10.7805 4.27141 10.7251 4.7544 10.609 5.22455C10.5291 5.55121 10.2217 5.54654 10.1493 5.22455C9.70952 3.26518 8.48688 1.5998 6.48084 0.225501C5.93952 -0.144907 5.74295 -0.0311595 5.61753 0.368414V0.367831Z"
          fill="url(#paint0_linear_2_631)"
        ></path>
        <defs>
          <linearGradient
            id="paint0_linear_2_631"
            x1="3.5"
            y1="2.5"
            x2="11"
            y2="13"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FF9431"></stop>
            <stop offset="1" stop-color="#FF3F29"></stop>
          </linearGradient>
        </defs>
      </svg>
      <input
        type="text"
        placeholder="26考研全科班"
        class="outline-none border-none w-[160px]"
      />
      <div
        class="w-[100px] h-full bg-[#2976d3] rounded-r-full flex justify-center items-center cursor-pointer"
      >

      <!-- 搜索图标 -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 13 13"
        >
          <path
            fill="#ffffff"
            d="M8.39659 2.53839C6.77899 0.920784 4.15633 0.920784 2.53872 2.53839C0.921119 4.15599 0.921119 6.77865 2.53872 8.39626C4.15633 10.0139 6.77899 10.0139 8.39659 8.39626C10.0142 6.77865 10.0142 4.15599 8.39659 2.53839ZM1.59592 1.59558C3.73422 -0.542724 7.2011 -0.542724 9.3394 1.59558C11.3181 3.57431 11.4658 6.69072 9.7824 8.83925L12.533 11.5898C12.7933 11.8502 12.7933 12.2723 12.533 12.5326C12.2726 12.793 11.8505 12.793 11.5902 12.5326L8.83959 9.78206C6.69106 11.4655 3.57465 11.3178 1.59592 9.33906C-0.542389 7.20076 -0.542389 3.73388 1.59592 1.59558Z"
          ></path>
        </svg>
      </div>
    </div>
    <div class="ml-auto hover:text-[#2976d3] cursor-pointer" @click="handleLogin">登录 | 注册</div>
  </div>
  <LoginModal ref="loginModalRef" />
</template>

<script setup lang="ts">
import HeaderNav from '@/components/headerNav/index.vue'
import LoginModal from '@/components/LoginModal.vue'
import { ref } from 'vue'

const loginModalRef = ref()

const handleLogin = () => {
  loginModalRef.value.open()
}
</script>

<style scoped></style>
