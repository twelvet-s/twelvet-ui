<template>
  <a-card title="命令统计">
    <div
      id="main"
      ref="echartsRef"
      class="echarts"
      :style="{
        width: '434px',
        height: '279px',
      }"
    ></div>
  </a-card>
</template>

<script lang="ts">
  import { defineComponent, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  import { getRedisChartApi } from '@/api/monitor/redis';

  export default defineComponent({
    name: 'Dashboard',
    setup() {
      // 要操作的配置
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: [],
        },
        series: [
          {
            name: '命令统计',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: [],
            animationEasing: 'cubicInOut',
            animationDuration: 2600,
          },
        ],
      };

      let timer: any;

      const getRedisChart = (barChart) => {
        timer = setInterval(() => {
          const dataName: string[] = [];

          getRedisChartApi().then((res) => {
            const datalists = res.data.commandStats;

            datalists.forEach((r) => {
              dataName.push(r.name);
            });

            barChart.setOption({
              legend: [
                {
                  data: dataName,
                },
              ],
              series: [
                {
                  data: res.data.commandStats,
                },
              ],
            });
          });
        }, 2000);
      };

      onMounted(() => {
        const barChart = echarts.init(
          document.getElementById('main') as HTMLElement
        );
        barChart.setOption(option);
        getRedisChart(barChart);
      });

      onUnmounted(() => {
        console.log('组件卸载，数据模拟定时器关闭');
        clearInterval(timer);
      });
    },
  });
</script>
