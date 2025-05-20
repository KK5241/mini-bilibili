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

      <el-form-item label="验证码" prop="captcha" style="flex-wrap: nowrap">
        <div class="flex flex-nowrap">
          <el-input
            v-model="form.captcha"
            placeholder="请输入验证码"
            :prefix-icon="Lock"
          ></el-input>
          <img
            @click="changeCaptcha"
            :src="captcha"
            alt=""
            style="height: 32px; width: 120px; margin-left: 20px"
          />
        </div>
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
        >取消</el-button
      >
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
      <span class="text-gray-500">{{
        isLoginMode ? '还没有账号？' : '已有账号？'
      }}</span>
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
import { ref, reactive, defineExpose, onMounted } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import { socketService } from '../services/socket'
import { chatApi, videoApi } from '../services/api'
import type { FormInstance, FormRules } from 'element-plus'

const userStore = useUserStore()
const dialogVisible = ref(false)
const isLoginMode = ref(true)
const formRef = ref<FormInstance>()
const captcha = ref('')
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  bio: '',
  captcha: '',
})

const changeCaptcha = () => {
  captcha.value = `http://localhost:3000/captcha?${Date.now()}`
}

const validateConfirmPassword = (
  rule: any,
  value: string,
  callback: Function,
) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在3到20个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
})

const resetForm = () => {
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  form.bio = ''
  formRef.value?.resetFields()
}
onMounted(async () => {
  captcha.value = `http://localhost:3000/captcha?${Date.now()}`
})
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
      success = await userStore.login(
        form.username,
        form.password,
        form.captcha,
      )
    } else {
      // 注册逻辑
      success = await userStore.register({
        username: form.username,
        password: form.password,
        bio: form.bio || undefined,
      })
    }

    if (success) {
      dialogVisible.value = false
      resetForm()

      // 登录成功后初始化WebSocket连接
      socketService.init()

      // 获取最新的未读消息数并广播更新
      try {
        // 等待用户附加信息获取完成
        // 注意：login/register方法内部已经调用了fetchUserAdditionalInfo，
        // 但这里我们可以等待一下以确保数据都已更新
        await new Promise((resolve) => setTimeout(resolve, 100))

        const count = await chatApi.getUnreadCount()
        const unreadCount = typeof count === 'number' ? count : 0

        // 更新本地存储
        localStorage.setItem('unreadMessageCount', String(unreadCount))

        // 触发自定义事件通知其他组件更新
        window.dispatchEvent(
          new CustomEvent('unreadCountUpdated', {
            detail: unreadCount,
          }),
        )

        // 触发附加的自定义事件，通知其他组件用户已登录并且store已更新
        window.dispatchEvent(
          new CustomEvent('userLoggedIn', {
            detail: {
              userId: userStore.userId,
              username: userStore.username,
              lastLogin: userStore.lastLogin,
            },
          }),
        )

        // 刷新页面以应用新的登录状态
        window.location.reload()
      } catch (error) {
        console.error('获取未读消息数量失败:', error)
      }
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
  open,
})
</script>
