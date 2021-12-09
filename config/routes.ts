/**
 * 以下配置均被约定所代替,采用自动路由方式
 */
export default [
    // 登录
    {
        title: '登录',
        name: 'login',
        path: '/login',
        layout: false,
        component: './login/_layout',
        routes: [
            {
                title: '首页',
                name: 'login',
                path: '/login',
                component: './login',
            },
        ],
    },
    // 跳转
    {
        path: '/system',
        redirect: '/index',
    },
    // 跳转
    {
        path: '/',
        redirect: '/index',
    },
    {
        title: '首页',
        name: 'home',
        path: '/index',
        icon: 'icon-home',
        component: './index',
    },
    {
        title: '系统管理',
        name: 'systemManagement',
        icon: 'icon-system',
        path: '/system',
        routes: [
            {
                title: '菜单管理',
                icon: 'icon-menu',
                name: 'menu',
                path: '/system/menu',
                component: './system/menu'
            },
            {
                title: '字典管理',
                icon: 'icon-dictionaries',
                name: 'dictionaries',
                path: '/system/dictionaries',
                component: './system/dictionaries'
            },
            {
                title: 'OAuth2终端',
                icon: 'icon-client',
                name: 'client',
                path: '/system/client',
                component: './system/client'
            },
            {
                title: '分布式文件管理',
                icon: 'icon-dfs',
                name: 'dfs',
                path: '/system/dfs',
                component: './system/dfs'
            }
        ]
    },
    // 跳转
    {
        path: '/monitor',
        redirect: '/monitor/redis',
    },
    {
        title: '系统监控',
        icon: 'icon-monitor',
        name: 'monitor',
        path: '/monitor',
        routes: [
            {
                title: '缓存监控',
                icon: 'icon-job',
                name: 'job',
                path: '/monitor/redis',
                component: './monitor/redis'
            },
            {
                title: '定时任务',
                icon: 'icon-job',
                name: 'job',
                path: '/monitor/job',
                component: './monitor/job'
            },
        ]
    },
    // 跳转
    {
        path: '/human',
        redirect: '/human/staff',
    },
    {
        title: '人力管理',
        icon: 'icon-human-resources',
        name: 'human',
        path: '/human',
        routes: [
            {
                title: '职员管理',
                icon: 'icon-team',
                name: 'staffManagement',
                path: '/human/staff',
                component: './human/staff'
            },
            {
                title: '角色管理',
                icon: 'icon-role',
                name: 'role',
                path: '/human/role',
                component: './human/role'
            },
            {
                title: '岗位管理',
                icon: 'icon-post',
                name: 'post',
                path: '/human/post',
                component: './human/post'
            },
            {
                title: '部门管理',
                icon: 'icon-dept',
                name: 'dept',
                path: '/human/dept',
                component: './human/dept'
            }
        ]
    },
    {
        title: '个人账号',
        name: 'account',
        icon: 'icon-account',
        path: '/account',
        routes: [
            // {
            //     title: '个人中心',
            //     name: 'center',
            //     icon: 'icon-user-info',
            //     path: '/account/center',
            //     component: './account/center'
            // },
            {
                title: '个人设置',
                name: 'settings',
                icon: 'icon-settings',
                path: '/account/settings',
                component: './account/settings'
            }
        ]
    },
    // 跳转
    {
        path: '/log',
        redirect: '/log/operation',
    },
    {
        title: '日志管理',
        name: 'log',
        icon: 'icon-log',
        path: '/log',
        routes: [
            {
                title: '操作日志',
                name: 'operation',
                icon: 'icon-log-operation',
                path: '/log/operation',
                component: './log/operation'
            },
            {
                title: '登录日志',
                name: 'login',
                icon: 'icon-log-login',
                path: '/log/login',
                component: './log/login'
            },
            {
                title: '定时任务日志',
                name: 'job',
                icon: 'icon-log-job',
                path: '/log/job',
                component: './log/job'
            }
        ]
    },
    // 跳转
    {
        path: '/tool',
        redirect: '/tool/gen',
    },
    {
        title: '工具箱',
        name: 'tool',
        icon: 'icon-tool-box',
        path: '/tool',
        routes: [
            {
                title: '代码生成器',
                icon: 'icon-gen-code',
                name: 'gen',
                path: '/tool/gen',
                component: './tool/gen'
            },
            {
                title: '图形化编辑器',
                name: 'graphicalEditor',
                icon: 'icon-graphical-edit',
                path: '/tool/graphicalEditor',
                routes: [
                    {
                        title: '流程编辑器',
                        name: 'flow',
                        icon: 'icon-flow-edit',
                        path: '/tool/graphicalEditor/flow',
                        component: './tool/graphicalEditor/flow'
                    },
                    {
                        title: '脑图编辑器',
                        name: 'mind',
                        icon: 'icon-mind-edit',
                        path: '/tool/graphicalEditor/mind',
                        component: './tool/graphicalEditor/mind'
                    },
                    {
                        title: '拓扑编辑器',
                        name: 'koni',
                        icon: 'icon-koni-edit',
                        path: '/tool/graphicalEditor/koni',
                        component: './tool/graphicalEditor/koni'
                    },
                ]
            }
        ]
    },
    {
        component: './404',
    },
]
