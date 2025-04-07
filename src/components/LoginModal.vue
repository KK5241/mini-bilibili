<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isLoginMode ? '登录' : '注册'"
    width="400px"
    center
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
      class="mt-5"
      :disabled="userStore.loading"
    >
      <el-form-item label="账号" prop="username">
        <el-input 
          v-model="form.username"
          placeholder="请输入账号"
          :prefix-icon="User"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          show-password
        ></el-input>
      </el-form-item>
      
      <template v-if="!isLoginMode">
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            placeholder="简单介绍一下自己吧"
            :rows="2"
          ></el-input>
        </el-form-item>
      </template>
      
      <div class="text-right mb-4" v-if="isLoginMode">
        <el-link type="primary" :underline="false">忘记密码</el-link>
      </div>
    </el-form>
    
    <div class="flex justify-between w-full">
      <el-button 
        class="w-[48%]" 
        @click="dialogVisible = false"
        :disabled="userStore.loading"
      >取消</el-button>
      <el-button 
        type="primary" 
        class="w-[48%]" 
        @click="handleSubmit"
        :loading="userStore.loading"
      >
        {{ isLoginMode ? '登录' : '注册' }}
      </el-button>
    </div>
    
    <div class="text-center mt-4">
      <span class="text-gray-500">{{ isLoginMode ? '还没有账号？' : '已有账号？' }}</span>
      <el-link 
        type="primary" 
        :underline="false" 
        @click="toggleMode"
        :disabled="userStore.loading"
      >
        {{ isLoginMode ? '立即注册' : '去登录' }}
      </el-link>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineExpose } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import type { FormInstance, FormRules } from 'element-plus'

const userStore = useUserStore()
const dialogVisible = ref(false)
const isLoginMode = ref(true)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  bio: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在3到20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

const resetForm = () => {
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  form.bio = ''
  formRef.value?.resetFields()
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    let success = false
    
    if (isLoginMode.value) {
      // 登录逻辑
      success = await userStore.login(form.username, form.password)
    } else {
      // 注册逻辑
      success = await userStore.register({
        username: form.username,
        password: form.password,
        bio: form.bio || undefined
      })
    }
    
    if (success) {
      dialogVisible.value = false
      resetForm()
    }
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const open = () => {
  dialogVisible.value = true
  isLoginMode.value = true
  resetForm()
}

defineExpose({
  open
})
</script> 