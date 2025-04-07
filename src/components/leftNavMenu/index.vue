<template>
  <div class="left-nav-menu">
    <div class="menu-title">国家精品</div>
    <div class="menu-item hot-item">
      <span class="hot-icon">🔥 考研</span>
      <span class="sub-menu">数学 / 英语 / 政治 / 专业课</span>
    </div>
    <div class="menu-item hot-item">
      <span class="hot-icon">🔥 期末突击</span>
      <span class="sub-menu">数学 / 物理 / 计算机</span>
    </div>
    
    <div class="menu-item">
      <span >计算机</span>
      <span class="sub-menu">大数据与人工智能 / 编程</span>
    </div>
    <div class="menu-item">
      <span > 外语</span>
      <span class="sub-menu">听力/口语 / 写作/翻译</span>
    </div>
    <div class="menu-item">
      <span>生活相关</span>
      <span class="sub-menu">菜谱 / 音乐 / 阅读</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
.left-nav-menu {
  width: 100%;
  height: 100%;
  padding: 8px 0;
}

.menu-title {
  font-weight: bold;
  font-size: 16px;
  padding: 8px 14px;
  color: #333;
}

.menu-item {
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.menu-item:hover {
  background-color: #f5f9ff;
  color: #2976d3;
}

.hot-icon {
  display: inline-block;
  margin-right: 4px;
  color: #ff3f29;
}

.hot-item {
  color: #333;
  font-weight: 500;
}

.sub-menu {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
</style>
