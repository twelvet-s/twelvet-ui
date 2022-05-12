import localeMessageBox from '@/components/message-box/locale/zh-CN';
import localeLogin from '@/views/login/locale/zh-CN';

import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN';

import localeSettings from './zh-CN/settings';

export default {
  'twelvet': 'twelvet',
  'TwelveT': 'twelvet',
  'menu.dashboard': '仪表盘',
  'menu.system': '系统管理',
  'menu.system.index': '欢迎页',
  'menu.system.menu': '菜单管理',
  'menu.system.dictionaries': '字典管理',
  'menu.system.client': 'OAuth2终端',
  'menu.system.dfs': '文件管理',

  'menu.monitor': '系统监控',
  'menu.monitor.redis': '缓存监控',
  'menu.monitor.job': '定时任务',

  'menu.human': '人力管理',
  'menu.human.staff': '职员管理',
  'menu.human.role': '角色管理',
  'menu.human.dept': '部门管理',
  'menu.human.post': '岗位管理',

  'menu.log': '日志管理',
  'menu.log.operation': '操作日志',
  'menu.log.login': '登录日志',
  'menu.log.job': '定时任务日志',

  'menu.tool': '工具箱',
  'menu.tool.gen': '代码生成器',
  'menu.tool.graphicalEditor': '图形化编辑器',
  'menu.tool.graphicalEditor.flow': '流程编辑器',
  'menu.tool.graphicalEditor.koni': '拓扑编辑器',
  'menu.tool.graphicalEditor.mind': '脑图编辑器',

  'menu.user': '个人中心',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',
  ...localeSettings,
  ...localeMessageBox,
  ...localeLogin,
  ...localeWorkplace,
};
