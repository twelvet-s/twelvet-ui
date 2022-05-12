export default {
  path: '/human',
  name: 'human',
  component: () => import('@/layout/index.vue'),
  meta: {
    locale: 'menu.human',
    requiresAuth: true,
    icon: 'icon-user-group',
    order: 3,
  },
  children: [
    {
      path: '/human/staff',
      name: 'human-staff',
      component: () => import('@/views/human/staff/index.vue'),
      meta: {
        locale: 'menu.human.staff',
        requiresAuth: true,
        icon: 'icon-user',
        roles: ['*'],
      },
    },

    {
      path: '/human/role',
      name: 'human-role',
      component: () => import('@/views/human/role/index.vue'),
      meta: {
        locale: 'menu.human.role',
        requiresAuth: true,
        icon: 'icon-stamp',
        roles: ['*'],
      },
    },

    {
      path: '/human/dept',
      name: 'human-dept',
      component: () => import('@/views/human/dept/index.vue'),
      meta: {
        locale: 'menu.human.dept',
        requiresAuth: true,
        icon: 'icon-subscribe',
        roles: ['*'],
      },
    },

    {
      path: '/human/post',
      name: 'human-post',
      component: () => import('@/views/human/post/index.vue'),
      meta: {
        locale: 'menu.human.post',
        requiresAuth: true,
        icon: 'icon-storage',
        roles: ['*'],
      },
    },
  ],
};
