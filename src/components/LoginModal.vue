<template>
  <el-dialog v-model="dialogVisible" title="登录/注册" width="400px" center>
    <div class="flex justify-center mb-6">
      <div class="rounded-full bg-gray-100 w-20 h-20 flex justify-center items-center">
        <img src="@/assets/avatar-default.png" alt="" class="w-16 h-16 rounded-full" />
      </div>
    </div>
    <el-form :model="form" label-width="80px">
      <el-form-item label="账号">
        <el-input v-model="form.username" placeholder="请输入账号"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <div class="text-right mb-4">
        <el-link type="primary" :underline="false">忘记密码</el-link>
      </div>
    </el-form>
    <div class="flex justify-between w-full">
      <el-button class="w-[48%]" @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" class="w-[48%]" @click="handleLogin">登录</el-button>
    </div>
    <div class="text-center mt-4">
      <span class="text-gray-500">还没有账号？</span>
      <el-link type="primary" :underline="false" @click="handleRegister">立即注册</el-link>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const form = ref({
  username: '',
  password: ''
})

const handleLogin = () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  
  // 这里添加登录逻辑
  ElMessage.success('登录成功')
  dialogVisible.value = false
}

const handleRegister = () => {
  // 这里添加注册逻辑或切换到注册页面
  ElMessage.info('暂未开放注册功能')
}

const open = () => {
  dialogVisible.value = true
}

defineExpose({
  open
})
</script> 