export default {
  path: '/tool',
  name: 'tool',
  component: () => import('@/layout/index.vue'),
  meta: {
    locale: 'menu.tool',
    requiresAuth: true,
    icon: 'icon-tool',
    order: 5,
  },
  children: [
    {
      path: '/tool/gen',
      name: 'tool-gen',
      component: () => import('@/views/tool/gen/index.vue'),
      meta: {
        locale: 'menu.tool.gen',
        requiresAuth: true,
        icon: 'icon-code',
        roles: ['*'],
      },
    },

    // {
    //   path: '/graphicalEditor',
    //   name: 'graphicalEditor',
    //   component: () => import('@/views/tool/graphicalEditor/index.vue'),
    //   meta: {
    //     locale: 'menu.tool.graphicalEditor',
    //     requiresAuth: true,
    //     icon: 'icon-printer',
    //     roles: ['*'],
    //   },

    //   children: [
    //     {
    //       path: '/flow',
    //       name: 'flow',
    //       component: () =>
    //         import('@/views/tool/graphicalEditor/flow/index.vue'),
    //       meta: {
    //         locale: 'menu.tool.graphicalEditor.flow',
    //         requiresAuth: true,
    //         icon: 'icon-tool',
    //         roles: ['*'],
    //       },
    //     },

    //     {
    //       path: '/koni',
    //       name: 'koni',
    //       component: () =>
    //         import('@/views/tool/graphicalEditor/koni/index.vue'),
    //       meta: {
    //         locale: 'menu.tool.graphicalEditor.koni',
    //         requiresAuth: true,
    //         roles: ['*'],
    //         icon: 'icon-tool',
    //       },
    //     },

    //     {
    //       path: '/mind',
    //       name: 'mind',
    //       component: () =>
    //         import('@/views/tool/graphicalEditor/mind/index.vue'),
    //       meta: {
    //         locale: 'menu.tool.graphicalEditor.mind',
    //         requiresAuth: true,
    //         roles: ['*'],
    //         icon: 'icon-tool',
    //       },
    //     },
    //   ],
    // },
  ],
};
