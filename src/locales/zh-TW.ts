import component from './zh-TW/component';
import globalHeader from './zh-TW/globalHeader';
import menu from './zh-TW/menu';
import pages from './zh-TW/pages';
import pwa from './zh-TW/pwa';
import settingDrawer from './zh-TW/settingDrawer';
import settings from './zh-TW/settings';

export default {
    'navBar.lang': '語言',
    'layout.user.link.help': '幫助',
    'layout.user.link.privacy': '隱私',
    'layout.user.link.terms': '條款',
    'app.preview.down.block': '下載此頁面到本地項目',

    'app.development.documentation': '開發文檔',
    'system.check': '查看',
    'system.add': '新增',
    'system.update': '修改',
    'system.delete': '刪除',
    'system.delete.batch': '批量刪除',
    'system.preview': '預覽',
    'system.details': '詳細信息',
    'system.sync': '同步',
    'system.export': '導出數據',
    'system.import': '導入數據',
    'system.rest.password': '重置密碼',
    'system.data.management': '數據管理',
    'system.upload': '上傳文件',
    'system.forceful.retreat': '強退',
    'system.execute': '執行',
    'system.log': '日誌',
    'system.init.i18n': '初始化國際化數據',

    'system.gen.code': '生成代碼',
    ...pages,
    ...globalHeader,
    ...menu,
    ...settingDrawer,
    ...settings,
    ...pwa,
    ...component,
};
