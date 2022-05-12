<template>
  <a-row :gutter="[10, 10]">
    <a-col :md="{ span: 16 }" :xs="{ span: 24 }">
      <div>
        <a-card title="基本信息">
          <a-descriptions :data="data" bordered :column="2" :size="size" />
        </a-card>
      </div>
    </a-col>

    <a-col :md="{ span: 8 }" :xs="{ span: 24 }">
      <div>
        <BarChart />
      </div>
    </a-col>

    <a-col :md="{ span: 12 }" :xs="{ span: 24 }">
      <!-- <LineChart /> -->
    </a-col>

    <a-col :md="{ span: 12 }" :xs="{ span: 24 }">
      <LineChart1 />
    </a-col>
  </a-row>
</template>

<script lang="ts">
  import BarChart from './components/redisBarChart.vue';
  // import LineChart from './components/redisLineChart.vue';
  import LineChart1 from './components/redisLineChart1.vue';

  export default {
    name: 'Redis',
    components: {
      BarChart,
      // LineChart,
      LineChart1,
    },
    setup() {
      const data = [
        {
          label: 'Redis版本',
          value: 'Socrates',
        },
        {
          label: '运行模式',
          value: '123-1234-1234',
        },
        {
          label: '端口',
          value: 'Beijing',
        },
        {
          label: '客户端数',
          value: 'Beijing',
        },
        {
          label: '运行时间(天)',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
        {
          label: '实用内存',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
        {
          label: '实用CPU',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
        {
          label: '内存配置',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
        {
          label: 'AOF是否开启',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
        {
          label: 'RDB是否成功',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
        {
          label: '网络入口/出口',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
      ];

      return {
        data,
      };
    },
  };
</script>

<style scoped></style>
