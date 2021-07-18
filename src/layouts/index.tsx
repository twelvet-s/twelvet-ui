/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { BasicLayoutProps as ProLayoutProps, Settings, MenuDataItem, PageLoading } from '@ant-design/pro-layout'
import { createFromIconfontCN } from '@ant-design/icons'
import React, { useEffect, useState } from 'react'
import { Link, useIntl, connect, Dispatch, history, Redirect } from 'umi'
import { Result, Button, Input, Tabs, Dropdown, Menu } from 'antd'
import Authorized from '@/utils/Authorized'
import RightContent from '@/components/GlobalHeader/RightContent'
import { ConnectState } from '@/models/connect'
import { getAuthorityFromRouter } from '@/utils/utils'
import logo from '@/assets/logo.png'
import Footer from '@/components/TwelveT/Footer'
import { CurrentUser } from '@/models/user'
import TWT from '../setting'
import { stringify } from 'querystring'
import styles from './index.less';
import iconfont from '@/assets/js/icon.js'

const IconFont = createFromIconfontCN();

const noMatch = (
    <Result
        status={403}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
            <Button type="primary">
                <Link to="/login">Go Login</Link>
            </Button>
        }
    />
)
export interface BasicLayoutProps extends ProLayoutProps {
    breadcrumbNameMap: {
        [path: string]: MenuDataItem
    }
    route: ProLayoutProps['route'] & {
        authority: string[]
    }
    settings: Settings
    dispatch: Dispatch
    currentUser: CurrentUser
    children: any
    location: {
        pathname: string
    }
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
    breadcrumbNameMap: {
        [path: string]: MenuDataItem
    }
}
/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] => {
    return (
        menuList.map((item) => {
            const localItem = {
                ...item,
                children: item.children ? menuDataRender(item.children) : undefined,
            }
            return Authorized.check(item.authority, localItem, null) as MenuDataItem
        })
    )
}

let menus: MenuDataItem[] = [];

// 所有标签信息
let tabMenus: {
    title: string,
    key: string,
    path: string,
    icon: string,
    // 是否允许关闭标签
    closable: boolean
}[] = [];

// 默认标签
let defaultTabs: {
    title: string,
    key: string,
    path: string,
    icon: string,
    closable: boolean
}[] = []

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {

    // 不存在token需要求登录
    if (props.location.pathname !== '/login' && !localStorage.getItem(TWT.accessToken)) {

        let queryString = stringify({
            redirect: window.location.href,
        });

        if (window.location.href.indexOf("login") > 0) {
            queryString = "";
        }

        return <Redirect to={`/login?${queryString}`} />
    }

    // 登录组件
    if (props.location.pathname === '/login') {
        return props.children
    }


    const {
        dispatch,
        children,
        location = {
            pathname: '/',
        },
        currentUser = {
            menuData: {
                data: null,
                haveSecondaryMenu: [],
                list: null,
                loading: true
            }
        }
    } = props

    // 获取当前用户信息
    useEffect(() => {
        // 获取用户信息
        if (dispatch) {
            // 获取用户信息
            dispatch({
                type: 'user/getCurrentUser',
            })
        }
    }, [])

    // 标题
    const [title] = useState<string>('TwelveT')

    // 是否准备就绪开始渲染
    const [isReady, setIsReady] = useState<boolean>(false)

    // 当前打开标签的列表
    const [tabs, setTabs] = useState<{
        title: string,
        key: string,
        path: string,
        icon: string,
        closable: boolean
    }[]>([]);

    // 当前活动标签
    const [activeTabKey, setActiveTabKey] = useState<string>('');


    // 菜单搜索键值
    const [keyWord, setKeyWord] = useState('')


    // 渲染当前路由
    useEffect(() => {
        // 当加载完成数据再开放渲染
        if (!currentUser.menuData.loading) {
            menus.push(...currentUser.menuData.haveSecondaryMenu)

            tabMenus.push(...currentUser.menuData.list)
            // 设置欢迎页
            currentUser.menuData.list.filter((item: {
                title: string,
                key: string,
                path: string,
                icon: string,
                closable: boolean
            }) => {
                if (item.path === '/') {
                    // 设置默认标签
                    defaultTabs = [{
                        title: item.title,
                        key: item.key,
                        path: item.path,
                        icon: item.icon,
                        closable: false
                    }]

                    setTabs(defaultTabs)
                }
            })
            setIsReady(true);

        }

    }, [currentUser.menuData.data])

    /**
     * 关闭选中标签
     * @param activeKey 当前标签key
     * @param action 当前行为 
     */
    const removeTabs = (activeKey: String, action: String) => {
        if (action === "remove") {

            // 深克隆标签数组
            const newTabs = [...tabs];
            // 索引位置
            let index = 0;

            // 索引长度
            const tabsLength = tabs.length

            // 获取当前需要关闭的key索引值
            for (let i = 0; i < tabs.length; i += 1) {
                if (tabs[i].key === activeKey) {
                    index = i;
                    break;
                }
            }

            //当前索引是否大于当前标签长度
            let openIndex = 0;
            // 当前显示tab是否与关闭tab相同时
            if (activeTabKey === activeKey) {

                // tab长度是否大于index
                if (tabsLength - 1 > index) {
                    openIndex = index + 1
                } else {
                    console.log('执行这里成功')
                    openIndex = index - 1
                }
            } else {
                // 当标签长度为2时索引到欢迎页
                if (tabsLength == 2) {
                    openIndex = 0
                } else {
                    let showIndex = 0
                    // 寻找当前显示的标签位置
                    for (let i = 0; i < tabs.length; i += 1) {
                        if (tabs[i].key === activeTabKey) {
                            showIndex = i;
                            break;
                        }
                    }
                    openIndex = showIndex;
                }
            }

            // 当关闭自己时才执行换标签
            if (activeKey == activeTabKey) {
                history.push(tabs[openIndex].key);
                setActiveTabKey(tabs[openIndex].key);
            }


            setTabs(newTabs.filter(item => item.key !== activeKey));

        }
    }

    /**
     * 导航栏关闭标签
     * @param key 
     */
    const closeTabs = ({ key }: { key: string }) => {
        if (key === "other") {
            const resTabs = tabs.filter(item => {
                // 不允许关闭自己以及首页
                if (item.key === activeTabKey || item.key === defaultTabs[0].key) {
                    return item
                }
            })
            // 关闭其他标签
            setTabs(resTabs);
        } else if (key === "all") {
            // 关闭所有标签
            history.push(defaultTabs[0].path);
            setActiveTabKey(defaultTabs[0].key);
            setTabs(defaultTabs);
        }
    }

    /**
     * 关键字搜索菜单
     * 
     * @param data 
     * @param keyWord 
     */
    const filterByMenuDate = (data: MenuDataItem[], keyWord: string): MenuDataItem[] => {
        return data
            .map((item) => {
                if ((item.name && item.name.includes(keyWord)) ||
                    filterByMenuDate(item.children || [], keyWord).length > 0) {
                    return {
                        ...item,
                        children: filterByMenuDate(item.children || [], keyWord),
                    }
                }
                return undefined
            })
            .filter((item) => item) as MenuDataItem[]
    }

    /**
     * init variables
     */
    const handleMenuCollapse = (payload: boolean): void => {
        if (dispatch) {
            dispatch({
                type: 'global/changeLayoutCollapsed',
                payload,
            })
        }
    } // get children authority

    const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
        authority: undefined,
    }
    const { formatMessage } = useIntl()

    // 全局加载页面
    if (!isReady) {
        return <PageLoading />
    }

    return (
        <ProLayout
            navTheme='light'
            // 拂晓蓝
            primaryColor='#1890ff'
            layout='mix'
            contentWidth='Fluid'
            fixedHeader={false}
            fixSiderbar={true}
            // 是否开启分割菜单
            splitMenus={true}
            colorWeak={false}
            iconfontUrl={iconfont}
            // 渲染菜单数据
            menuDataRender={() => currentUser.menuData.data}
            menu={{
                defaultOpenAll: false,
                locale: false,
                // 控制菜单渲染
                loading: currentUser.menuData.loading,
            }}
            logo={logo}
            // 额外主体渲染
            menuExtraRender={({ collapsed }) =>
                // 菜单搜索框
                !collapsed && (
                    <Input.Search
                        allowClear
                        enterButton
                        placeholder='搜索菜单'
                        size='small'
                        onSearch={(e) => {
                            setKeyWord(e);
                        }}
                    />
                )
            }
            postMenuData={(menus) => filterByMenuDate(menus || [], keyWord)}
            // 标题
            title={title}
            formatMessage={formatMessage}
            onCollapse={handleMenuCollapse}
            // 点击头部Logo
            onMenuHeaderClick={() => history.push('/')}
            // 重写菜单渲染
            menuItemRender={(TWTProps) => {
                const DOM = (
                    <>
                        <span role="img" className="anticon">
                            {TWTProps.icon && < IconFont type={TWTProps.icon.toString()} />}
                        </span>
                        <span>
                            {TWTProps.name}
                        </span>
                    </>
                )
                return (
                    <span className="ant-pro-menu-item">
                        {TWTProps.isUrl ? (
                            <a target='_blank' href={TWTProps.path ? TWTProps.path : '#'}>
                                {DOM}
                            </a>
                        ) : (
                            <Link target={TWTProps.isUrl ? '_blank' : '_self'} to={TWTProps.path ? TWTProps.path : '#'}>
                                {DOM}
                            </Link>
                        )

                        }
                    </span>
                )
            }}
            // 重写拥有子菜单菜单项的 render 方法
            subMenuItemRender={(TWTProps) => {
                return (
                    <>
                        <span className="ant-pro-menu-item">
                            <span role="img" className="anticon">
                                {TWTProps.icon && < IconFont type={TWTProps.icon.toString()} />}
                            </span>

                            <span>
                                {TWTProps.name}
                            </span>
                        </span>

                    </>
                )
            }}
            breadcrumbRender={(routers = []) => [
                {
                    path: '/',
                    breadcrumbName: formatMessage({ id: 'menu.home' }),
                },
                ...routers,
            ]}
            itemRender={(route, params, routes, paths) => {
                const first = routes.indexOf(route) === 0
                return first ? (
                    <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
                ) : (
                    <span>{route.breadcrumbName}</span>
                )
            }}
            // 改变页面时
            onPageChange={(location) => {
                // TODO 多tab栏的切换
                const currentTab = tabs.filter(tab => tab.path === location?.pathname);
                // 是否存在此菜单标签
                if (currentTab.length === 0) {
                    const newTabs = [...tabs];
                    const currentTabMenu = tabMenus.filter(tabMenu => tabMenu.path === location?.pathname);
                    // 是否存在此菜单
                    if (currentTabMenu.length > 0) {
                        newTabs.push({
                            ...currentTabMenu[0],
                        });
                        setTabs(newTabs);
                    }
                }
                setActiveTabKey(location?.pathname || '');
            }}
            // onOpenChange={(openKeys) => {
            //     if (openKeys.length === 1) {
            //         const currentFirstMenu = menus.filter(item => item.path === openKeys[0]);
            //         if (currentFirstMenu && currentFirstMenu.length > 0 && currentFirstMenu[0].routes) {
            //             const secondMenu = currentFirstMenu[0].routes[0];
            //             if (secondMenu.routes) {
            //                 history.push(secondMenu.routes[0].path);
            //             } else {
            //                 history.push(secondMenu.path);
            //             }
            //         }
            //     }
            // }}
            handleOpenChange={(openKeys: String[]) => {
                if (openKeys.length === 1) {
                    const currentFirstMenu = menus.filter(item => item.path === openKeys[0]);
                    if (currentFirstMenu && currentFirstMenu.length > 0 && currentFirstMenu[0].routes) {
                        const secondMenu = currentFirstMenu[0].routes[0];
                        if (secondMenu.routes) {
                            history.push(secondMenu.routes[0].path);
                        } else {
                            history.push(secondMenu.path);
                        }
                    }
                }
            }}
            footerRender={() => <Footer />}
            rightContentRender={() => <RightContent />}
            {...props}

        >
            <Authorized authority={authorized!.authority} noMatch={noMatch}>

                {/* 标签管理列表 */}
                <Tabs
                    className={styles.menuTabs}
                    type="editable-card"
                    activeKey={activeTabKey}
                    hideAdd
                    onTabClick={(activeKey) => {
                        setActiveTabKey(activeKey);
                        history.push(activeKey);
                    }}
                    onEdit={(e, action) => {
                        removeTabs(e, action);
                    }}
                    tabBarExtraContent={
                        <Dropdown trigger={['click']} overlay={
                            <Menu onClick={(e) => closeTabs(e)}>
                                <Menu.Item key='other'>
                                    关闭其他
                                </Menu.Item>
                                <Menu.Item key='all'>
                                    关闭全部
                                </Menu.Item>
                            </Menu>
                        } placement="bottomCenter">
                            <Button style={{ marginRight: 24 }} type='primary'>标签管理</Button>
                        </Dropdown>
                    }
                >

                    {
                        // 渲染标签
                        tabs.map(tab =>
                            <Tabs.TabPane
                                key={tab.key}
                                tab={
                                    <>
                                        < IconFont type={tab.icon} />
                                        {tab.title}
                                    </>
                                }
                                closable={!!tab.closable}
                            />
                        )
                    }

                </Tabs>

                {/* 页面位置信息 */}

                {/* 内容 */}
                <div className={styles.content}>
                    {children}
                </div>
            </Authorized>
        </ProLayout >
    )
}

export default connect(({ user, global, settings }: ConnectState) => ({
    currentUser: user.currentUser,
    collapsed: global.collapsed,
    settings,
}))(BasicLayout)
