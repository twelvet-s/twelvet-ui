<template>
  <div id="footer">
    <div class="ctn">
      <a-link target="_blank" href="https://www.twelvet.cn">TwelveT</a-link>
      <a-link target="_blank" href="https://gitee.com/twelvet/twelvet">
        <icon-github />
      </a-link>
      <a-link target="_blank" href="https://www.twelvet.cn/docs"
        >开发文档
      </a-link>
    </div>

    <div id="ctn-copyright">
      <icon-copyright />
      2020 - {{ new Date().getFullYear() }} TwelveT
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
  #footer {
    margin: 48px 0 24px;
    padding: 0 16px;
    color: rgba(0, 0, 0, 0.45);
    text-align: center;

    a {
      color: rgba(0, 0, 0, 0.45);
      text-decoration-line: none;
    }

    a:hover {
      color: rgba(0, 0, 0, 0.85);
    }
  }

  .ctn {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    width: 180px;
    margin: 0 auto;
  }

  #ctn-copyright {
    padding: 8px 0 0 0;
  }
</style>
