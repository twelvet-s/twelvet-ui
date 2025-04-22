import component from './en-US/component';
import globalHeader from './en-US/globalHeader';
import menu from './en-US/menu';
import pages from './en-US/pages';
import pwa from './en-US/pwa';
import settingDrawer from './en-US/settingDrawer';
import settings from './en-US/settings';

export default {
    'navBar.lang': 'Languages',
    'layout.user.link.help': 'Help',
    'layout.user.link.privacy': 'Privacy',
    'layout.user.link.terms': 'Terms',
    'app.preview.down.block': 'Download this page to your local project',
    'app.welcome.link.fetch-blocks': 'Get all block',
    'app.welcome.link.block-list': 'Quickly build standard, pages based on `block` development',

    'app.development.documentation': 'Development Documentation',
    'system.check': 'Check',
    'system.add': 'Add',
    'system.update': 'Update',
    'system.delete': 'Delete',
    'system.delete.batch': 'Batch Delete',
    'system.preview': 'Preview',
    'system.details': 'Details',
    'system.sync': 'Sync',
    'system.export': 'Export Data',
    'system.import': 'Import Data',
    'system.rest.password': 'Reset Password',
    'system.data.management': 'Data Management',
    'system.upload': 'Upload File',
    'system.forceful.retreat': 'Forceful Retreat',
    'system.execute': 'Execute',
    'system.log': 'Log',
    'system.init.i18n': 'Initialize I18n data',

    'system.gen.code': 'Generate Code',
    ...globalHeader,
    ...menu,
    ...settingDrawer,
    ...settings,
    ...pwa,
    ...component,
    ...pages,
};
