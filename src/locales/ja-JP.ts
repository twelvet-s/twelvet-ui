import component from './ja-JP/component';
import globalHeader from './ja-JP/globalHeader';
import menu from './ja-JP/menu';
import pages from './ja-JP/pages';
import pwa from './ja-JP/pwa';
import settingDrawer from './ja-JP/settingDrawer';
import settings from './ja-JP/settings';

export default {
    'navBar.lang': '言語',
    'layout.user.link.help': 'ヘルプ',
    'layout.user.link.privacy': 'プライバシー',
    'layout.user.link.terms': '利用規約',
    'app.preview.down.block': 'このページをローカルプロジェクトにダウンロードしてください',
    'app.welcome.link.fetch-blocks': '',
    'app.welcome.link.block-list': '',

    'app.development.documentation': '開発ドキュメント',
    'system.check': 'チェック',
    'system.add': '追加',
    'system.update': '更新',
    'system.delete': '削除',
    'system.delete.batch': '一括削除',
    'system.preview': 'プレビュー',
    'system.details': '詳細',
    'system.sync': '同期',
    'system.export': 'データのエクスポート',
    'system.import': 'データのインポート',
    'system.rest.password': 'パスワードのリセット',
    'system.data.management': 'データ管理',
    'system.upload': 'ファイルのアップロード',
    'system.forceful.retreat': '強制退去',
    'system.execute': '実行',
    'system.log': 'ログ＃ログ＃',

    'system.gen.code': 'コード生成',
    ...globalHeader,
    ...menu,
    ...settingDrawer,
    ...settings,
    ...pwa,
    ...component,
    ...pages,
};
