<template>
  <a-row :gutter="[10, 10]">
    <a-col :md="{ span: 16 }" :xs="{ span: 24 }">
      <div>
        <a-card title="基本信息">
          <a-descriptions  bordered :column="2" :size="size" >
            <a-descriptions-item
              :label="index"
              v-for="(item, index) in infoData.pleasehoderData"
              :key="index"
              >{{ item }}</a-descriptions-item
            >
          </a-descriptions> 
        </a-card>
      </div>
    </a-col>

    <a-col :md="{ span: 8 }" :xs="{ span: 24 }">
      <div>
        <command-stats-chart :command-stats="commandStats" />
      </div>
    </a-col>

    <a-col :md="{ span: 12 }" :xs="{ span: 24 }">
      <!-- <LineChart /> -->
    </a-col>

    <a-col :md="{ span: 12 }" :xs="{ span: 24 }">
      <LineChart1 :data="info" />
    </a-col>
  </a-row>
</template>

<script lang="ts">
  import {
    defineComponent,
    onMounted,
    onUnmounted,
    reactive,
    toRefs,
  } from 'vue';
  import { getRedisChartApi } from '@/api/monitor/redis';
  import CommandStatsChart from './components/CommandStatsChart.vue';
  import LineChart1 from './components/redisLineChart1.vue';

  export default {
    name: 'Redis',
    components: {
      CommandStatsChart,
      // LineChart,
      LineChart1,
    },
    setup() {
      // let  pleasehoderData:Record<string, unknown>=ref()
      const infoData: Record<string, unknown> = reactive({
        pleasehoderData:{}
      });
      const redisData = reactive({
        commandStats: {},
    
        info: {
          usedmemory: '',
          used_memory_human: '',
          used_memory_peak_human: '',
        },
        dbSize: '',
        time: '',
      });

      /**
       * 设置数据
       */
      const getInfo = async () => {
       await getRedisChartApi().then(({ data }) => {
          const { commandStats,  dbSize, time } = data;
          redisData.commandStats = commandStats;
          infoData.pleasehoderData = data.info;
          // redisData.info = dbSize;
          // redisData.info = time;
        });
      };

      getInfo();

      let timer: any;

      onMounted(() => {
        timer = setInterval(() => {
          getInfo();
        }, 2000);
      });

      onUnmounted(() => {
        clearInterval(timer);
      });

      return {
        ...toRefs(redisData),
        infoData
      };
    },
  };
</script>

<style scoped></style>
