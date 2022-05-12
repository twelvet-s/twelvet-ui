export default {
  path: '/system',
  name: 'system',
  component: () => import('@/layout/index.vue'),
  meta: {
    locale: 'menu.system',
    requiresAuth: true,
    icon: 'icon-dashboard',
    order: 1,
  },
  children: [
    {
      path: '/index',
      name: 'index',
      component: () => import('@/views/system/home/index.vue'),
      meta: {
        locale: 'menu.system.index',
        requiresAuth: true,
        icon: 'icon-home',
        roles: ['*'],
      },
    },
    {
      path: '/system/menu',
      name: 'system-menu',
      component: () => import('@/views/system/menu/index.vue'),
      meta: {
        locale: 'menu.system.menu',
        requiresAuth: true,
        icon: 'icon-book',
        roles: ['*'],
      },
    },
    {
      path: '/system/dictionaries',
      name: 'system-dictionaries',
      component: () => import('@/views/system/dictionaries/index.vue'),
      meta: {
        locale: 'menu.system.dictionaries',
        requiresAuth: true,
        icon: 'icon-layers',
        roles: ['*'],
      },
    },
    {
      path: '/system/client',
      name: 'system-client',
      component: () => import('@/views/system/client/index.vue'),
      meta: {
        locale: 'menu.system.client',
        requiresAuth: true,
        icon: 'icon-robot-add',
        roles: ['*'],
      },
    },
    {
      path: '/system/dfs',
      name: 'system-dfs',
      component: () => import('@/views/system/dfs/index.vue'),
      meta: {
        locale: 'menu.system.dfs',
        requiresAuth: true,
        icon: 'icon-storage',
        roles: ['*'],
      },
    },
  ],
};
