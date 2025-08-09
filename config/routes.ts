/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,title 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
    {
        path: '/login',
        layout: false,
        name: '登录',
        component: './Login',
    },
    {
        path: '/login/oauth2/:oauth2',
        layout: false,
        name: '第三方登录授权处理',
        component: './Login/OAuth2',
    },
    {
        path: '/',
        name: '欢迎页',
        icon: 'icon-home',
        component: './Index',
    },
    {
        title: '个人账号',
        name: 'account',
        icon: 'icon-Account',
        path: '/account',
        routes: [
            // {
            //     title: '个人中心',
            //     name: 'center',
            //     icon: 'icon-user-info',
            //     path: '/Account/center',
            //     component: './Account/center'
            // },
            {
                title: '个人设置',
                name: 'settings',
                icon: 'icon-settings',
                path: '/account/settings',
                component: './Account/Settings',
            },
        ],
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
                component: './System/Menu',
            },
            {
                title: '字典管理',
                icon: 'icon-dictionaries',
                name: 'dictionaries',
                path: '/system/dictionaries',
                component: './System/Dictionaries',
            },
            {
                title: 'OAuth2终端',
                icon: 'icon-client',
                name: 'client',
                path: '/system/client',
                component: './System/Client',
            },
            {
                title: '分布式文件管理',
                icon: 'icon-dfs',
                name: 'dfs',
                path: '/system/dfs',
                component: './System/Dfs',
            },
            {
                title: '令牌管理',
                icon: 'icon-token',
                name: 'token',
                path: '/system/token',
                component: './System/Token',
            },
            {
                title: '国际化',
                icon: 'icon-I18n',
                name: 'I18n',
                path: '/system/I18n',
                component: './System/I18n',
            },
        ],
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
                component: './Monitor/Redis',
            },
            {
                title: '定时任务',
                icon: 'icon-job',
                name: 'job',
                path: '/monitor/job',
                component: './Monitor/Job',
            },
        ],
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
                component: './Human/Staff',
            },
            {
                title: '角色管理',
                icon: 'icon-role',
                name: 'role',
                path: '/human/role',
                component: './Human/Role',
            },
            {
                title: '岗位管理',
                icon: 'icon-post',
                name: 'post',
                path: '/human/post',
                component: './Human/Post',
            },
            {
                title: '部门管理',
                icon: 'icon-dept',
                name: 'dept',
                path: '/human/dept',
                component: './Human/Dept',
            },
        ],
    },
    /*{
        title: '个人账号',
        name: 'Account',
        icon: 'icon-Account',
        path: '/Account',
        routes: [
            {
                title: '个人中心',
                name: 'center',
                icon: 'icon-user-info',
                path: '/Account/center',
                component: './Account/center'
            },
            {
                title: '个人设置',
                name: 'settings',
                icon: 'icon-settings',
                path: '/Account/settings',
                component: './Account/settings'
            }
        ]
    },*/
    {
        title: 'AI知识库',
        name: 'ai',
        icon: 'icon-ai',
        path: '/ai',
        routes: [
            {
                title: '模型管理',
                name: 'aiModel',
                icon: 'icon-ai-model',
                path: '/ai/model',
                component: './AI/Model',
            },
            {
                title: 'MCP服务',
                name: 'aiMCP',
                icon: 'icon-ai-mcp',
                path: '/ai/mcp',
                component: './AI/Mcp',
            },
            {
                title: '知识库管理',
                name: 'aiKnowledge',
                icon: 'icon-ai-knowledge',
                path: '/ai/knowledge',
                component: './AI/Knowledge',
            },
            // 文档管理
            {
                title: '文档管理',
                name: 'aiDoc',
                icon: 'icon-ai-doc',
                path: '/ai/doc',
                component: './AI/Doc',
            },
            {
                title: 'AI助手',
                name: 'aiChat',
                icon: 'icon-ai-chat',
                path: '/ai/chat',
                component: './AI/Chat',
            },
        ],
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
                component: './Log/Operation',
            },
            {
                title: '登录日志',
                name: 'login',
                icon: 'icon-log-login',
                path: '/log/login',
                component: './Log/Login',
            },
            {
                title: '定时任务日志',
                name: 'job',
                icon: 'icon-log-job',
                path: '/log/job',
                component: './Log/Job',
            },
        ],
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
                title: '开发平台',
                icon: 'icon-gen-code',
                name: 'gen',
                path: '/tool/code',
                routes: [
                    {
                        title: '数据源',
                        icon: 'icon-gen-ds_conf',
                        name: 'ds_conf',
                        path: '/tool/code/ds_conf',
                        component: './Tool/Code/DsConf',
                    },
                    {
                        title: '代码生成器',
                        icon: 'icon-gen-code',
                        name: 'code',
                        path: '/tool/code/gen',
                        component: './Tool/Code/Gen',
                    },
                    {
                        title: '元数据管理',
                        icon: 'icon-gen-metadata',
                        name: 'metadata',
                        path: '/tool/code/metadata',
                        routes: [
                            {
                                title: '字段管理',
                                icon: 'icon-gen-metadata-type',
                                name: 'type',
                                path: '/tool/code/metadata/type',
                                component: './Tool/Code/Metadata/Type',
                            },
                            {
                                title: '模板管理',
                                icon: 'icon-gen-metadata-template',
                                name: 'template',
                                path: '/tool/code/metadata/template',
                                component: './Tool/Code/Metadata/Template',
                            },
                            {
                                title: '模板分组',
                                icon: 'icon-gen-metadata-template_group',
                                name: 'template_group',
                                path: '/tool/code/metadata/template_group',
                                component: './Tool/Code/Metadata/TemplateGroup',
                            },
                        ],
                    },
                ],
            },

            // {
            //     title: '图形化编辑器',
            //     name: 'graphicalEditor',
            //     icon: 'icon-graphical-edit',
            //     path: '/tool/graphicalEditor',
            //     routes: [
            //         {
            //             title: '流程编辑器',
            //             name: 'flow',
            //             icon: 'icon-flow-edit',
            //             path: '/tool/graphicalEditor/flow',
            //             component: './tool/graphicalEditor/flow'
            //         },
            //         {
            //             title: '脑图编辑器',
            //             name: 'mind',
            //             icon: 'icon-mind-edit',
            //             path: '/tool/graphicalEditor/mind',
            //             component: './tool/graphicalEditor/mind'
            //         },
            //         {
            //             title: '拓扑编辑器',
            //             name: 'koni',
            //             icon: 'icon-koni-edit',
            //             path: '/tool/graphicalEditor/koni',
            //             component: './tool/graphicalEditor/koni'
            //         },
            //     ]
            // }
        ],
    },
    {
        path: '*',
        component: './404',
    },
];
