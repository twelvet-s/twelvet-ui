import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';

export default function useUser() {
  const router = useRouter();
  // const userStore = useUserStore();
  const logout = async () => {
    // await userStore.logout();
    // const currentRoute = router.currentRoute.value;
    Message.success('登出成功');
    router.push({
      path: '/login',
      // query: {
      //   ...router.currentRoute.value.query,
      //   redirect: currentRoute.name as string,
      // },
    });
    // todo clear srtore [logininfo,session,router]
    //
  };
  return {
    logout,
  };
}
