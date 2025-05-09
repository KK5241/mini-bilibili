<template>
  <router-link 
    to="/" 
    active-class="nav-active" 
    exact-active-class="nav-active-exact"
  >课程</router-link>
  <router-link 
    to="/school" 
    active-class="nav-active" 
    exact-active-class="nav-active-exact"
  >合作学校</router-link>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

// 获取当前路由
const route = useRoute();
</script>

<style scoped>
a {
  color: #333333;
  margin-right: 20px;
  text-decoration: none;
  padding-bottom: 4px;
  position: relative;
}

a:hover {
  color: #2976d3;
}

/* 激活状态样式 */
.nav-active,
.nav-active-exact {
  color: #2976d3;
  font-weight: 500;
}

/* 添加下划线效果 */
.nav-active::after,
.nav-active-exact::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #2976d3;
}
</style>
