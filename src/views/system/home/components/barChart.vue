<template>
  <a-card title="数据分析">
    <Chart height="440px" :option="chartOption" />
  </a-card>
</template>

<script lang="ts" setup>
  import useChartOption from '@/hooks/chart-option';

  const { chartOption } = useChartOption(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        left: 'center',
        bottom: '10',
        data: ['Industries', 'Technology', 'Forex', 'Gold', 'Forecasts'],
      },
      series: [
        {
          name: 'WEEKLY WRITE ARTICLES',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: [
            { value: 200, name: 'Industries' },
            { value: 240, name: 'Technology' },
            { value: 149, name: 'Forex' },
            { value: 60, name: 'Gold' },
            { value: 70, name: 'Forecasts' },
          ],
          animationEasing: 'cubicInOut',
          animationDuration: 2600,
        },
      ],
    };
  });
</script>

<style lang="less" scoped></style>
