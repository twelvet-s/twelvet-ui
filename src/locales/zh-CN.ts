import component from './zh-CN/component';
import globalHeader from './zh-CN/globalHeader';
import menu from './zh-CN/menu';
import pages from './zh-CN/pages';
import pwa from './zh-CN/pwa';
import settingDrawer from './zh-CN/settingDrawer';
import settings from './zh-CN/settings';

export default {
    'navBar.lang': '语言',
    'layout.user.link.help': '帮助',
    'layout.user.link.privacy': '隐私',
    'layout.user.link.terms': '条款',
    'app.preview.down.block': '下载此页面到本地项目',
    'app.welcome.link.fetch-blocks': '获取全部区块',
    'app.welcome.link.block-list': '基于 block 开发，快速构建标准页面',

    'app.development.documentation': '开发文档',
    'system.check': '查看',
    'system.add': '新增',
    'system.update': '修改',
    'system.delete': '删除',
    'system.delete.batch': '批量删除',
    'system.preview': '预览',
    'system.details': '详情',
    'system.sync': '同步',
    'system.export': '导出数据',
    'system.import': '导入数据',
    'system.rest.password': '重置密码',
    'system.data.management': '数据管理',
    'system.upload': '上传文件',
    'system.forceful.retreat': '强退',
    'system.execute': '执行',
    'system.log': '日志',
    'system.init.i18n': '初始化国际化数据',

    'system.gen.code': '生成代码',
    ...pages,
    ...globalHeader,
    ...menu,
    ...settingDrawer,
    ...settings,
    ...pwa,
    ...component,
};
