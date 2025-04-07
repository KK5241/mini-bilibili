<template>
  <div class="bg-[#f5f5f5] h-full container">
    <!-- 其他内容 -->
    <div class="grid grid-cols-4 gap-4 mt-4">
      <CourseCard v-for="course in courses" :key="course.id" :course="course" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CourseCard from './courseCard.vue'
import { ref } from 'vue'

const courses = ref([
  {
    id: 1,
    image: '@/assets/course1.png',
    title: '高等数学（一）',
    university: '国防科技大学'
  },
  {
    id: 2,
    image: '@/assets/course2.png',
    title: '机械设计基础',
    university: '西安交通大学'
  },
  // 添加更多课程数据
])
</script>
