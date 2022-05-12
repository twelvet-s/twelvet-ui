export default {
  path: '/log',
  name: 'log',
  component: () => import('@/layout/index.vue'),
  meta: {
    locale: 'menu.log',
    requiresAuth: true,
    icon: 'icon-archive',
    order: 4,
  },
  children: [
    {
      path: '/log/operation',
      name: 'log-operation',
      component: () => import('@/views/log/operation/index.vue'),
      meta: {
        locale: 'menu.log.operation',
        requiresAuth: true,
        icon: 'icon-desktop',
        roles: ['*'],
      },
    },

    {
      path: '/log/login',
      name: 'log-login',
      component: () => import('@/views/log/login/index.vue'),
      meta: {
        locale: 'menu.log.login',
        requiresAuth: true,
        icon: 'icon-file',
        roles: ['*'],
      },
    },

    {
      path: '/log/job',
      name: 'log-job',
      component: () => import('@/views/log/job/index.vue'),
      meta: {
        locale: 'menu.log.job',
        requiresAuth: true,
        icon: 'icon-folder',
        roles: ['*'],
      },
    },
  ],
};
