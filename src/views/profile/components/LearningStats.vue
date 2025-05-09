<template>
  <div class="learning-stats">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="error" class="error-container">
      <el-empty description="数据加载失败，请稍后再试">
        <el-button type="primary" @click="retryLoading">重试</el-button>
      </el-empty>
    </div>
    <div v-else-if="!hasData" class="empty-container">
      <el-empty description="暂无学习数据，多看些视频吧" />
    </div>
    <div v-else class="charts-wrapper">
      <div class="chart-header">
        <h3 class="chart-title">学习分类统计</h3>
        <div class="chart-desc">
          了解您在各个学科的学习情况，有针对性地均衡发展
          <el-button type="text" @click="refreshCharts" size="small">
            刷新图表
          </el-button>
        </div>
      </div>
      
      <!-- 单独显示饼图 -->
      <div class="single-chart-container">
        <div ref="pieChartRef" style="height: 400px; width: 100%;"></div>
      </div>
      
      <!-- 单独显示柱图 -->
      <div class="single-chart-container">
        <div ref="barChartRef" style="height: 400px; width: 100%;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { userApi } from '@/services/api'
import { useUserStore } from '@/store/user'
import * as echarts from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  BarChart,
  LabelLayout,
  CanvasRenderer
])

// 状态
const loading = ref(true)
const error = ref(false)
const categoryData = ref<{ name: string; value: number }[]>([])
const pieChartRef = ref<HTMLElement | null>(null)
const barChartRef = ref<HTMLElement | null>(null)
const pieChart = ref<echarts.ECharts | null>(null)
const barChart = ref<echarts.ECharts | null>(null)
const userStore = useUserStore()

// 判断是否有数据
const hasData = computed(() => {
  return categoryData.value.some(item => item.value > 0)
})

// 加载用户学习统计数据
const loadStats = async () => {
  if (!userStore.isLoggedIn) {
    error.value = true
    loading.value = false
    return
  }
  
  try {
    loading.value = true
    error.value = false
    
    // 获取真实数据
    const response = await userApi.getCategoryStats(userStore.userId)
    console.log('API原始响应:', response)
    
    // 确保我们拿到了正确的数据结构
    if (response && typeof response === 'object') {
      if (Array.isArray(response)) {
        categoryData.value = response;
      } else if (Array.isArray(response.data)) {
        categoryData.value = response.data;
      } else {
        // 如果响应结构不符合预期，显示错误
        console.error('API响应格式不符合预期:', response);
        error.value = true;
        loading.value = false;
        return;
      }
    }
    
    console.log('处理后的分类统计数据:', categoryData.value);
    
    // 检查是否有数据
    if (categoryData.value.length === 0 || !categoryData.value.some(item => item.value > 0)) {
      console.log('没有找到有效的统计数据');
      error.value = true;
      loading.value = false;
      return;
    }
    
    // 延迟初始化图表，确保DOM已经渲染
    setTimeout(() => {
      initCharts();
    }, 200);
  } catch (err) {
    console.error('加载学习统计数据失败:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

// 初始化图表
const initCharts = () => {
  console.log('开始初始化图表...');
  
  // 强制DOM刷新
  setTimeout(() => {
    // 初始化饼图
    initPieChart();
    
    // 初始化柱状图
    initBarChart();
    
    // 自适应窗口大小变化
    window.addEventListener('resize', handleResize);
    
    console.log('图表初始化完成');
  }, 300);
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) {
    console.error('饼图DOM引用不存在');
    return;
  }
  
  console.log('初始化饼图...');
  console.log('饼图容器尺寸:', pieChartRef.value.offsetWidth, pieChartRef.value.offsetHeight);
  
  // 销毁之前的图表实例，避免重复初始化
  if (pieChart.value) {
    pieChart.value.dispose();
  }
  
  try {
    // 初始化图表
    pieChart.value = echarts.init(pieChartRef.value);
    
    const options = {
      title: {
        text: '学习分类占比',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: categoryData.value.map(item => item.name)
      },
      series: [
        {
          name: '学习时长',
          type: 'pie',
          radius: '65%',
          center: ['50%', '50%'],
          data: categoryData.value,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: '{b}: {d}%'
          }
        }
      ],
      color: [
        '#5470c6', '#91cc75', '#fac858', '#ee6666',
        '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
      ]
    };
    
    console.log('设置饼图配置项:', options);
    pieChart.value.setOption(options);
    console.log('饼图初始化完成');
  } catch (error) {
    console.error('初始化饼图失败:', error);
  }
}

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) {
    console.error('柱状图DOM引用不存在');
    return;
  }
  
  console.log('初始化柱状图...');
  console.log('柱状图容器尺寸:', barChartRef.value.offsetWidth, barChartRef.value.offsetHeight);
  
  // 销毁之前的图表实例，避免重复初始化
  if (barChart.value) {
    barChart.value.dispose();
  }
  
  try {
    // 初始化图表
    barChart.value = echarts.init(barChartRef.value);
    
    const options = {
      title: {
        text: '学习时长统计',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categoryData.value.map(item => item.name),
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: '次数'
      },
      series: [
        {
          name: '观看次数',
          type: 'bar',
          barWidth: '60%',
          data: categoryData.value.map(item => item.value),
          label: {
            show: true,
            position: 'top'
          }
        }
      ],
      color: ['#5470c6']
    };
    
    console.log('设置柱状图配置项:', options);
    barChart.value.setOption(options);
    console.log('柱状图初始化完成');
  } catch (error) {
    console.error('初始化柱状图失败:', error);
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (pieChart.value) {
    pieChart.value.resize()
  }
  if (barChart.value) {
    barChart.value.resize()
  }
}

// 重试加载数据
const retryLoading = () => {
  loadStats();
};

// 刷新图表
const refreshCharts = () => {
  if (pieChart.value && barChart.value) {
    console.log('手动刷新图表...');
    
    // 清除现有图表
    pieChart.value.dispose();
    barChart.value.dispose();
    pieChart.value = null;
    barChart.value = null;
    
    // 重新初始化图表
    setTimeout(() => {
      initCharts();
    }, 100);
  }
};

// 生命周期钩子
onMounted(() => {
  console.log('组件挂载，开始加载数据...');
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  
  // 监听DOM变化
  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
      if (pieChart.value || barChart.value) {
        console.log('检测到容器尺寸变化，重新调整图表大小');
        handleResize();
      }
    });
    
    if (pieChartRef.value) {
      resizeObserver.observe(pieChartRef.value);
    }
    
    if (barChartRef.value) {
      resizeObserver.observe(barChartRef.value);
    }
  } else {
    console.log('ResizeObserver API不可用，使用备用方法监听大小变化');
    // 备用方法：定期检查容器大小变化
    const checkSize = () => {
      handleResize();
    };
    const sizeCheckInterval = setInterval(checkSize, 2000);
    
    // 清理函数
    onUnmounted(() => {
      clearInterval(sizeCheckInterval);
    });
  }
  
  // 加载数据并初始化图表
  loadStats();
})

onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例释放资源
  if (pieChart.value) {
    pieChart.value.dispose()
    pieChart.value = null
  }
  if (barChart.value) {
    barChart.value.dispose()
    barChart.value = null
  }
})
</script>

<style scoped>
.learning-stats {
  padding: 1rem;
  width: 100%;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.charts-wrapper {
  width: 100%;
}

.chart-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.chart-desc {
  color: #666;
  font-size: 0.9rem;
}

.single-chart-container {
  width: 100%;
  margin-bottom: 30px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
  padding: 20px;
}
</style> 