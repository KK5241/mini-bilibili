<template>
  <div class="flex flex-col h-full overflow-y-scroll">
    <HeaderContainer class="sticky top-0 z-50"></HeaderContainer>
    <div class="grow">
      <router-view></router-view>
    </div>
    <footer class="h-[100px] w-full bg-black shrink-0"></footer>
  </div>
</template>

<script setup lang="ts">
import HeaderContainer from './views/header/index.vue'
</script>
