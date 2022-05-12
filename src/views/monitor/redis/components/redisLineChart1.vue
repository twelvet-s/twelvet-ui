<template>
  <a-card title="Key数量">
    <div id="chart" :style="{ height: '300px' }"></div>
  </a-card>
</template>

<script lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  import { getRedisChartApi } from '@/api/monitor/redis';

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

      let timer: any;
      const getRedisChart = (lineChart) => {
        const dataTiem: string[] = [];
        const dataSize: string[] = [];
        timer = setInterval(() => {
          getRedisChartApi().then((res) => {
            dataTiem.push(res.data.time);
            dataSize.push(res.data.dbSize);
            lineChart.setOption({
              xAxis: [
                {
                  data: dataTiem,
                },
              ],
              series: [
                {
                  data: dataSize,
                },
              ],
            });
          }, 2000000000000);
        });
      };

      onMounted(() => {
        const lineChart = echarts.init(document.getElementById('chart'));
        lineChart.setOption(config);
        getRedisChart(lineChart);
      });
    },
  };
</script>

<style lang="less" scoped></style>
