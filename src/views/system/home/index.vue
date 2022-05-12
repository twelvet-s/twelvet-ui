<template>
  <a-row :gutter="[10, 10]">
    <a-col :md="{ span: 16 }" :xs="{ span: 24 }">
      <div>
        <Panel />
      </div>
    </a-col>

    <a-col :md="{ span: 8 }" :xs="{ span: 24 }">
      <BarChart />
    </a-col>

    <a-col :span="24">
      <LineChart />
    </a-col>

    <a-col :md="{ span: 6 }" :xs="{ span: 24 }">
      <a-card title="官方信息">
        <p>
          官网：<a-link href="https://www.twelvet.cn/" target="_blank"
            >https://www.twelvet.cn</a-link
          >
        </p>
        <p>
          交流群：
          <a-link href="https://jq.qq.com/?_wv=1027&k=cznM6Q00" target="_blank"
            >985830229
          </a-link>
        </p>
      </a-card>
    </a-col>

    <a-col :md="{ span: 10 }" :xs="{ span: 24 }"> <History /></a-col>

    <a-col :md="{ span: 8 }" :xs="{ span: 24 }">
      <a-card title="捐赠支持（用于演示站/维护项目）">
        <a-image
          width="100%"
          src="https://www.twelvet.cn/assets/images/pay.png"
        />
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts">
  import BarChart from './components/barChart.vue';
  import LineChart from './components/lineChart.vue';
  import History from './components/history.vue';
  import Panel from './components/panel.vue';

  export default {
    name: 'Home',
    components: {
      BarChart,
      LineChart,
      History,
      Panel,
    },
  };
</script>

<style lang="less" scoped>
  * {
    font-weight: 500;
  }
</style>
