<template>
  <div class="dashboard-container">
    <!-- github 角标 -->
    <github-corner class="github-corner" />

    <el-card shadow="never" class="mt-2">
      <el-row class="h-80px">
        <el-col :span="18" :xs="24">
          <div class="flex-x-start">
            <img
              class="w80px h80px rounded-full"
              :src="userStore.userInfo.avatar + '?imageView2/1/w/80/h/80'"
            />
            <div class="ml-5">
              <p>{{ greetings }}</p>
              <p class="text-sm text-gray">今日は晴れ、気温は15℃から25℃、南東の風。</p>
            </div>
          </div>
        </el-col>
        <!-- 
        <el-col :span="6" :xs="24">
          <el-row class="h-80px flex-y-center" :gutter="10">
            <el-col :span="10">
              <div class="font-bold color-#ff9a2e text-sm flex-y-center">
                <el-icon class="mr-2px"><Folder /></el-icon>
                仓库
              </div>
              <div class="mt-3">
                <el-link href="https://gitee.com/youlaiorg/vue3-element-admin" target="_blank">
                  <div class="i-svg:gitee text-lg color-#F76560" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://github.com/youlaitech/vue3-element-admin" target="_blank">
                  <div class="i-svg:github text-lg color-#4080FF" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://gitcode.com/youlai/vue3-element-admin" target="_blank">
                  <div class="i-svg:gitcode text-lg color-#FF9A2E" />
                </el-link>
              </div>
            </el-col>
          </el-row>
        </el-col> -->
      </el-row>
    </el-card>

    <el-row :gutter="20" class="mt-4">
      <!-- 総売上 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">総売上</span>
              <el-tag type="success" size="small">本日</el-tag>
            </div>
          </template>
          <div class="flex-x-between mt-2">
            <div class="flex-y-center">
              <span class="text-2xl font-bold">¥{{ formatNumber(totalSales) }}</span>
              <span :class="['text-xs', 'ml-2', computeGrowthRateClass(salesGrowthRate)]">
                <el-icon>
                  <Top v-if="salesGrowthRate > 0" />
                  <Bottom v-else-if="salesGrowthRate < 0" />
                </el-icon>
                {{ formatPercentage(salesGrowthRate) }}
              </span>
            </div>
            <div class="i-svg:money w-8 h-8" />
          </div>
        </el-card>
      </el-col>

      <!-- 補充が必要な店舗数 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">補充が必要な店舗</span>
              <el-tag type="warning" size="small">緊急</el-tag>
            </div>
          </template>
          <div class="flex-x-between mt-2">
            <div class="flex-y-center">
              <span class="text-2xl font-bold">{{ restockStoreCount }}</span>
              <span class="text-xs ml-2">店舗</span>
            </div>
            <div class="i-svg:store w-8 h-8" />
          </div>
        </el-card>
      </el-col>

      <!-- 総店舗数 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">総店舗数</span>
              <el-tag type="info" size="small">稼働中</el-tag>
            </div>
          </template>
          <div class="flex-x-between mt-2">
            <div class="flex-y-center">
              <span class="text-2xl font-bold">{{ totalStoreCount }}</span>
              <span class="text-xs ml-2">店舗</span>
            </div>
            <div class="i-svg:shop w-8 h-8" />
          </div>
        </el-card>
      </el-col>

      <!-- 総商品数 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">総商品数</span>
              <el-tag type="primary" size="small">在庫</el-tag>
            </div>
          </template>
          <div class="flex-x-between mt-2">
            <div class="flex-y-center">
              <span class="text-2xl font-bold">{{ totalProductCount }}</span>
              <span class="text-xs ml-2">商品</span>
            </div>
            <div class="i-svg:goods w-8 h-8" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 店舗別売上グラフ -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">店舗別売上</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日"
                end-placeholder="終了日"
                size="small"
                style="width: 160px"
              />
            </div>
          </template>
          <div id="storeSalesChart" style="height: 400px"></div>
        </el-card>
      </el-col>

      <!-- 商品別ランキング -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">商品別ランキング</span>
              <el-tag type="success" size="small">TOP 5</el-tag>
            </div>
          </template>
          <div class="product-ranking">
            <div v-for="(item, index) in productRanking" :key="index" class="ranking-item">
              <div class="flex-x-between items-center">
                <div class="flex-y-center">
                  <span class="ranking-number" :class="'top-' + (index + 1)">{{ index + 1 }}</span>
                  <span class="ml-2">{{ item.name }}</span>
                </div>
                <div class="text-right">
                  <div class="font-bold">¥{{ formatNumber(item.sales) }}</div>
                  <div class="text-xs text-gray">{{ item.count }}個</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 访问趋势统计图 -->
    <el-row :gutter="10" class="mt-5">
      <!-- 访问趋势统计图 -->
      <el-col :xs="24" :span="16">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">総売上</span>
              <el-radio-group v-model="visitTrendDateRange" size="small">
                <el-radio-button label="7日間" :value="7" />
                <el-radio-button label="30日間" :value="30" />
                <el-radio-button label="3ヶ月" :value="90" />
                <el-radio-button label="半年" :value="180" />
                <el-radio-button label="1年" :value="365" />
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="chartOption" autoresize />
        </el-card>
      </el-col>
      <!-- 最新动态 -->
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span class="header-title">アラート情報</span>
              <el-link
                type="primary"
                :underline="false"
                href="/inventory"
                target="_blank"
              >
                在庫管理
                <el-icon class="link-icon"><TopRight /></el-icon>
              </el-link>
            </div>
          </template>

          <el-scrollbar height="400px">
            <el-timeline class="p-3">
              <el-timeline-item
                v-for="(item, index) in alertList"
                :key="index"
                :timestamp="item.date"
                placement="top"
                :color="item.type === 'danger' ? '#F56C6C' : '#E6A23C'"
                :hollow="index !== 0"
                size="large"
              >
                <div class="version-item" :class="{ 'latest-item': index === 0 }">
                  <div>
                    <el-text tag="strong">{{ item.title }}</el-text>
                    <el-tag :type="item.type" size="small">
                      {{ item.type === 'danger' ? '緊急' : '警告' }}
                    </el-tag>
                  </div>

                  <el-text class="version-content">{{ item.content }}</el-text>

                  <div>
                    <el-link
                      :type="item.type"
                      href="/inventory"
                      target="_blank"
                      :underline="false"
                    >
                      在庫確認
                      <el-icon class="link-icon"><TopRight /></el-icon>
                    </el-link>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { graphic } from "echarts/core";
import { useUserStore } from "@/store/modules/user";
import { formatGrowthRate } from "@/utils";
import { dayjs } from "element-plus";
import LogAPI, { VisitStatsVO, VisitTrendVO } from "@/api/system/log";

// EChartsコンポーネントの登録
echarts.use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
]);

interface VersionItem {
  id: string;
  title: string;
  date: string;
  content: string;
  link: string;
  tag?: string;
}

defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

const userStore = useUserStore();

/**
 * 成長率に基づいてCSSクラスを計算する
 * @param growthRate - 成長率
 * @returns CSSクラス名
 */
const computeGrowthRateClass = (growthRate?: number): string => {
  if (!growthRate) {
    return "color-[--el-color-info]";
  }
  if (growthRate > 0) {
    return "color-[--el-color-danger]";
  } else if (growthRate < 0) {
    return "color-[--el-color-success]";
  } else {
    return "color-[--el-color-info]";
  }
};

// 当前通知公告列表
const vesionList = ref<VersionItem[]>([
  {
    id: "1",
    title: "v2.4.0",
    date: "2021-09-01 00:00:00",
    content: "实现基础框架搭建，包含权限管理、路由系统等核心功能。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
  {
    id: "1",
    title: "v2.4.0",
    date: "2021-09-01 00:00:00",
    content: "实现基础框架搭建，包含权限管理、路由系统等核心功能。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
  {
    id: "1",
    title: "v2.4.0",
    date: "2021-09-01 00:00:00",
    content: "实现基础框架搭建，包含权限管理、路由系统等核心功能。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
]);

// 当前时间（用于计算问候语）
const currentDate = new Date();

// 问候语：根据当前小时返回不同问候语
const greetings = computed(() => {
  const hours = currentDate.getHours();
  const nickname = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return `上午好，${nickname}！`;
  } else if (hours >= 12 && hours < 18) {
    return `下午好，${nickname}！`;
  } else if (hours >= 18 && hours < 24) {
    return `晚上好，${nickname}！`;
  } else {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

// 訪客统计数据加载状态
const visitStatsLoading = ref(true);
// 訪客统计数据
const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

// 访问趋势日期范围（单位：天）
const visitTrendDateRange = ref(7);
// 访问趋势图表配置
const chartOption = ref({
  tooltip: {
    trigger: "axis",
  },
  legend: {
    data: ["総売上", "純利益"],
    bottom: 0,
  },
  grid: {
    left: "1%",
    right: "5%",
    bottom: "10%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: [],
    boundaryGap: false,
  },
  yAxis: {
    type: "value",
    splitLine: {
      show: true,
      lineStyle: {
        type: "dashed",
      },
    },
  },
  series: [
    {
      name: "総売上",
      type: "line",
      data: [],
      smooth: 0.5,
      smoothMonotone: "x",
      symbol: "none",
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(64, 158, 255, 0.3)",
          },
          {
            offset: 1,
            color: "rgba(64, 158, 255, 0.1)",
          },
        ]),
      },
      itemStyle: {
        color: "#4080FF",
      },
      lineStyle: {
        width: 2,
        color: "#4080FF",
      },
    },
    {
      name: "純利益",
      type: "line",
      data: [],
      smooth: 0.5,
      smoothMonotone: "x",
      symbol: "none",
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(103, 194, 58, 0.3)",
          },
          {
            offset: 1,
            color: "rgba(103, 194, 58, 0.1)",
          },
        ]),
      },
      itemStyle: {
        color: "#67C23A",
      },
      lineStyle: {
        width: 2,
        color: "#67C23A",
      },
    },
  ],
});

/**
 * 获取访客统计数据
 */
const fetchVisitStatsData = () => {
  LogAPI.getVisitStats()
    .then((data) => {
      visitStatsData.value = data;
    })
    .finally(() => {
      visitStatsLoading.value = false;
    });
};

// より滑らかな変動を生成
const generateSmoothData = (days: number, baseValue: number, volatility: number) => {
  const data = [];
  let currentValue = baseValue;
  // より滑らかな変動を生成
  for (let i = 0; i < days; i++) {
    // 前日からの変動を制限して急激な変化を防ぐ
    const change = (Math.random() - 0.5) * volatility * Math.min(1, 5 / Math.sqrt(days));
    currentValue = currentValue * (1 + change);
    // 基準値から大きく離れすぎないように調整
    currentValue = baseValue + (currentValue - baseValue) * 0.95;
    data.push(Math.round(currentValue));
  }
  return data;
};

const fetchVisitTrendData = () => {
  const startDate = dayjs()
    .subtract(visitTrendDateRange.value - 1, "day")
    .toDate();

  // 日付データの生成
  const dates = [];
  for (let i = 0; i < visitTrendDateRange.value; i++) {
    const date = dayjs(startDate).add(i, "day").format("MM-DD");
    dates.push(date);
  }

  // 期間に応じて基準値と変動幅を調整
  const daysCount = visitTrendDateRange.value;
  let baseValue, volatility;

  if (daysCount <= 7) {
    baseValue = 2000000;
    volatility = 0.05;
  } else if (daysCount <= 30) {
    baseValue = 1800000;
    volatility = 0.08;
  } else if (daysCount <= 90) {
    baseValue = 1600000;
    volatility = 0.12;
  } else if (daysCount <= 180) {
    baseValue = 1500000;
    volatility = 0.15;
  } else {
    baseValue = 1400000;
    volatility = 0.18;
  }

  // 売上データと利益データの生成
  const salesData = generateSmoothData(daysCount, baseValue, volatility);
  const profitData = salesData.map((sale) => Math.round(sale * (0.25 + Math.random() * 0.1)));

  // チャートオプションの更新
  chartOption.value.xAxis.data = dates;
  chartOption.value.series[0].data = salesData;
  chartOption.value.series[1].data = profitData;
};

// データ定義
const totalSales = ref(0);
const salesGrowthRate = ref(0);
const restockStoreCount = ref(0);
const totalStoreCount = ref(0);
const totalProductCount = ref(0);
const dateRange = ref([]);
const productRanking = ref([]);
const loading = ref(false);

// 店舗別売上グラフのオプション
const storeSalesChartOption = ref({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  legend: {
    data: ["売上", "目標"],
    bottom: 0,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "10%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: true,
    data: [],
    axisLabel: {
      interval: 0,
      rotate: 30,
    },
  },
  yAxis: {
    type: "value",
    splitLine: {
      lineStyle: {
        type: "dashed",
      },
    },
  },
  series: [
    {
      name: "売上",
      type: "bar",
      data: [],
      itemStyle: {
        color: "#409EFF",
      },
      barWidth: "30%",
    },
    {
      name: "目標",
      type: "line",
      data: [],
      itemStyle: {
        color: "#F56C6C",
      },
      smooth: true,
    },
  ],
});

// 数値フォーマット
const formatNumber = (num: number) => {
  return num.toLocaleString();
};

// パーセンテージフォーマット
const formatPercentage = (num: number) => {
  return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
};

// データ取得後のグラフ更新
const fetchDashboardData = async () => {
  loading.value = true;
  try {
    // TODO: APIからデータを取得する処理を実装
    // 仮のデータ
    totalSales.value = 210000;
    salesGrowthRate.value = 15.5;
    restockStoreCount.value = 3;
    totalStoreCount.value = 10;
    totalProductCount.value = 150;

    // 商品ランキングの仮データ
    productRanking.value = [
      { name: "チキン", sales: 21000, count: 3, growth: 12.5 },
      { name: "ハンバーガー", sales: 18000, count: 5, growth: 8.3 },
      { name: "サンドイッチ", sales: 15000, count: 4, growth: -2.1 },
      { name: "サラダ", sales: 12000, count: 6, growth: 15.7 },
      { name: "ドリンク", sales: 10000, count: 8, growth: 5.2 },
    ];

    // グラフデータの仮データ
    const stores = ["店舗A", "店舗B", "店舗C", "店舗D", "店舗E"];
    const currentSales = [15000, 12000, 18000, 20000, 16000];
    const previousSales = [13000, 11000, 16000, 18000, 14000];

    storeSalesChartOption.value.xAxis.data = stores;
    storeSalesChartOption.value.series[0].data = currentSales;
    storeSalesChartOption.value.series[1].data = previousSales;

    // グラフの更新
    updateStoreSalesChart();
  } catch (error) {
    console.error("ダッシュボードデータの取得に失敗しました:", error);
    ElMessage.error("データの取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

// 日付範囲変更時の処理
watch(dateRange, () => {
  fetchDashboardData();
});

// 店舗別売上グラフの初期化
const initStoreSalesChart = () => {
  const chartDom = document.getElementById("storeSalesChart");
  if (chartDom) {
    const myChart = echarts.init(chartDom);
    myChart.setOption(storeSalesChartOption.value);
    return myChart;
  }
  return null;
};

// 店舗別売上グラフの更新
const updateStoreSalesChart = () => {
  const chart = initStoreSalesChart();
  if (chart) {
    chart.setOption(storeSalesChartOption.value);
  }
};

// コンポーネントのマウント時にグラフを初期化
onMounted(() => {
  fetchVisitTrendData();
  fetchDashboardData();
});

// コンポーネントのアンマウント時にクリーンアップ
onUnmounted(() => {
  // クリーンアップが必要な処理があればここに記述
});

// 期間変更時にグラフを更新
watch(visitTrendDateRange, () => {
  fetchVisitTrendData();
});

// アラート情報の定義
const alertList = ref([
  {
    id: "1",
    title: "在庫切れ警告",
    date: "2024-03-20 10:30:00",
    content: "チキンの在庫が10個を下回りました。緊急の補充が必要です。",
    type: "danger",
  },
  {
    id: "2",
    title: "在庫警告",
    date: "2024-03-20 09:15:00",
    content: "ハンバーガーの在庫が20個を下回りました。補充を検討してください。",
    type: "warning",
  },
  {
    id: "3",
    title: "在庫警告",
    date: "2024-03-19 16:45:00",
    content: "サンドイッチの在庫が15個を下回りました。補充を検討してください。",
    type: "warning",
  },
]);
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .version-item {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    transition: all 0.2s;

    &.latest-item {
      background: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-5);
    }
    &:hover {
      transform: translateX(5px);
    }
    .version-content {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }

  .product-ranking {
    .ranking-item {
      padding: 10px 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }
    }

    .ranking-number {
      display: inline-block;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border-radius: 50%;
      background: #f5f7fa;
      color: #909399;

      &.top-1 {
        background: #f56c6c;
        color: white;
      }

      &.top-2 {
        background: #e6a23c;
        color: white;
      }

      &.top-3 {
        background: #409eff;
        color: white;
      }
    }
  }

  .chart {
    height: 400px;
  }
}
</style>
