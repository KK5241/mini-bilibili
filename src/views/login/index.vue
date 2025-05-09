<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <h2>登录</h2>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            class="login-button" 
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
};

const handleLogin = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    loading.value = true;
    await userStore.login(form.username, form.password);
    
    ElMessage.success('登录成功');
    
    // 如果是管理员，导航到管理页面
    if (userStore.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  } catch (error) {
    ElMessage.error('登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
}

.login-button {
  width: 100%;
}
</style> 