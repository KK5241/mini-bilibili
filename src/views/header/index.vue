<template>
  <div
    class="flex container justify-between items-center h-[64px] bg-[#ffffff]"
  >
    <img src="@/assets/logo.png" class="w-[120px] h-[90px]" alt="" />

    <nav class="flex grow justify-around">
      <HeaderNav></HeaderNav>
    </nav>
    
    <div class="border-2 border-solid border-indigo-600 round h-[30px]">
      <input type="text" />
    </div>
    <div>登陆 | 注册</div>
  </div>
</template>

<script setup lang="ts">
import HeaderNav from '@/components/headerNav/index.vue'
</script>

<style scoped></style>
