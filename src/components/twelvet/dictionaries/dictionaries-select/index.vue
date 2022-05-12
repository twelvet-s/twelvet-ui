<template>
  <a-select
    :default-value="['Beijing', 'Shanghai']"
    placeholder="Please select ..."
    multiple
  >
    <a-option>Beijing</a-option>
    <a-option>Shanghai</a-option>
    <a-option>Guangzhou</a-option>
    <a-option disabled>Disabled</a-option>
    <a-option>Shenzhen</a-option>
    <a-option>Chengdu</a-option>
    <a-option>Wuhan</a-option>
  </a-select>
</template>

<script lang="ts" setup></script>

<style scoped></style>
