<template>
  <a-card title="数据分析">
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
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
        legend: {
          data: ['expected', 'actual'],
        },
        series: [
          {
            name: 'expected',
            itemStyle: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2,
              },
            },
            smooth: true,
            type: 'line',
            data: [100, 100, 300, 200, 300, 500, 800],
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
          },
          {
            name: 'actual',
            smooth: true,
            type: 'line',
            itemStyle: {
              color: '#3888fa',
              lineStyle: {
                color: '#3888fa',
                width: 2,
              },
              areaStyle: {
                color: '#f3f8ff',
              },
            },
            data: [120, 300, 400, 180, 400, 600, 999],
            animationDuration: 2000,
            animationEasing: 'quadraticOut',
          },
        ],
      };

      let timer: any;

      onMounted(() => {
        const lineChart = echarts.init(document.getElementById('chart'));
        lineChart.setOption(config);
        console.log('组件装载，数据模拟定时器开启');
        timer = setInterval(() => {
          const random1 = Math.ceil(Math.random() * 1000);
          const random2 = Math.ceil(Math.random() * 1000);
          const random3 = Math.ceil(Math.random() * 1000);
          const random4 = Math.ceil(Math.random() * 1000);
          const random5 = Math.ceil(Math.random() * 1000);
          const random6 = Math.ceil(Math.random() * 1000);
          const random7 = Math.ceil(Math.random() * 1000);

          const random01 = Math.ceil(Math.random() * 1000);
          const random02 = Math.ceil(Math.random() * 1000);
          const random03 = Math.ceil(Math.random() * 1000);
          const random04 = Math.ceil(Math.random() * 1000);
          const random05 = Math.ceil(Math.random() * 1000);
          const random06 = Math.ceil(Math.random() * 1000);
          const random07 = Math.ceil(Math.random() * 1000);

          config.series[0].data = [
            random1,
            random2,
            random3,
            random4,
            random5,
            random6,
            random7,
          ];
          config.series[1].data = [
            random01,
            random02,
            random03,
            random04,
            random05,
            random06,
            random07,
          ];

          lineChart.setOption(config);
        }, 2000);

        onUnmounted(() => {
          console.log('组件卸载，数据模拟定时器关闭');
          clearInterval(timer);
        });
      });
    },
  };
</script>

<style lang="less" scoped></style>
