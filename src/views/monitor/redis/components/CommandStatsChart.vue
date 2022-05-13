<template>
  <a-card title="命令统计">
    <div
      id="main"
      ref="echartsRef"
      class="echarts"
      :style="{
        height: '300px',
      }"
    ></div>
  </a-card>
</template>

<script lang="ts">
  import { defineComponent, onMounted, watch, toRaw } from 'vue';
  import * as echarts from 'echarts';

  export default {
    name: 'CommandStatsChart',
    props: {
      commandStats: {},
    },
    setup(props) {
      let barChart;

      watch(
        () => props.commandStats,
        (newValue, oldValue) => {
          const commandStats = toRaw(newValue);
          barChart.setOption({
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)',
            },
            legend: {
              left: 'center',
              bottom: '10',
            },
            series: [
              {
                name: '命令统计',
                type: 'pie',
                roseType: 'radius',
                radius: [15, 95],
                center: ['50%', '38%'],
                data: commandStats,
                animationEasing: 'cubicInOut',
                animationDuration: 2600,
              },
            ],
          });
        },
        {
          // 必须开启深度才有获取到旧数据
          deep: true,
        }
      );

      onMounted(() => {
        barChart = echarts.init(document.getElementById('main') as HTMLElement);
      });
    },
  };
</script>
