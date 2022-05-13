<template>
  <a-card title="内存使用">
    <div id="chart" :style="{ height: '300px' }"></div>
  </a-card>
</template>

<script lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';

  export default {
    setup() {
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
            name: '内存使用',
            itemStyle: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2,
              },
            },
            smooth: true,
            type: 'line',
            data: [],
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
          },
        ],
      };
      let timer: any;

      onMounted(() => {
        const lineChart = echarts.init(document.getElementById('chart'));
        lineChart.setOption(config);
      });
    },
  };
</script>

<style lang="less" scoped></style>
