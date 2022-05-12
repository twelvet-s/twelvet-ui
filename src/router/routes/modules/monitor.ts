export default {
  path: '/monitor',
  name: 'monitor',
  component: () => import('@/layout/index.vue'),
  meta: {
    locale: 'menu.monitor',
    requiresAuth: true,
    icon: 'icon-eye',
    order: 2,
  },
  children: [
    {
      path: '/monitor/redis',
      name: 'monitor-redis',
      component: () => import('@/views/monitor/redis/index.vue'),
      meta: {
        locale: 'menu.monitor.redis',
        requiresAuth: true,
        icon: 'icon-sync',
        roles: ['*'],
      },
    },

    {
      path: '/monitor/job',
      name: 'monitor-job',
      component: () => import('@/views/monitor/job/index.vue'),
      meta: {
        locale: 'menu.monitor.job',
        requiresAuth: true,
        icon: 'icon-history',
        roles: ['*'],
      },
    },
  ],
};
