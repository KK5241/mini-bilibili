<template>
  <div class="flex container items-center h-[64px] bg-[#ffffff]">
    <!-- logo -->
    <img src="@/assets/logo.png" class="w-[120px] h-[90px]" alt="" />

    <!-- 头部导航栏 -->
    <nav class="w-[600px]">
      <HeaderNav></HeaderNav>
    </nav>

    <img src="@/assets/xx.png" alt="" class="w-[100px] h-[25px] pr-[10px]" />

    <!-- 搜索框 -->
    <div
      class="border-[1px] border-solid border-[#2976d3] rounded-full w-[250px] h-[30px] flex items-center relative"
    >
      <!-- 火花图标 -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 14 14"
        fill="none"
        class="ml-[15px] mr-[5px]"
      >
        <path
          d="M5.61753 0.367831C5.40287 1.0544 4.81838 2.28812 3.22884 3.92433C0.486652 6.75051 0.123243 11.3033 4.33656 13.5421C4.68247 13.7259 4.97121 13.6127 5.18821 13.3858C5.90569 12.6368 6.21718 11.5378 6.12385 10.09C6.0976 9.69103 6.27552 9.5872 6.62784 9.86019C7.62707 10.6337 8.27922 11.8254 8.27922 13.1064C8.27922 13.5421 8.45363 13.7725 8.86021 13.6938C11.547 13.1729 14.8212 9.32062 11.2927 3.67992C11.0815 3.39293 10.7694 3.39293 10.7747 3.78725C10.7805 4.27141 10.7251 4.7544 10.609 5.22455C10.5291 5.55121 10.2217 5.54654 10.1493 5.22455C9.70952 3.26518 8.48688 1.5998 6.48084 0.225501C5.93952 -0.144907 5.74295 -0.0311595 5.61753 0.368414V0.367831Z"
          fill="url(#paint0_linear_2_631)"
        ></path>
        <defs>
          <linearGradient
            id="paint0_linear_2_631"
            x1="3.5"
            y1="2.5"
            x2="11"
            y2="13"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#FF9431"></stop>
            <stop offset="1" stop-color="#FF3F29"></stop>
          </linearGradient>
        </defs>
      </svg>
      <input
        v-model="searchText"
        type="text"
        placeholder="搜索视频"
        class="outline-none border-none w-[160px]"
        @keyup.enter="handleSearch"
        @input="handleSearchInput"
        @focus="showSuggestions = true"
        @blur="hideSuggestionsAfterDelay"
      />
      <div
        class="w-[100px] h-full bg-[#2976d3] rounded-r-full flex justify-center items-center cursor-pointer"
        @click="handleSearch"
      >
        <!-- 搜索图标 -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 13 13"
        >
          <path
            fill="#ffffff"
            d="M8.39659 2.53839C6.77899 0.920784 4.15633 0.920784 2.53872 2.53839C0.921119 4.15599 0.921119 6.77865 2.53872 8.39626C4.15633 10.0139 6.77899 10.0139 8.39659 8.39626C10.0142 6.77865 10.0142 4.15599 8.39659 2.53839ZM1.59592 1.59558C3.73422 -0.542724 7.2011 -0.542724 9.3394 1.59558C11.3181 3.57431 11.4658 6.69072 9.7824 8.83925L12.533 11.5898C12.7933 11.8502 12.7933 12.2723 12.533 12.5326C12.2726 12.793 11.8505 12.793 11.5902 12.5326L8.83959 9.78206C6.69106 11.4655 3.57465 11.3178 1.59592 9.33906C-0.542389 7.20076 -0.542389 3.73388 1.59592 1.59558Z"
          ></path>
        </svg>
      </div>

      <!-- 搜索建议下拉框 -->
      <div
        v-if="
          showSuggestions &&
          (searchSuggestions.length > 0 || hotSearches.length > 0)
        "
        class="absolute top-[35px] left-0 w-full bg-white rounded-lg shadow-lg z-10 overflow-hidden"
      >
        <div v-if="searchSuggestions.length > 0">
          <div
            v-for="(suggestion, index) in searchSuggestions"
            :key="index"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @mousedown="selectSuggestion(suggestion)"
          >
            <div class="flex items-center">
              <svg
                class="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <span>{{ suggestion }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="px-4 py-2 text-sm text-gray-500 bg-gray-50">热门搜索</div>
          <div
            v-for="(item, index) in hotSearches"
            :key="index"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            @mousedown="selectSuggestion(item)"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.7em"
                height="0.7em"
                viewBox="0 0 14 14"
                fill="none"
                class="mr-[5px]"
              >
                <path
                  d="M5.61753 0.367831C5.40287 1.0544 4.81838 2.28812 3.22884 3.92433C0.486652 6.75051 0.123243 11.3033 4.33656 13.5421C4.68247 13.7259 4.97121 13.6127 5.18821 13.3858C5.90569 12.6368 6.21718 11.5378 6.12385 10.09C6.0976 9.69103 6.27552 9.5872 6.62784 9.86019C7.62707 10.6337 8.27922 11.8254 8.27922 13.1064C8.27922 13.5421 8.45363 13.7725 8.86021 13.6938C11.547 13.1729 14.8212 9.32062 11.2927 3.67992C11.0815 3.39293 10.7694 3.39293 10.7747 3.78725C10.7805 4.27141 10.7251 4.7544 10.609 5.22455C10.5291 5.55121 10.2217 5.54654 10.1493 5.22455C9.70952 3.26518 8.48688 1.5998 6.48084 0.225501C5.93952 -0.144907 5.74295 -0.0311595 5.61753 0.368414V0.367831Z"
                  fill="url(#paint0_linear_2_631)"
                ></path>
              </svg>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ml-auto flex items-center gap-3">
      <!-- 未登录状态显示登录/注册按钮 -->
      <template v-if="!userStore.isLoggedIn">
        <span
          @click="showLoginModal"
          class="text-black hover:text-[#2976d3] cursor-pointer text-[15px]"
        >
          登录 | 注册
        </span>
      </template>
      <!-- 登录后状态显示用户信息 -->
      <template v-else>
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="flex items-center cursor-pointer ml-5 mr-10 w-[100px]">
            <img
              :src="user.avatar ? getCompleteFileUrl(user.avatar) : '/src/assets/avatar-default.png'"
              class="w-8 h-8 rounded-full mr-2"
              alt="头像"  
            />
            <span class="text-sm" >{{ userStore.username }}</span>
            <el-icon class="ml-1"><arrow-down /></el-icon>
          </div>
      
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="chat">
                消息
                <el-badge v-if="unreadCount > 0" :value="unreadCount" class="ml-1" />
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 上传视频按钮 -->
        <el-button
          type="primary"
          class="mr-3 flex items-center"
          style="background-color: #2976d3; border-color: #2976d3"
          @click="navigateToUpload"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="header-upload-entry__icon mr-1"
          >
            <path
              d="M12.0824 10H14.1412C15.0508 10 15.7882 10.7374 15.7882 11.6471V12.8824C15.7882 13.792 15.0508 14.5294 14.1412 14.5294H3.84707C2.93743 14.5294 2.20001 13.792 2.20001 12.8824V11.6471C2.20001 10.7374 2.93743 10 3.84707 10H5.90589"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M8.99413 11.2353L8.99413 3.82353"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M12.0823 6.29413L8.9941 3.20589L5.90587 6.29413"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          上传视频
        </el-button>
      </template>
    </div>
  </div>
  <LoginModal ref="loginModalRef" />
</template>

<script setup lang="ts">
import HeaderNav from '@/components/headerNav/index.vue'
import LoginModal from '@/components/LoginModal.vue'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, Plus } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { videoApi, chatApi, userApi } from '../../services/api'
import { socketService } from '../../services/socket'

const router = useRouter()
const userStore = useUserStore()
const loginModalRef = ref()
const searchText = ref('')
const showSuggestions = ref(false)
const searchSuggestions = ref<string[]>([])
const hotSearches = ref<string[]>([])
const hideTimeout = ref<number | null>(null)
const unreadCount = ref(0)
const user = ref(userStore.user)
console.log('userStore.user', userStore.user);

const getCompleteFileUrl = (filePath: string): string => {
  console.log('filePath', filePath);
  
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

// 热门搜索词
onMounted(async () => {
  loadHotSearches()
  console.log('用户信息:', userStore.user);
  console.log('用户头像路径:', userStore.user?.avatar);
  if(userStore.user?.id){
    user.value = await userApi.getUserInfo(userStore.user.id)
    console.log('用户信息:', user.value);
  }
  // 初始化聊天功能
  if (userStore.isLoggedIn) {
    // 获取未读消息数量
    fetchUnreadCount()
    
    // 初始化WebSocket
    socketService.init()
    
    // 监听新消息
    const cleanupNewMessage = socketService.onNewMessage(() => {
      fetchUnreadCount()
    })
    
    // 监听未读消息数更新事件
    const handleUnreadCountUpdated = (event: CustomEvent) => {
      unreadCount.value = event.detail
    }
    
    window.addEventListener('unreadCountUpdated', handleUnreadCountUpdated as EventListener)
    
    // 检查localStorage是否有最新的未读消息数
    const storedCount = localStorage.getItem('unreadMessageCount')
    if (storedCount) {
      unreadCount.value = parseInt(storedCount)
    }
    
    // 组件卸载时清理
    onUnmounted(() => {
      cleanupNewMessage()
      window.removeEventListener('unreadCountUpdated', handleUnreadCountUpdated as EventListener)
    })
  }
})

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const count = await chatApi.getUnreadCount()
    console.log('未读消息数量', count)
    unreadCount.value = typeof count === 'number' ? count : 0
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
    unreadCount.value = 0
  }
}

// 模拟加载热门搜索
const loadHotSearches = async () => {
  try {
    const response = await videoApi.getHotSearches()
    // 确保response.data是一个数组
    if (Array.isArray(response)) {
      hotSearches.value = response
    } else {
      console.error('热搜词数据格式错误:', response)
      // 使用默认热搜词
      useDefaultHotSearches()
    }
  } catch (error) {
    console.error('获取热搜词失败:', error)
    // 获取失败时使用默认热搜词
    useDefaultHotSearches()
  }
}

// 使用默认热搜词
const useDefaultHotSearches = () => {
  hotSearches.value = []
}

// 处理搜索输入
const handleSearchInput = async () => {
  if (!searchText.value.trim()) {
    searchSuggestions.value = []
    return
  }

  try {
    const response = await videoApi.getSearchSuggestions(
      searchText.value.trim(),
    )
    if (Array.isArray(response)) {
      searchSuggestions.value = response
    } else {
      console.error('搜索建议数据格式错误:', response)
      searchSuggestions.value = []
    }
  } catch (error) {
    console.error('获取搜索建议失败:', error)
    searchSuggestions.value = []
  }
}

// 延迟隐藏搜索建议
const hideSuggestionsAfterDelay = () => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
  }

  hideTimeout.value = window.setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 选择搜索建议
const selectSuggestion = (suggestion: string) => {
  searchText.value = suggestion
  showSuggestions.value = false
  handleSearch()
}

// 打开登录模态框
const showLoginModal = () => {
  loginModalRef.value.open()
}

// 处理搜索请求
const handleSearch = () => {
  if (!searchText.value.trim()) return

  router.push({
    path: '/search',
    query: { q: searchText.value.trim() },
  })
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'chat':
      router.push('/chat')
      break
    case 'favorites':
      router.push('/favorites')
      break
    case 'history':
      router.push('/history')
      break
    case 'logout':
      userStore.logout()
      socketService.disconnect() // 断开WebSocket连接
      break
  }
}

// 导航到上传视频页面
const navigateToUpload = () => {
  router.push('/upload')
}

// 监听用户登录状态变化，当状态变化时重新获取未读消息计数
watch(() => userStore.isLoggedIn, (newLoginState) => {
  console.log('用户登录状态变化:', newLoginState);
  
  // 清空旧的未读消息计数
  unreadCount.value = 0;
  
  // 如果是登录状态，获取未读消息并初始化WebSocket
  if (newLoginState) {
    fetchUnreadCount();
    socketService.init();
  } else {
    // 如果退出登录，断开WebSocket连接
    socketService.disconnect();
  }
});

// 监听localStorage中token变化，可能是其他页面登录
watch(() => localStorage.getItem('token'), (newToken) => {
  if (newToken !== userStore.token) {
    // token变化，可能是在其他标签页登录或退出
    console.log('Token变化,重新初始化状态');
    
    // 先断开现有连接
    socketService.disconnect();
    
    // 如果有新token，重新初始化
    if (newToken) {
      fetchUnreadCount();
      socketService.init();
    } else {
      unreadCount.value = 0;
    }
  }
}, { immediate: true });
</script>

<style scoped></style>
