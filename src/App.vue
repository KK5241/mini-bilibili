<template>
  <div class="flex flex-col h-full overflow-y-scroll">
    <HeaderContainer></HeaderContainer>
    <div class="grow">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import HeaderContainer from './views/header/index.vue'
</script>
