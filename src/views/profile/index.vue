<template>
  <div class="bg-[#f5f5f5] py-4">
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="bg-white p-4 rounded-lg mb-4">
        <el-skeleton :rows="10" animated />
      </div>
      
      <template v-else>
        <!-- 用户信息头部 -->
        <div class="bg-white p-6 rounded-lg mb-4">
          <div class="flex items-start">
            <img
              :src="profileData.avatar || '/src/assets/avatar-default.png'"
              alt="用户头像"
              class="w-24 h-24 rounded-full mr-6 cursor-pointer"
              @click="goToChat"
            />
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h1 class="text-2xl font-bold mr-2">{{ profileData.username }}</h1>
                <el-tag v-if="isCurrentUser" size="small">我的主页</el-tag>
              </div>
              <div class="text-gray-500 mb-4">{{ profileData.bio || '这个人很懒，什么都没留下...' }}</div>
              <div class="flex items-center text-sm">
                <div 
                  class="mr-6 cursor-pointer hover:text-blue-500" 
                  @click="showFollowDialog('following')"
                >
                  <span class="font-medium">{{ profileData.followingCount || 0 }}</span> 关注
                </div>
                <div 
                  class="mr-6 cursor-pointer hover:text-blue-500" 
                  @click="showFollowDialog('followers')"
                >
                  <span class="font-medium">{{ profileData.followersCount || 0 }}</span> 粉丝
                </div>
                <div>
                  <span class="font-medium">{{ profileData.likeCount || 0 }}</span> 获赞
                </div>
              </div>
            </div>
            <div v-if="!isCurrentUser">
              <el-button 
                :type="isFollowed ? 'default' : 'primary'" 
                @click="toggleFollow"
              >
                {{ isFollowed ? '已关注' : '关注' }}
              </el-button>
            </div>
            <div v-else>
              <el-button type="primary" plain @click="showEditDialog">编辑资料</el-button>
            </div>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="bg-white rounded-lg">
          <div class="border-b">
            <div class="flex">
              <div 
                v-for="tab in tabs" 
                :key="tab.key"
                class="px-6 py-3 cursor-pointer text-center"
                :class="{'border-b-2 border-blue-500 text-blue-500 font-medium': activeTab === tab.key}"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </div>
            </div>
          </div>
          
          <!-- 视频列表 -->
          <div v-if="activeTab === 'videos'" class="p-4">
            <div v-if="userVideos.length === 0" class="py-8 text-center text-gray-500">
              暂无视频
            </div>
            <div v-else class="grid grid-cols-4 gap-4">
              <div v-for="video in userVideos" :key="video.id" class="video-item">
                <div class="relative cursor-pointer" @click="goToVideo(video.id)">
                  <img
                    :src="video.cover"
                    alt="视频封面"
                    class="w-full aspect-video object-cover rounded"
                  />
                  <div class="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {{ video.duration || '00:00' }}
                  </div>
                </div>
                <div class="mt-2">
                  <div class="text-sm font-medium line-clamp-2">{{ video.title }}</div>
                  <div class="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>{{ video.views }}次观看</span>
                    <span>{{ formatDate(video.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 收藏列表 -->
          <div v-else-if="activeTab === 'favorites'" class="p-4">
            <div v-if="favoriteVideos.length === 0" class="py-8 text-center text-gray-500">
              暂无收藏
            </div>
            <div v-else class="grid grid-cols-4 gap-4">
              <div v-for="video in favoriteVideos" :key="video.id" class="video-item">
                <div class="relative cursor-pointer" @click="goToVideo(video.id)">
                  <img
                    :src="video.cover"
                    alt="视频封面"
                    class="w-full aspect-video object-cover rounded"
                  />
                  <div class="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {{ video.duration || '00:00' }}
                  </div>
                </div>
                <div class="mt-2">
                  <div class="text-sm font-medium line-clamp-2">{{ video.title }}</div>
                  <div class="flex justify-between items-center mt-1 text-xs text-gray-500">
                      <span>{{ video.views }}次观看</span>
                    <span>{{ formatDate(video.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 历史记录 -->
          <div v-else-if="activeTab === 'history'" class="p-4">
            <div v-if="historyVideos.length === 0" class="py-8 text-center text-gray-500">
              暂无历史记录
            </div>
            <div v-else class="space-y-4">
              <div v-for="video in historyVideos" :key="video.id" class="flex cursor-pointer" @click="goToVideo(video.video.id)">
                <div class="relative w-1/5">
                  <img
                    :src="video.video.cover"
                    alt="视频封面"
                    class="w-full aspect-video object-cover rounded"
                  />
                  <div class="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {{ video.video.duration || '00:00' }}
                  </div>
                </div>
                <div class="w-4/5 pl-4">
                  <h3 class="text-base font-medium mb-2">{{ video.video.title }}</h3>
                  <div class="flex items-center text-xs text-gray-500">
                    <div class="flex items-center mr-4">
                      <img
                        :src="video.user?.avatar ? getCompleteFileUrl(video.user.avatar) : '/src/assets/avatar-default.png'"
                        class="w-5 h-5 rounded-full mr-1"
                        alt="用户头像"
                      />
                      <span>{{ video.user?.username }}</span>
                    </div>
                    <div class="mr-4">{{ video.video.views }}次观看</div>
                    <div>观看于 {{ formatDate(video.video.viewedAt || video.video.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <!-- 关注/粉丝弹窗 -->
      <el-dialog
        v-model="followDialogVisible"
        :title="followDialogType === 'following' ? '关注列表' : '粉丝列表'"
        width="30%"
      >
        <div v-if="followList.length === 0" class="py-4 text-center text-gray-500">
          {{ followDialogType === 'following' ? '暂无关注' : '暂无粉丝' }}
        </div>
        <div v-else class="max-h-80 overflow-y-auto">
          <div 
            v-for="user in followList" 
            :key="user.id" 
            class="flex items-center py-3 border-b last:border-0"
          >
            <img
              :src="user.avatar ? getCompleteFileUrl(user.avatar) : '/src/assets/avatar-default.png'"
              class="w-10 h-10 rounded-full mr-3"
              alt="用户头像"
            />
            <div class="flex-1">
              <div class="font-medium">{{ user.username }}</div>
              <div class="text-xs text-gray-500">{{ user.bio || '这个人很懒，什么都没留下...' }}</div>
            </div>
            <el-button 
              v-if="user.id !== userStore.userId"
              size="small"
              :type="user.isFollowed ? 'default' : 'primary'"
              @click="toggleFollowUser(user)"
            >
              {{ user.isFollowed ? '已关注' : '关注' }}
            </el-button>
          </div>
        </div>
      </el-dialog>
      
      <!-- 编辑个人资料弹窗 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑个人资料"
        width="30%"
        class="user-profile-dialog"
        :close-on-click-modal="false"
      >
        <el-tabs v-model="activeEditTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="editForm.username"   :disabled="true"  placeholder="请输入用户名" maxlength="20" show-word-limit />
              </el-form-item>
              <el-form-item label="个人简介" prop="bio">
                <el-input 
                  v-model="editForm.bio" 
                  type="textarea" 
                  rows="3" 
                  placeholder="介绍一下自己吧..."
                  maxlength="200"
                  show-word-limit 
                />
              </el-form-item>
              <el-form-item label="头像">
                <div class="flex items-center">
                  <div class="relative group w-16 h-16 rounded-full overflow-hidden">
                    <img
                      :src="editForm.avatarPreview || (editForm.avatar ? getCompleteFileUrl(editForm.avatar) : '/src/assets/avatar-default.png')"
                      class="w-full h-full object-cover"
                      alt="头像预览"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <el-icon class="text-white text-xl cursor-pointer" @click="triggerAvatarUpload">
                        <i-ep-camera />
                      </el-icon>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    class="hidden"
                    ref="avatarInput"
                    @change="handleAvatarChange"
                  />
                  <div class="ml-4">
                    <el-button type="primary" size="small" @click="triggerAvatarUpload">更换头像</el-button>
                    <div class="text-xs text-gray-500 mt-1">支持JPG、PNG、GIF格式，最大2MB</div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="修改密码" name="password">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input 
                  v-model="passwordForm.currentPassword" 
                  type="password" 
                  placeholder="请输入当前密码" 
                  show-password
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  placeholder="请输入新密码" 
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入新密码" 
                  show-password
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelEdit">取消</el-button>
            <el-button 
              type="primary" 
              @click="updateProfile" 
              :loading="submitting"
            >
              确认
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videoApi, userApi, uploadApi } from '../../services/api';
import { useUserStore } from '../../store/user';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';

// 设置一些基础类型
interface ProfileData {
  id: number;
  username: string;
  avatar: string;
  bio: string;
  followingCount: number;
  followersCount: number;
  likeCount: number;
}

interface VideoItem {
  id: number;
  title: string;
  description?: string;
  cover: string;
  videoUrl: string;
  duration?: string;
  views: number;
  createdAt: string;
  [key: string]: any;
}

interface HistoryItem {
  id: number;
  video: VideoItem;
  user?: any;
  viewedAt?: string;
  [key: string]: any;
}

interface UserItem {
  id: number;
  username: string;
  avatar?: string;
  bio?: string;
  isFollowed?: boolean;
  [key: string]: any;
}

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 添加辅助函数处理文件URL
const getCompleteFileUrl = (filePath: string): string => {
  // 如果是空值则返回空字符串
  if (!filePath) {
    return '';
  }
  
  // 如果已经是完整URL，则直接返回
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // 获取环境变量中的服务器地址，默认为本地开发环境
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  // 如果以uploads开头，意味着是上传路径
  if (filePath.startsWith('/uploads/') || filePath.startsWith('uploads/')) {
    // 规范化路径
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${API_BASE_URL}${normalizedPath}`;
  }
  
  // 其他情况，确保添加uploads前缀
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${API_BASE_URL}/uploads${normalizedPath}`;
};

// 用户ID，如果路由参数没有则使用当前登录用户ID
const userId = computed(() => {
  return route.params.id ? Number(route.params.id) : userStore.userId;
});

// 是否为当前登录用户的个人主页
const isCurrentUser = computed(() => {
  return userId.value === userStore.userId;
});

// 状态数据
const isLoading = ref(true);
const profileData = ref<ProfileData>({
  id: 0,
  username: '',
  avatar: '',
  bio: '',
  followingCount: 0,
  followersCount: 0,
  likeCount: 0
});
const isFollowed = ref(false);
const activeTab = ref('videos');
const userVideos = ref<VideoItem[]>([]);
const favoriteVideos = ref<VideoItem[]>([]);
const historyVideos = ref<HistoryItem[]>([]);
const followDialogVisible = ref(false);
const followDialogType = ref('following'); // 'following' 或 'followers'
const followList = ref<UserItem[]>([]);
const editDialogVisible = ref(false);
const activeEditTab = ref('basic');
const submitting = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);
const editFormRef = ref<FormInstance | null>(null);
const passwordFormRef = ref<FormInstance | null>(null);

const editForm = reactive({
  username: '',
  bio: '',
  avatar: '',
  avatarPreview: '',
  avatarFile: null as File | null
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应为2-20个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介最多200个字符', trigger: 'blur' }
  ]
};

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// 标签页配置
const tabs = [
  { key: 'videos', label: '发布的视频' },
  { key: 'favorites', label: '收藏的视频' },
  { key: 'history', label: '观看历史' }
];

// 加载用户资料
const loadUserProfile = async () => {
  try {
    isLoading.value = true;
    const response = await userApi.getUserProfile(userId.value);
    const profileResponse = response as unknown as ProfileData;
    
    // 确保头像URL是完整路径
    profileData.value = {
      ...profileResponse,
      avatar: profileResponse.avatar ? getCompleteFileUrl(profileResponse.avatar) : ''
    };
    
    // 检查是否已关注该用户
    if (userStore.isLoggedIn && !isCurrentUser.value) {
      const following = await userApi.getFollowing(userStore.userId);
      isFollowed.value = Array.isArray(following) && following.some((user: UserItem) => user.id === userId.value);
    }
    
    // 加载第一个标签页的数据
    loadTabData(activeTab.value);
  } catch (error) {
    console.error('获取用户资料失败:', error);
    ElMessage.error('获取用户资料失败');
  } finally {
    isLoading.value = false;
  }
};

// 根据当前标签页加载数据
const loadTabData = async (tab: string) => {
  try {
    switch (tab) {
      case 'videos':
        const videosRes = await userApi.getUserVideos(userId.value);
        // 处理视频列表，确保封面图片URL是完整路径
        userVideos.value = ((videosRes as unknown) as VideoItem[]).map(video => ({
          ...video,
          cover: video.cover ? getCompleteFileUrl(video.cover) : ''
        }));
        break;
      case 'favorites':
        const favoritesRes = await userApi.getUserFavorites(userId.value);
        // 处理收藏列表，确保封面图片URL是完整路径
        favoriteVideos.value = ((favoritesRes as unknown) as VideoItem[]).map(video => ({
          ...video,
          cover: video.cover ? getCompleteFileUrl(video.cover) : ''
        }));
        break;
      case 'history':
        if (isCurrentUser.value) {
          const historyRes = await userApi.getViewHistory(userId.value);
          // 处理历史记录，确保视频封面和用户头像URL是完整路径
          historyVideos.value = ((historyRes as unknown) as HistoryItem[]).map(item => ({
            ...item,
            video: {
              ...item.video,
              cover: item.video.cover ? getCompleteFileUrl(item.video.cover) : ''
            },
            user: item.user ? {
              ...item.user,
              avatar: item.user.avatar ? getCompleteFileUrl(item.user.avatar) : ''
            } : undefined
          }));
        }
        break;
    }
  } catch (error) {
    console.error(`加载${tab}数据失败:`, error);
    ElMessage.error(`加载数据失败`);
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}分钟前`;
    }
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// 关注/取消关注用户
const toggleFollow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }

  try {
    if (isFollowed.value) {
      await userApi.unfollowUser(userId.value);
      isFollowed.value = false;
      profileData.value.followersCount--;
      ElMessage.success('已取消关注');
    } else {
      await userApi.followUser(userId.value);
      isFollowed.value = true;
      profileData.value.followersCount++;
      ElMessage.success('关注成功');
    }
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败，请稍后再试');
  }
};

// 关注/取消关注弹窗中的用户
const toggleFollowUser = async (user: UserItem) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    return;
  }

  try {
    if (user.isFollowed) {
      await userApi.unfollowUser(user.id);
      user.isFollowed = false;
      ElMessage.success('已取消关注');
    } else {
      await userApi.followUser(user.id);
      user.isFollowed = true;
      ElMessage.success('关注成功');
    }
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败，请稍后再试');
  }
};

// 显示关注/粉丝弹窗
const showFollowDialog = async (type: 'following' | 'followers') => {
  followDialogType.value = type;
  followDialogVisible.value = true;
  
  try {
    if (type === 'following') {
      const following = await userApi.getFollowing(userId.value);
      // 处理返回的数据，确保头像URL是完整路径
      followList.value = ((following as unknown) as UserItem[]).map(user => ({
        ...user,
        avatar: user.avatar ? getCompleteFileUrl(user.avatar) : ''
      }));
    } else {
      const followers = await userApi.getFollowers(userId.value);
      // 处理返回的数据，确保头像URL是完整路径
      followList.value = ((followers as unknown) as UserItem[]).map(user => ({
        ...user,
        avatar: user.avatar ? getCompleteFileUrl(user.avatar) : ''
      }));
    }
    
    // 标记已关注的用户
    if (userStore.isLoggedIn) {
      const myFollowing = await userApi.getFollowing(userStore.userId);
      const followingIds = ((myFollowing as unknown) as UserItem[]).map((user: UserItem) => user.id);
      
      followList.value = followList.value.map(user => ({
        ...user,
        isFollowed: followingIds.includes(user.id)
      }));
    }
  } catch (error) {
    console.error('获取关注/粉丝列表失败:', error);
    ElMessage.error('获取列表失败');
  }
};

// 显示编辑资料弹窗
const showEditDialog = () => {
  editForm.username = profileData.value.username;
  editForm.bio = profileData.value.bio || '';
  editForm.avatar = profileData.value.avatar || ''; // 这里使用的是已经处理过的完整URL
  editForm.avatarPreview = '';
  editForm.avatarFile = null;
  
  // 清空密码表单
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  
  // 默认显示基本信息标签页
  activeEditTab.value = 'basic';
  
  editDialogVisible.value = true;
};

// 取消编辑
const cancelEdit = () => {
  editDialogVisible.value = false;
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields();
  }
};

// 更新个人资料
const updateProfile = async () => {
  // 根据当前激活的标签页验证不同的表单
  if (activeEditTab.value === 'basic') {
    // 验证基本信息表单
    if (!editFormRef.value) return;
    
    await editFormRef.value.validate(async (valid) => {
      if (!valid) return;
      
      try {
        submitting.value = true;
        
        // 如果有新头像，先上传
        if (editForm.avatarFile) {
          try {
            // 确保token存在
            const token = userStore.token || localStorage.getItem('token');
            if (!token) {
              throw new Error('未登录，无法上传头像');
            }
            
            // 使用API服务上传头像
            editForm.avatar = await uploadApi.uploadAvatar(
              editForm.avatarFile, 
              token
            );
            console.log("上传头像成功，URL:", editForm.avatar);
          } catch (error) {
            console.error('上传头像失败:', error);
            ElMessage.error('上传头像失败，请重试');
            submitting.value = false;
            return;
          }
        }
        
        // 更新用户资料
        const updateData = {
          username: editForm.username,
          bio: editForm.bio || '',
          // 如果avatar为空字符串，传null或不传
          avatar: editForm.avatar || null
        };
        
        // 确保用户已登录
        if (!userStore.isLoggedIn) {
          ElMessage.error('未登录状态，无法更新资料');
          submitting.value = false;
          return;
        }
        
        const id = userId.value;
        const result = await userApi.updateProfile(updateData, id);
        console.log("更新资料结果:", result);
        
        // 使用API返回的数据更新当前显示
        if (result && typeof result === 'object') {
          // 使用类型断言转换响应结果
          const userData = result as { username?: string; bio?: string; avatar?: string };
          
          // 处理头像URL，确保是完整URL
          const avatarUrl = userData.avatar ? getCompleteFileUrl(userData.avatar) : 
                           (editForm.avatar ? getCompleteFileUrl(editForm.avatar) : profileData.value.avatar);
          
          // 更新当前页面显示的资料
          profileData.value = {
            ...profileData.value,
            username: userData.username || updateData.username,
            bio: userData.bio || updateData.bio,
            avatar: avatarUrl
          };
          
          // 更新store中的用户信息
          userStore.updateUserInfo({
            username: userData.username || updateData.username,
            avatar: avatarUrl
          });
        } else {
          // 如果没有返回有效数据，使用更新前的数据更新UI
          
          // 处理头像URL，确保是完整URL
          const avatarUrl = editForm.avatar ? getCompleteFileUrl(editForm.avatar) : profileData.value.avatar;
          
          profileData.value = {
            ...profileData.value,
            username: updateData.username,
            bio: updateData.bio,
            avatar: avatarUrl
          };
          
          // 更新store中的用户信息
          userStore.updateUserInfo({
            username: updateData.username,
            avatar: avatarUrl
          });
        }
        
        ElMessage.success('资料更新成功');
        editDialogVisible.value = false;
      } catch (error) {
        console.error('更新资料失败:', error);
        ElMessage.error('更新资料失败，请稍后再试');
      } finally {
        submitting.value = false;
      }
    });
  } else {
    // 验证密码表单
    if (!passwordFormRef.value) return;
    
    await passwordFormRef.value.validate(async (valid) => {
      if (!valid) return;
      
      try {
        submitting.value = true;
        
        // 确保用户已登录
        if (!userStore.isLoggedIn) {
          ElMessage.error('未登录状态，无法修改密码');
          submitting.value = false;
          return;
        }
        
        // 调用修改密码API - 只提交密码相关信息，不涉及用户资料
        await userApi.updatePassword(
          passwordForm.currentPassword,
          passwordForm.newPassword
        );
        
        ElMessage.success('密码修改成功');
        editDialogVisible.value = false;
      } catch (error) {
        console.error('修改密码失败:', error);
        ElMessage.error('修改密码失败，请检查当前密码是否正确');
      } finally {
        submitting.value = false;
      }
    });
  }
};

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

// 处理头像文件变化
const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  
  // 检查文件类型
  const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
  if (!isValidType) {
    ElMessage.error('请上传JPG、PNG或GIF格式的图片');
    return;
  }
  
  // 检查文件大小
  const isValidSize = file.size / 1024 / 1024 < 2;
  if (!isValidSize) {
    ElMessage.error('图片大小不能超过2MB');
    return;
  }
  
  // 预览图片
  const reader = new FileReader();
  reader.onload = (e) => {
    editForm.avatarPreview = e.target?.result as string;
  }
  reader.readAsDataURL(file);
  
  // 保存文件对象
  editForm.avatarFile = file;
};

// 跳转到视频详情页
const goToVideo = (id: number) => {
  router.push(`/video?id=${id}`);
};

// 前往聊天页面
const goToChat = () => {
  // 如果是访问自己的主页，不执行任何操作
  if (isCurrentUser.value) return;
  
  // 前往与该用户的聊天页面
  router.push(`/chat/${userId.value}`);
};

// 监听标签页变化
watch(activeTab, (newTab) => {
  loadTabData(newTab);
});

onMounted(() => {
  loadUserProfile();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.user-profile-dialog :deep(.el-dialog__body) {
  padding-top: 0;
}
</style>