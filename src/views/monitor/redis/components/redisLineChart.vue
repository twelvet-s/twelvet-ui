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
