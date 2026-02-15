<template>
  <div class="dashboard-container">
    <!-- github 角标 -->
    <github-corner class="github-corner" />

    <el-card v-if="showFirstCard" shadow="never" class="mt-2">
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
        <el-col :span="6" :xs="24">
          <!-- Empty column for layout purposes -->
        </el-col>
      </el-row>
      <span class="close-icon" @click="showFirstCard = false">☓</span>
    </el-card>

    <el-row :gutter="20" class="mt-4">
      <!-- 総売上 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">売上高</span>
              <el-tag type="success" size="small">本日</el-tag>
            </div>
          </template>
          <div class="flex-x-between mt-2">
            <div class="flex-y-center">
              <span class="text-2xl font-bold">¥{{ formatNumber(dashboardData.todaySales) }}</span>
              <span
                :class="['text-xs', 'ml-2', computeGrowthRateClass(dashboardData.salesGrowthRate)]"
              >
                <el-icon>
                  <Top v-if="dashboardData.salesGrowthRate > 0" />
                  <Bottom v-else-if="dashboardData.salesGrowthRate < 0" />
                </el-icon>
                {{ formatPercentage(dashboardData.salesGrowthRate) }}
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
              <span class="text-gray">在庫切れSKU</span>
              <el-tag type="warning" size="small">要確認</el-tag>
            </div>
          </template>
          <div class="flex-x-between mt-2">
            <div class="flex-y-center">
              <span class="text-2xl font-bold">{{ dashboardData.outOfStockSkuCount }}</span>
              <span class="text-xs ml-2">SKU</span>
            </div>
            <div class="i-svg:store w-8 h-8" />
          </div>
        </el-card>
      </el-col>

      <!-- 稼働店舗数 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">稼働店舗</span>
              <el-tag type="success" size="small">営業中</el-tag>
            </div>
          </template>
          <div class="flex-x-between mt-2">
            <div class="flex-y-center">
              <span class="text-2xl font-bold">{{ dashboardData.activeStoreCount }}</span>
              <span class="text-xs ml-2">/ {{ dashboardData.totalStoreCount }}店舗</span>
            </div>
            <div class="i-svg:shop w-8 h-8" />
          </div>
        </el-card>
      </el-col>

      <!-- 保留中アラート数 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">保留中アラート</span>
              <el-tag type="danger" size="small">要対応</el-tag>
            </div>
          </template>
          <div class="flex-x-between mt-2">
            <div class="flex-y-center">
              <span class="text-2xl font-bold">{{ dashboardData.pendingAlertCount }}</span>
              <span class="text-xs ml-2">件</span>
            </div>
            <div class="i-svg:goods w-8 h-8" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 店舗別売上グラフ -->
    <el-row v-if="false" :gutter="20" class="mt-4">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="flex-x-between" style="align-items: center">
              <div style="display: flex; align-items: center; gap: 16px; width: 100%">
                <span class="text-gray">店舗別売上</span>
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="〜"
                  start-placeholder="開始日"
                  end-placeholder="終了日"
                  size="small"
                  style="width: 100%; max-width: 500px"
                />
              </div>
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
              <span class="text-gray">商品売上ランキング</span>
              <el-tag type="success" size="small">TOP 5</el-tag>
            </div>
          </template>
          <div class="product-ranking" style="height: 400px; overflow-y: auto">
            <div v-for="(item, index) in productRanking" :key="index" class="ranking-item">
              <div class="flex-x-between items-center">
                <div class="flex-y-center">
                  <span class="ranking-number" :class="'top-' + (index + 1)">{{ index + 1 }}</span>
                  <span class="ml-2">{{ item.name }}</span>
                  <img :src="item.image" class="product-image" :alt="item.name" />
                </div>
                <div class="text-right">
                  <div class="font-bold">¥{{ formatNumber(item.sales * 10) }}</div>
                  <div class="text-xs text-gray">{{ item.count * 10 }}個</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 売上推移とアラート情報 -->
    <el-row :gutter="20" class="mt-4">
      <!-- 売上推移統計図 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">売上推移</span>
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

      <!-- アラート情報 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">アラート情報</span>
              <el-link type="primary" underline="never" href="/inventory" target="_blank">
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
                :timestamp="item.alertDate"
                placement="top"
                :color="item.alertType === 'EXPIRED' ? '#F56C6C' : '#E6A23C'"
                :hollow="index !== 0"
                size="large"
              >
                <div class="version-item" :class="{ 'latest-item': index === 0 }">
                  <div>
                    <el-text tag="strong">{{ item.alertMessage }}</el-text>
                    <el-tag
                      :type="item.alertType === 'EXPIRED' ? 'danger' : 'warning'"
                      size="small"
                    >
                      {{ item.alertType === "EXPIRED" ? "賞味期限" : "在庫切れ" }}
                    </el-tag>
                  </div>

                  <el-text class="version-content">ロット番号: {{ item.lotNumber }}</el-text>

                  <div>
                    <el-link
                      :type="item.alertType === 'EXPIRED' ? 'danger' : 'warning'"
                      href="/inventory"
                      target="_blank"
                      underline="never"
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
import { ref, onMounted, computed, watch, reactive } from "vue";
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
import { useUserStore } from "@/store/modules/user.store";
import { dayjs } from "element-plus";
import DashboardAPI, { DashboardDataVO, ProductRankingItem } from "@/api/dashboard";
import { ElMessage } from "element-plus";

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

// チャートオプションの型定義
interface ChartData {
  tooltip: {
    trigger: string;
    formatter?: (params: any) => string;
  };
  legend: {
    data: string[];
    bottom: number;
  };
  grid: {
    left: string;
    right: string;
    bottom: string;
    containLabel: boolean;
  };
  xAxis: {
    type: string;
    data: Array<string>;
    boundaryGap: boolean;
    axisLabel?: {
      formatter?: (value: string) => string;
    };
  };
  yAxis: {
    type: string;
    splitLine: {
      show: boolean;
      lineStyle: {
        type: string;
      };
    };
    axisLabel?: {
      formatter?: (value: number) => string;
    };
  };
  series: Array<{
    name: string;
    type: string;
    data: Array<number>;
    smooth?: number;
    smoothMonotone?: string;
    symbol?: string;
    areaStyle?: any;
    itemStyle?: {
      color: string;
    };
    lineStyle?: {
      width: number;
      color: string;
    };
  }>;
}

// 売上推移のチャートオプション
const chartOption = ref<ChartData>({
  tooltip: {
    trigger: "axis",
    formatter: function (_params: any) {
      return _params
        .map((item: any) => {
          return `${item.seriesName}: ¥${formatNumber(item.value)}`;
        })
        .join("<br/>");
    },
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
    axisLabel: {
      formatter: (_value: string) => {
        const date = dayjs(_value, "MM-DD");
        return date.format("MM月DD日");
      },
    },
  },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: (_value: number) => `¥${formatNumber(_value)}`,
    },
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
      smooth: 0.3,
      symbol: "none",
      areaStyle: {
        opacity: 0.1,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#409EFF" },
          { offset: 1, color: "#FFFFFF" },
        ]),
      },
      itemStyle: {
        color: "#409EFF",
      },
      lineStyle: {
        width: 3,
        color: "#409EFF",
      },
    },
    {
      name: "純利益",
      type: "line",
      data: [],
      smooth: 0.3,
      symbol: "none",
      areaStyle: {
        opacity: 0.1,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#67C23A" },
          { offset: 1, color: "#FFFFFF" },
        ]),
      },
      itemStyle: {
        color: "#67C23A",
      },
      lineStyle: {
        width: 3,
        color: "#67C23A",
      },
    },
  ],
});

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
// const vesionList = ref<VersionItem[]>([...]);

// 当前时间（用于计算问候语）
const currentDate = new Date();

// 问候语：根据当前小时返回不同问候语
const greetings = computed(() => {
  const hours = currentDate.getHours();
  const nickname = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) {
    return "おはようございます！朝の清々しい空気を感じましょう🌅";
  } else if (hours >= 8 && hours < 12) {
    return `おはようございます、${nickname}さん！`;
  } else if (hours >= 12 && hours < 18) {
    return `こんにちは、${nickname}さん！`;
  } else if (hours >= 18 && hours < 24) {
    return `こんばんは、${nickname}さん！`;
  } else {
    return "おやすみなさい。良い夢を🌛";
  }
});

const dashboardData = reactive<DashboardDataVO>({
  todaySales: 0,
  salesGrowthRate: 0,
  activeStoreCount: 0,
  totalStoreCount: 0,
  pendingAlertCount: 0,
  outOfStockSkuCount: 0,
});

// 访问趋势日期范围（単位：天）
const visitTrendDateRange = ref(7);

// 売上推移データの取得
const fetchVisitTrendData = async () => {
  try {
    const endDate = dayjs().format("YYYY-MM-DD");
    const startDate = dayjs().subtract(visitTrendDateRange.value, "day").format("YYYY-MM-DD");

    const res = await DashboardAPI.getSalesTrend({
      startDate,
      endDate,
    });
    const { dates, sales, profits } = res;

    // 期間に応じてX軸の表示を調整
    const xAxis = {
      type: "category",
      data: dates,
      boundaryGap: false,
      axisLabel: {
        interval: visitTrendDateRange.value === 7 ? 0 : "auto",
        formatter: (value: string) => {
          if (visitTrendDateRange.value <= 7) {
            return value;
          } else if (visitTrendDateRange.value <= 30) {
            return value.split("-")[1];
          } else {
            return value;
          }
        },
      },
    };

    chartOption.value.xAxis = xAxis;
    chartOption.value.series = [
      {
        name: "総売上",
        type: "line",
        data: smoothData(sales),
        smooth: 0.3,
        symbol: "none",
        areaStyle: {
          opacity: 0.1,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#409EFF" },
            { offset: 1, color: "#FFFFFF" },
          ]),
        },
        itemStyle: {
          color: "#409EFF",
        },
        lineStyle: {
          width: 3,
          color: "#409EFF",
        },
      },
      {
        name: "純利益",
        type: "line",
        data: smoothData(profits),
        smooth: 0.3,
        symbol: "none",
        areaStyle: {
          opacity: 0.1,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#67C23A" },
            { offset: 1, color: "#FFFFFF" },
          ]),
        },
        itemStyle: {
          color: "#67C23A",
        },
        lineStyle: {
          width: 3,
          color: "#67C23A",
        },
      },
    ];
  } catch (error) {
    console.error("売上推移データの取得に失敗しました:", error);
    ElMessage.error("データの取得に失敗しました");
  }
};

// データ定義
const dateRange = ref([]);
const productRanking = ref<ProductRankingItem[]>([]);
const loading = ref(false);
const alertList = ref<any[]>([]);
const storeSalesChart = ref<echarts.ECharts | null>(null);

// 店舗別売上グラフのオプション
const storeSalesChartOption = ref({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    formatter: function (params: any) {
      return params
        .map((item: any) => {
          return `${item.seriesName}: ¥${formatNumber(item.value)}`;
        })
        .join("<br/>");
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
    axisLabel: {
      formatter: (value: number) => `¥${formatNumber(value)}`,
    },
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
      lineStyle: {
        width: 2,
        type: "dashed",
      },
      symbol: "none",
    },
  ],
});

// 数値フォーマット
const formatNumber = (num: number | undefined | null) => {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString();
};

// パーセンテージフォーマット
const formatPercentage = (num: number) => {
  return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
};

// 店舗別売上グラフの初期化
const initStoreSalesChart = () => {
  const chartDom = document.getElementById("storeSalesChart");
  if (chartDom) {
    // 既存のインスタンスを破棄
    const existingInstance = echarts.getInstanceByDom(chartDom);
    if (existingInstance) {
      existingInstance.dispose();
    }
    const myChart = echarts.init(chartDom);
    myChart.setOption(storeSalesChartOption.value);
    return myChart;
  }
  return null;
};

// 店舗別売上グラフの更新
const updateStoreSalesChart = () => {
  // if (storeSalesChart.value) {
  //   storeSalesChart.value.setOption(storeSalesChartOption.value);
  // }
  const chart = initStoreSalesChart();
  if (chart) {
    chart.setOption(storeSalesChartOption.value);
  }
};

// コンポーネントのマウント時にデータを取得
onMounted(() => {
  fetchDashboardData();
  initStoreSalesChart();
});

// データ取得後のグラフ更新
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const [dashboardRes, alertsRes] = await Promise.all([
      DashboardAPI.getDashboardData(),
      DashboardAPI.getAlerts({ limit: 10 }),
    ]);

    Object.assign(dashboardData, dashboardRes);

    // アラート情報（未解決のみ表示）
    if (alertsRes) {
      alertList.value = alertsRes
        .filter((alert) => !alert.resolved)
        .map((alert) => ({
          ...alert,
          date: alert.alertDate,
          title: alert.alertMessage,
          content: `ロット番号: ${alert.lotNumber}`,
          type: alert.alertType === "EXPIRED" ? "danger" : "warning",
        }));
    }

    // 売上推移データを取得
    await fetchVisitTrendData();
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

// 期間変更時にグラフを更新
watch(visitTrendDateRange, () => {
  fetchVisitTrendData();
});

function smoothData(data: number[]): number[] {
  return data;
}

// Define and initialize showFirstCard to true
const showFirstCard = ref(true);
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;
  background: linear-gradient(to bottom, #f5f7fa, #ffffff);

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .el-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }

    &:hover .close-icon {
      opacity: 1;
    }

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
  }

  .version-item {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    transition: all 0.3s ease;

    &.latest-item {
      background: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-5);
    }

    &:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .version-content {
      margin: 12px 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
    }
  }

  .product-ranking {
    .ranking-item {
      padding: 12px;
      margin-bottom: 8px;
      background: #ffffff;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: var(--el-fill-color-lighter);
        transform: translateX(5px);
      }

      .ranking-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 50%;
        background: #f5f7fa;
        color: #909399;
        transition: all 0.3s ease;

        &.top-1 {
          background: linear-gradient(135deg, #f56c6c, #e6a23c);
          color: white;
          box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
        }

        &.top-2 {
          background: linear-gradient(135deg, #e6a23c, #409eff);
          color: white;
          box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
        }

        &.top-3 {
          background: linear-gradient(135deg, #409eff, #67c23a);
          color: white;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
        }
      }

      .product-image {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        object-fit: cover;
        margin-left: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        vertical-align: middle;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }

  .chart {
    height: 400px;
    background: #ffffff;
    border-radius: 8px;
    padding: 16px;
  }

  .el-tag {
    border-radius: 4px;
    padding: 0 8px;
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    font-weight: 500;
  }

  .el-link {
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  .text-gray {
    color: var(--el-text-color-secondary);
  }

  .text-sm {
    font-size: 13px;
  }

  .text-xs {
    font-size: 12px;
  }

  .font-bold {
    font-weight: 600;
  }

  .mt-2 {
    margin-top: 8px;
  }

  .mt-4 {
    margin-top: 16px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .ml-5 {
    margin-left: 20px;
  }

  .p-3 {
    padding: 12px;
  }

  .w80px {
    width: 80px;
  }

  .h80px {
    height: 80px;
  }

  .rounded-full {
    border-radius: 50%;
  }

  .flex-x-between {
    display: flex;
    justify-content: space-between;
    align-items: left;
  }

  .flex-x-start {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .flex-y-center {
    display: flex;
    align-items: center;
  }

  .h-80px {
    height: 80px;
  }

  .close-icon {
    position: absolute;
    bottom: 10px;
    right: 10px;
    cursor: pointer;
    font-size: 20px;
    color: #909399;
    opacity: 0;
    transition:
      opacity 0.3s ease,
      color 0.3s ease;

    &:hover {
      color: #f56c6c;
    }
  }
}
</style>
