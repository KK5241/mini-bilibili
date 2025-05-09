<template>
  <div class="bg-[#f5f5f5] min-h-screen py-4">
    <div class="container mx-auto">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold mb-6">我的消息</h1>
        
        <div class="bg-white rounded overflow-hidden">
          <!-- 加载状态 -->
          <div v-if="loading" class="p-10 flex justify-center">
            <el-skeleton :rows="5" animated />
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="conversations.length === 0" class="p-10 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <div class="mt-4">暂无消息</div>
          </div>
          
          <!-- 会话列表 -->
          <ul v-else class="divide-y">
            <li 
              v-for="conv in conversations" 
              :key="conv.id" 
              class="p-4 hover:bg-gray-50 cursor-pointer flex items-center"
              @click="goToChat(conv.otherUser.id)"
            >
              <!-- 头像 -->
              <div class="relative">
                <img 
                  :src="`http://localhost:3000${conv.otherUser.avatar}` || '/src/assets/avatar-default.png'" 
                  class="h-12 w-12 rounded-full object-cover"
                  alt="用户头像" 
                />
                <div v-if="conv.unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}
                </div>
              </div>
              
              <!-- 用户信息和最后消息 -->
              <div class="ml-4 flex-1 min-w-0">
                <div class="flex justify-between items-center">
                  <div class="font-medium text-gray-900 truncate">
                    {{ conv.otherUser.username }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatTime(conv.updatedAt) }}
                  </div>
                </div>
                <div class="text-sm text-gray-500 truncate">
                  {{ conv.lastMessage ? conv.lastMessage.content : '暂无消息' }}
                </div>
              </div>
              
              <!-- 右侧箭头 -->
              <el-icon class="text-gray-400 ml-2"><ArrowRight /></el-icon>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight } from '@element-plus/icons-vue';
import { chatApi } from '../../services/api';
import { socketService } from '../../services/socket';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(true);
const conversations = ref<any[]>([]);

// 获取会话列表
const fetchConversations = async () => {
  try {
    loading.value = true;
    const data = await chatApi.getConversations();
    // 确保返回的数据是数组
    if (Array.isArray(data)) {
      conversations.value = data;
    } else {
      console.error('会话列表数据格式错误:', data);
      conversations.value = [];
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
    ElMessage.error('获取会话列表失败');
    conversations.value = [];
  } finally {
    loading.value = false;
  }
};

// 处理接收到的新消息
const handleNewMessage = (message: any) => {
  // 确保message对象存在并且有senderId
  if (!message || (!message.senderId && !message.sender?.id)) {
    console.error('收到无效消息格式:', message);
    return;
  }
  
  const senderId = message.senderId || message.sender?.id;
  
  const existingConvIndex = conversations.value.findIndex(
    conv => conv.otherUser.id === senderId
  );
  
  if (existingConvIndex >= 0) {
    // 更新现有会话
    const conv = conversations.value[existingConvIndex];
    conv.lastMessage = message;
    conv.unreadCount++;
    conv.updatedAt = message.createdAt;
    
    // 将新消息的会话移到顶部
    conversations.value.splice(existingConvIndex, 1);
    conversations.value.unshift(conv);
  } else {
    // 创建新会话
    fetchConversations();
  }
};

// 处理消息已读
const handleMessagesRead = (data: any) => {
  const { userId, otherUserId } = data;
  
  // 找到与该用户相关的会话
  const convIndex = conversations.value.findIndex(
    conv => conv.otherUser.id === userId
  );
  
  if (convIndex >= 0) {
    conversations.value[convIndex].unreadCount = 0;
  }
};

// 初始化WebSocket连接
const initSocket = () => {
  socketService.init();
  const cleanupNewMessageListener = socketService.onNewMessage(handleNewMessage);
  const cleanupMessagesReadListener = socketService.onOtherUserReadMyMessages(handleMessagesRead);
  
  return () => {
    cleanupNewMessageListener();
    cleanupMessagesReadListener();
  };
};

// 跳转到聊天页面
const goToChat = (userId: number) => {
  router.push(`/chat/${userId}`);
};

// 格式化时间显示
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 今天
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    // 昨天
    return '昨天';
  } else if (diffDays < 7) {
    // 一周内
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  } else {
    // 更早
    return date.toLocaleDateString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
};

onMounted(() => {
  fetchConversations();
  const cleanup = initSocket();
  
  // 组件卸载时清理事件监听
  onUnmounted(() => {
    cleanup();
  });
});
</script> 