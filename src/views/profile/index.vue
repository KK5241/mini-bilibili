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
              class="w-24 h-24 rounded-full mr-6"
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
              <div v-for="video in historyVideos" :key="video.id" class="flex cursor-pointer" @click="goToVideo(video.id)">
                <div class="relative w-1/5">
                  <img
                    :src="video.cover"
                    alt="视频封面"
                    class="w-full aspect-video object-cover rounded"
                  />
                  <div class="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                    {{ video.duration || '00:00' }}
                  </div>
                </div>
                <div class="w-4/5 pl-4">
                  <h3 class="text-base font-medium mb-2">{{ video.title }}</h3>
                  <div class="flex items-center text-xs text-gray-500">
                    <div class="flex items-center mr-4">
                      <img
                        :src="video.user?.avatar || '/src/assets/avatar-default.png'"
                        class="w-5 h-5 rounded-full mr-1"
                        alt="用户头像"
                      />
                      <span>{{ video.user?.username }}</span>
                    </div>
                    <div class="mr-4">{{ video.views }}次观看</div>
                    <div>观看于 {{ formatDate(video.viewedAt || video.createdAt) }}</div>
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
              :src="user.avatar || '/src/assets/avatar-default.png'"
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
      >
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input v-model="editForm.bio" type="textarea" rows="3" />
          </el-form-item>
          <el-form-item label="头像">
            <div class="flex items-center">
              <img
                :src="editForm.avatar || '/src/assets/avatar-default.png'"
                class="w-16 h-16 rounded-full mr-4"
                alt="头像预览"
              />
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
              >
                <el-button type="primary">更换头像</el-button>
              </el-upload>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="updateProfile">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videoApi, userApi } from '../../services/api';
import { useUserStore } from '../../store/user';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

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
const profileData = ref({
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
const userVideos = ref([]);
const favoriteVideos = ref([]);
const historyVideos = ref([]);
const followDialogVisible = ref(false);
const followDialogType = ref('following'); // 'following' 或 'followers'
const followList = ref([]);
const editDialogVisible = ref(false);
const editForm = ref({
  username: '',
  bio: '',
  avatar: ''
});

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
    profileData.value = response;
    
    // 检查是否已关注该用户
    if (userStore.isLoggedIn && !isCurrentUser.value) {
      const following = await userApi.getFollowing(userStore.userId);
      isFollowed.value = following.some(user => user.id === userId.value);
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
const loadTabData = async (tab) => {
  try {
    switch (tab) {
      case 'videos':
        const videosRes = await userApi.getUserVideos(userId.value);
        userVideos.value = videosRes;
        break;
      case 'favorites':
        const favoritesRes = await userApi.getUserFavorites(userId.value);
        favoriteVideos.value = favoritesRes;
        break;
      case 'history':
        if (isCurrentUser.value) {
          const historyRes = await userApi.getViewHistory(userId.value);
          historyVideos.value = historyRes;
        }
        break;
    }
  } catch (error) {
    console.error(`加载${tab}数据失败:`, error);
    ElMessage.error(`加载数据失败`);
  }
};

// 格式化日期
const formatDate = (dateString) => {
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
const toggleFollowUser = async (user) => {
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
const showFollowDialog = async (type) => {
  followDialogType.value = type;
  followDialogVisible.value = true;
  
  try {
    if (type === 'following') {
      const following = await userApi.getFollowing(userId.value);
      followList.value = following;
    } else {
      const followers = await userApi.getFollowers(userId.value);
      followList.value = followers;
    }
    
    // 标记已关注的用户
    if (userStore.isLoggedIn) {
      const myFollowing = await userApi.getFollowing(userStore.userId);
      const followingIds = myFollowing.map(user => user.id);
      
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
  editForm.value = {
    username: profileData.value.username,
    bio: profileData.value.bio || '',
    avatar: profileData.value.avatar
  };
  editDialogVisible.value = true;
};

// 更新个人资料
const updateProfile = async () => {
  try {
    await userApi.updateProfile(editForm.value);
    ElMessage.success('资料更新成功');
    
    // 更新当前页面显示的资料
    profileData.value = {
      ...profileData.value,
      ...editForm.value
    };
    
    // 更新store中的用户名
    userStore.updateUsername(editForm.value.username);
    
    editDialogVisible.value = false;
  } catch (error) {
    console.error('更新资料失败:', error);
    ElMessage.error('更新资料失败');
  }
};

// 头像上传前检查
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};

// 头像上传成功回调
const handleAvatarSuccess = (res, file) => {
  editForm.value.avatar = res.url;
};

// 跳转到视频详情页
const goToVideo = (id) => {
  router.push(`/video?id=${id}`);
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
</style>