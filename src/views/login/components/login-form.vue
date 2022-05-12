<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">
      <a href="/" class="login-form-title-title___3F8Ha">
        <img :src="file" class="login-form-logo___3tfTW" alt="标识" />
        {{ $t('login.form.title') }}</a
      ></div
    >
    <div class="login-form-sub-title">{{ $t('login.form.titlesubMes') }}</div>
    <div class="login-form-error-msg">{{ errorMessage }}</div>
    <a-form
      ref="loginForm"
      :model="userInfo"
      class="login-form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <a-form-item
        field="username"
        :rules="[{ required: true, message: $t('login.form.userName.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input
          v-model="userInfo.username"
          :placeholder="$t('login.form.userName.placeholder')"
        >
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: $t('login.form.password.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="userInfo.password"
          :placeholder="$t('login.form.password.placeholder')"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-space :size="16" direction="vertical">
        <div class="login-form-password-actions">
          <a-checkbox
            checked="rememberPassword"
            :model-value="loginConfig.rememberPassword"
            @change="setRememberPassword"
          >
            {{ $t('login.form.rememberPassword') }}
          </a-checkbox>
          <a-link>{{ $t('login.form.forgetPassword') }}</a-link>
        </div>
        <a-button type="primary" html-type="submit" long :loading="loading">
          {{ $t('login.form.login') }}
        </a-button>
      </a-space>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useI18n } from 'vue-i18n';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import { LoginData } from '@/api/user';

  function getAssetsImages(name) {
    return new URL(`/src/assets/images/${name}`, import.meta.url).href;
  }
  const router = useRouter();
  const { t } = useI18n();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();

  const loginConfig = useStorage('login-config', {
    rememberPassword: false,
    username: 'admin', // 演示默认值
    password: '123456', // demo default value
  });
  const userInfo = reactive({
    username: loginConfig.value.username,
    password: loginConfig.value.password,
  });
  const file = getAssetsImages('logo.svg');
  const handleSubmit = async ({
    errors,
    values,
  }: {
    errors: Record<string, ValidatedError> | undefined;
    values: LoginData;
  }) => {
    if (!errors) {
      setLoading(true);
      try {
        await userStore.login(values);
        const { ...othersQuery } = router.currentRoute.value.query;
        router.push({
          name: 'index',
          query: {
            ...othersQuery,
          },
        });
        Message.success(t('login.form.login.success'));
        const { rememberPassword } = loginConfig.value;
        const { username, password } = values;
        // 实际生产环境需要进行加密存储。
        // The actual production environment requires encrypted storage.
        loginConfig.value.username = rememberPassword ? username : '';
        loginConfig.value.password = rememberPassword ? password : '';
      } catch (err) {
        errorMessage.value = (err as Error).message;
      } finally {
        setLoading(false);
      }
    }
  };
  const setRememberPassword = (value: boolean) => {
    loginConfig.value.rememberPassword = value;
  };
</script>

<style lang="less" scoped>
  a {
    color: #000; /* 去除默认的颜色和点击后变化的颜色 */
    text-decoration: none; /* 去除默认的下划线 */
  }

  .login-form-title {
    &-title___3F8Ha {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
      font-size: 33px;
      font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif;
      line-height: 47px;
    }
  }

  .login-form {
    &-wrapper {
      width: 320px;
    }

    &-logo___3tfTW {
      height: 44px;
      margin-right: 16px;
      vertical-align: top;
    }

    &-title {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 24px;
      line-height: 32px;
      text-align: center;
    }

    &-sub-title {
      color: var(--color-text-3);
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      line-height: 60px;
      text-align: center;
    }

    &-error-msg {
      height: 32px;
      color: rgb(var(--red-6));
      line-height: 32px;
    }

    &-password-actions {
      display: flex;
      justify-content: space-between;
    }

    &-register-btn {
      color: var(--color-text-3) !important;
    }
  }
</style>
