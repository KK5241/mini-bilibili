<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="showAddUserDialog"
            >新增用户</el-button
          >
        </div>
      </template>

      <el-empty v-if="users.length === 0" description="暂无用户数据" />

      <el-table v-else :data="users" v-loading="loading" >
        <el-table-column prop="id" label="ID" width="80" align="center"/>
        <el-table-column prop="username" label="用户名" align="center"/>
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar
              :src="
                row.avatar !== null
                  ? `http://localhost:3000${row.avatar}`
                  : `../../assets/images/avatar.png`
              "
              :size="40"
            ></el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="followers" label="粉丝数" width="80" align="center"/>
        <el-table-column prop="following" label="关注数" width="80" align="center"/>
        <el-table-column prop="createdAt" label="注册时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                style="margin-left: 10px;"
                @click="handleDelete(row)"
                :disabled="row.role === 'admin'"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑用户" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editForm.bio" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitting">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="addUserDialogVisible" title="新增用户" width="500px">
      <el-form
        :model="addUserForm"
        :rules="addUserRules"
        ref="addUserFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="addUserForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="addUserForm.role" placeholder="请选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input
            v-model="addUserForm.bio"
            type="textarea"
            rows="3"
            placeholder="请输入用户简介"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitAddUser"
            :loading="submitting"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { adminApi } from '@/services/api'

interface User {
  id: number
  username: string
  role: string
  avatar?: string
  followers: number
  following: number
  bio?: string
  createdAt: string
}

const users = ref<User[]>([])
const loading = ref(false)
const submitting = ref(false)
const editDialogVisible = ref(false)
const addUserDialogVisible = ref(false)
const currentUser = ref<User | null>(null)
const addUserFormRef = ref()

const editForm = ref({
  username: '',
  role: '',
  bio: '',
})

const addUserForm = ref({
  username: '',
  password: '',
  role: 'user',
  bio: '',
})

const addUserRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await adminApi.getAllUsers()
    console.log('response', response)
    if (Array.isArray(response)) {
      users.value = response
      console.log('users', users.value)
    } else {
      users.value = []
      console.error('API返回的数据格式不正确:', response)
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
    users.value = []
  } finally {
    loading.value = false
  }
}

const handleEdit = (user: User) => {
  currentUser.value = user
  editForm.value = {
    username: user.username || '',
    role: user.role || 'user',
    bio: user.bio || '',
  }
  editDialogVisible.value = true
}

const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${user.username} 吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true
    await adminApi.deleteUser(user.id)
    ElMessage.success('删除用户成功')
    fetchUsers()
  } catch (error: any) {
    if (
      error !== 'cancel' &&
      error.toString() !== 'Error: Operation canceled'
    ) {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  } finally {
    loading.value = false
  }
}

const submitEdit = async () => {
  if (!currentUser.value) return

  submitting.value = true
  try {
    await adminApi.updateUser(currentUser.value.id, editForm.value)
    ElMessage.success('更新用户成功')
    editDialogVisible.value = false
    fetchUsers()
  } catch (error) {
    console.error('更新用户失败:', error)
    ElMessage.error('更新用户失败')
  } finally {
    submitting.value = false
  }
}

const showAddUserDialog = () => {
  addUserForm.value = {
    username: '',
    password: '',
    role: 'user',
    bio: '',
  }
  addUserDialogVisible.value = true
}

const submitAddUser = async () => {
  if (!addUserFormRef.value) return

  try {
    await addUserFormRef.value.validate()

    submitting.value = true
    try {
      await adminApi.createUser(addUserForm.value)
      ElMessage.success('添加用户成功')
      addUserDialogVisible.value = false
      fetchUsers()
    } catch (error: any) {
      console.error('添加用户失败:', error)
      ElMessage.error(error.response?.data?.message || '添加用户失败')
    } finally {
      submitting.value = false
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleString()
  } catch (e) {
    return dateString
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
