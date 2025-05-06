<template>
  <div class="bg-gradient-to-b from-[#e9f5ff] via-[#f0f3f7] to-[#f5f5f5]">
    <div class="text-[40px] text-[#333] font-bold text-center py-12">
      合作学校
    </div>
    <div class="container flex flex-wrap justify-between">
      <div
        v-for="(img, index) in images"
        :index="index"
        class="h-[145px] w-[280px] bg-white rounded-xl shrink-0 my-4 flex justify-center items-center"
      >
        <img :src="img.src" :alt="img.name" class="h-[60px] w-[164px]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

<style scoped></style>
