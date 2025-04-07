<template>
    <div class="course-card bg-white rounded shadow-md p-4">
      <img :src="course.image" alt="课程图片" class="w-full h-32 object-cover rounded mb-2" />
      <div class="text-lg font-semibold mb-1">{{ course.title }}</div>
      <div class="text-sm text-gray-500 mb-2">{{ course.university }}</div>
      <el-button type="primary" size="small">认证学习</el-button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from 'vue'
  
  const props = defineProps({
    course: {
      type: Object,
      required: true
    }
  })
  </script>
  
  <style scoped>
  .course-card {
    width: 200px;
  }
  </style>