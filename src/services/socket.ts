import { io, Socket } from 'socket.io-client';
import { ref } from 'vue';
import { useUserStore } from '../store/user';
import { ElMessage } from 'element-plus';

class SocketService {
  private socket: Socket | null = null;
  private initialized = false;
  public connected = ref(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  
  // 初始化socket连接
  init() {
    if (this.initialized) return;
    
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) return;
    
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    try {
      this.socket = io(serverUrl, {
        auth: {
          token: userStore.token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.connected.value = true;
        this.reconnectAttempts = 0;
        
        // 防止重复监听
        this.socket?.off('receiveMessage');
        this.socket?.off('messageSent');
        this.socket?.off('messagesMarkedAsRead');
      });
      
      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.connected.value = false;
        this.attemptReconnect();
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.connected.value = false;
        this.attemptReconnect();
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('Socket initialization error:', error);
      ElMessage.error('聊天服务连接失败，请刷新页面重试');
    }
  }
  
  // 尝试重新连接
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      ElMessage.error('聊天服务连接失败，请刷新页面重试');
      return;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectAttempts * 1000;
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      console.log('Reconnecting...');
      this.disconnect();
      this.init();
    }, delay);
  }
  
  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.initialized = false;
      this.connected.value = false;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  // 发送消息
  sendMessage(receiverId: number, content: string) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.init();
      }
      
      if (!this.socket || !this.connected.value) {
        reject(new Error('Socket is not connected'));
        return;
      }
      
      try {
        this.socket.emit('sendMessage', { receiverId, content }, (response: any) => {
          if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Failed to send message'));
          }
        });
        
        // 添加超时处理
        setTimeout(() => {
          reject(new Error('发送消息超时，请重试'));
        }, 5000);
      } catch (error) {
        console.error('发送消息错误:', error);
        reject(error);
      }
    });
  }
  
  // 标记消息为已读
  markAsRead(otherUserId: number) {
    if (!this.socket) {
      this.init();
    }
    
    if (!this.socket || !this.connected.value) return;
    
    try {
      this.socket.emit('markAsRead', { otherUserId });
    } catch (error) {
      console.error('标记已读错误:', error);
    }
  }
  
  // 监听新消息
  onNewMessage(callback: (message: any) => void) {
    if (!this.socket) {
      this.init();
    }
    
    if (!this.socket) return () => {};
    
    this.socket.on('receiveMessage', (data) => {
      try {
        callback(data);
      } catch (error) {
        console.error('处理新消息错误:', error);
      }
    });
    
    return () => {
      this.socket?.off('receiveMessage', callback);
    };
  }
  
  // 监听消息已发送确认
  onMessageSent(callback: (response: any) => void) {
    if (!this.socket) {
      this.init();
    }
    
    if (!this.socket) return () => {};
    
    this.socket.on('messageSent', (data) => {
      try {
        callback(data);
      } catch (error) {
        console.error('处理消息已发送确认错误:', error);
      }
    });
    
    return () => {
      this.socket?.off('messageSent', callback);
    };
  }
  
  // 监听消息已读确认
  onMessagesMarkedAsRead(callback: (response: any) => void) {
    if (!this.socket) {
      this.init();
    }
    
    if (!this.socket) return () => {};
    
    this.socket.on('messagesMarkedAsRead', (data) => {
      try {
        callback(data);
      } catch (error) {
        console.error('处理消息已读确认错误:', error);
      }
    });
    
    return () => {
      this.socket?.off('messagesMarkedAsRead', callback);
    };
  }
  
  // 监听对方已读我的消息
  onOtherUserReadMyMessages(callback: (response: any) => void) {
    if (!this.socket) {
      this.init();
    }
    
    if (!this.socket) return () => {};
    
    this.socket.on('messagesRead', (data) => {
      try {
        callback(data);
      } catch (error) {
        console.error('处理对方已读消息通知错误:', error);
      }
    });
    
    return () => {
      this.socket?.off('messagesRead', callback);
    };
  }
}

export const socketService = new SocketService(); 