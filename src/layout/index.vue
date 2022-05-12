<template>
  <div id="ctn">
    <router-view />
  </div>
</template>

<script lang="ts">
  export default {
    name: 'Layout',
  };
</script>

<style lang="less" scoped>
  #ctn {
    position: relative;
    padding: 10px 10px 10px 10px;
    width: 100%;
    height: 100%;
  }
</style>
