<template>
  <a-card title="Key数量">
    <div ref="chart" :style="{ height: '300px' }"></div>
  </a-card>
</template>

<script lang="ts">
  import { onMounted, onUnmounted, toRefs } from 'vue';
  import * as echarts from 'echarts';
  import { getRedisChartApi } from '@/api/monitor/redis';

  export default {
    setup(props) {
      // console.log(data.value); // 父组件数据
      const config = {
        xAxis: {
          data: [],
          boundaryGap: false,
          axisTick: {
            show: false,
          },
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
          padding: [5, 10],
        },
        yAxis: {
          axisTick: {
            show: false,
          },
        },
        legend: {},
        series: [
          {
            name: 'key数量',
            itemStyle: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2,
              },
            },
            smooth: true,
            type: 'line',
            data: ['1', '1', '3', '4'],
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
          },
        ],
      };
    },
  };
</script>

<style lang="less" scoped></style>
