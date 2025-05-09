<template>
  <div class="bg-[#f5f5f5] min-h-screen py-4">
    <div class="container mx-auto">
      <div class="flex items-center mb-4">
        <el-button icon="ArrowLeft" @click="goBack">返回</el-button>
        <h1 class="text-xl font-bold ml-4">
          {{ otherUser.username || '聊天' }}
        </h1>
      </div>
      
      <div class="bg-white rounded-lg shadow flex flex-col" style="height: calc(100vh - 120px)">
        <!-- 消息区域 -->
        <div 
          ref="messagesContainer" 
          class="flex-1 overflow-y-auto p-4"
          v-loading="loading"
        >
          <div v-if="messages.length === 0 && !loading" class="text-center text-gray-500 py-10">
            <div class="mb-3">暂无消息记录</div>
            <div>发送一条消息开始聊天吧</div>
          </div>
          
          <div v-else>
            <div 
              v-for="(message, index) in messages" 
              :key="message.id" 
              class="mb-4"
            >
              <!-- 日期分隔符 -->
              <div v-if="shouldShowDate(message, index)" class="text-center text-xs text-gray-500 my-3">
                {{ formatDate(message.createdAt) }}
              </div>
              
              <!-- 消息气泡 -->
              <div 
                :class="[
                  'flex', 
                  message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                ]"
              >
                <!-- 对方的消息 -->
                <template v-if="message.senderId !== currentUserId">
                  <img 
                    :src="`http://localhost:3000${otherUser.avatar}` || '/src/assets/avatar-default.png'"
                    class="h-8 w-8 rounded-full mr-2 mt-1 object-cover"
                    alt="用户头像" 
                  />
                  <div class="bg-white border rounded-lg p-3 max-w-[80%] break-words shadow-sm">
                    {{ message.content }}
                  </div>
                </template>
                
                <!-- 自己的消息 -->
                <template v-else>
                  <div class="bg-blue-500 text-white rounded-lg p-3 max-w-[80%] break-words shadow-sm">
                    {{ message.content }}
                  </div>
                  <img 
                    :src="`http://localhost:3000${user.avatar}` || '/src/assets/avatar-default.png'" 
                    class="h-8 w-8 rounded-full ml-2 mt-1 object-cover"
                    alt="我的头像" 
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="border-t p-4">
          <div class="flex">
            <el-input
              v-model="messageText"
              placeholder="输入消息..."
              :rows="3"
              type="textarea"
              resize="none"
              @keydown.enter.prevent="sendMessage"
            />
            <el-button 
              type="primary" 
              class="ml-2 flex-shrink-0" 
              :disabled="!messageText.trim() || sending"
              @click="sendMessage"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../store/user';
import { chatApi, userApi } from '../../services/api';
import { socketService } from '../../services/socket';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const user = ref<any>({});
const otherUserId = parseInt(route.params.userId as string);
const currentUserId = userStore.userId;
const currentUserAvatar = userStore.user?.avatar;
console.log(currentUserAvatar);

const messagesContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
const sending = ref(false);
const messageText = ref('');
const messages = ref<any[]>([]);
const otherUser = ref<any>({});
const page = ref(1);
const hasMoreMessages = ref(true);

// 获取聊天对象信息
const fetchOtherUserInfo = async () => {
  try {
    const response = await userApi.getUserProfile(otherUserId);
    console.log(response);
    
    otherUser.value = response;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
  }
};

// 获取消息历史
const fetchMessages = async (reset = false) => {
  if (reset) {
    page.value = 1;
    messages.value = [];
    hasMoreMessages.value = true;
  }
  
  if (!hasMoreMessages.value) return;
  
  try {
    loading.value = true;
    const response = await chatApi.getMessageHistory(otherUserId, page.value);
    
    // 处理响应数据
    const newMessages = response.messages;
    hasMoreMessages.value = response.hasMore;
    
    // 追加消息并过滤重复
    const mergedMessages = reset ? newMessages : [...newMessages, ...messages.value];
    messages.value = mergedMessages.filter((msg, index, self) => 
      index === self.findIndex((m) => m.id === msg.id)
    );
    
    page.value++;
    
    // 标记消息为已读
    socketService.markAsRead(otherUserId);
    
    // 更新全局未读消息计数
    updateUnreadCount();
    
    if (reset) {
      // 滚动到底部
      await nextTick();
      scrollToBottom();
    }
  } catch (error) {
    console.error('获取消息历史失败:', error);
    ElMessage.error('获取消息历史失败');
  } finally {
    loading.value = false;
  }
};

// 更新全局未读消息计数
const updateUnreadCount = async () => {
  try {
    const count = await chatApi.getUnreadCount();
    // 处理响应格式，确保拿到正确的数字
    const unreadCount = typeof count === 'number' ? count : 0;
    
    // 更新本地存储和触发事件
    localStorage.setItem('unreadMessageCount', String(unreadCount));
    window.dispatchEvent(new CustomEvent('unreadCountUpdated', { detail: unreadCount }));
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
  }
};

// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim() || sending.value) return;
  
  sending.value = true;
  try {
    const content = messageText.value.trim();
    messageText.value = '';
    
    // 乐观更新UI
    const tempMessage = {
      id: Date.now(),
      senderId: currentUserId,
      receiverId: otherUserId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
      isTemp: true
    };
    
    messages.value.push(tempMessage);
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    
    // 发送到服务器
    await chatApi.sendMessage(otherUserId, content);
    
    // 移除临时消息，服务器会通过WebSocket推送真实消息
    // messages.value = messages.value.filter(msg => !msg.isTemp);
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
    
    // 清除临时消息
    messages.value = messages.value.filter(msg => !msg.isTemp);
  } finally {
    sending.value = false;
  }
};

// 处理新消息
const handleNewMessage = (message: any) => {
  if (message.senderId === otherUserId || message.receiverId === otherUserId) {
    // 过滤掉临时消息
    messages.value = messages.value.filter(msg => !msg.isTemp);
    
    // 添加新消息
    messages.value.push(message);
    
    // 标记为已读
    socketService.markAsRead(otherUserId);
    
    // 更新全局未读消息计数
    updateUnreadCount();
    
    // 滚动到底部
    nextTick().then(scrollToBottom);
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // 判断是否是今天
  if (date.toDateString() === now.toDateString()) {
    return '今天';
  }
  
  // 判断是否是昨天
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }
  
  // 同一年内
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  }
  
  // 不同年
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

// 判断是否应该显示日期分隔符
const shouldShowDate = (message: any, index: number) => {
  if (index === 0) return true;
  
  const currentDate = new Date(message.createdAt).toDateString();
  const prevDate = new Date(messages.value[index - 1].createdAt).toDateString();
  
  return currentDate !== prevDate;
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};

// 初始化
onMounted(async () => {
  await fetchOtherUserInfo();
  await fetchMessages(true);
  console.log(userStore.user);
  if(userStore.user?.id){
    user.value = await userApi.getUserInfo(userStore.user.id)
    console.log('用户信息:', user.value);
  }
  // 初始化WebSocket
  socketService.init();
  const cleanup = socketService.onNewMessage(handleNewMessage);
  
  // 处理滚动加载更多消息
  const handleScroll = () => {
    if (!messagesContainer.value) return;
    
    if (messagesContainer.value.scrollTop === 0 && hasMoreMessages.value && !loading.value) {
      const oldHeight = messagesContainer.value.scrollHeight;
      
      fetchMessages(false).then(() => {
        nextTick(() => {
          if (messagesContainer.value) {
            const newHeight = messagesContainer.value.scrollHeight;
            messagesContainer.value.scrollTop = newHeight - oldHeight;
          }
        });
      });
    }
  };
  
  messagesContainer.value?.addEventListener('scroll', handleScroll);
  
  // 清理
  onUnmounted(() => {
    cleanup();
    messagesContainer.value?.removeEventListener('scroll', handleScroll);
  });
});

// 当聊天对象变化时，重新加载消息
watch(() => route.params.userId, (newId) => {
  if (newId && parseInt(newId as string) !== otherUserId) {
    window.location.reload();
  }
});
</script> 