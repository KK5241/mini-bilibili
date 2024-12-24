<template>
  <button @click="open">登陆</button>
  <!-- <el-button plain @click="open">Click to open the Message Box</el-button> -->
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import type { Action } from "element-plus";

const open = () => {
  ElMessageBox.alert("This is a message", "", {
    // if you want to disable its autofocus
    // autofocus: false,
    confirmButtonText: "OK",
    callback: (action: Action) => {
      ElMessage({
        type: "info",
        message: `action: ${action}`,
      });
    },
  });
};
</script>

<style lang="scss" scoped></style>
