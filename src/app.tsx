import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-layout'
import { PageLoading } from '@ant-design/pro-layout'
import { Input, message, notification } from 'antd'
import { getDvaApp, RequestConfig, RunTimeLayoutConfig } from 'umi'
import { history } from 'umi'
import RightContent from '@/components/RightContent'
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { RequestOptionsInit } from 'umi-request'
import TWT from './setting'
import { getCurrentUser } from './pages/login/service'
import { useState } from 'react'
import Footer from './components/TwelveT/Footer'

const isDev = process.env.NODE_ENV === 'development'
const loginPath = '/login'

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
    loading: <PageLoading />,
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
    settings?: Partial<LayoutSettings>
    currentUser?: API.CurrentUser
    fetchUserInfo?: () => Promise<{ user: API.CurrentUser, menus: {} } | undefined>
}> {
    const fetchUserInfo = async () => {
        try {
            const { user = {}, menus = {}, role, permissions, code, msg } = await getCurrentUser()

            if (code != 200) {
                return message.error(msg)
            }
            return {
                user,
                menus,
                role,
                permissions
            }
        } catch (error) {
            history.push(loginPath)
        }
        return undefined
    }
    // 如果是登录页面，不执行
    if (history.location.pathname !== loginPath) {
        const currentUser = await fetchUserInfo()
        return {
            fetchUserInfo,
            currentUser,
            settings: {},
        }
    }
    return {

        fetchUserInfo,
        settings: {},
    }
}

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误/失效）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
}

/**
 * 新增token，加入api前缀
 * @param url 原始URL
 * @param options 操作信息
 * @returns {URL, Options}
 */
const requestHeaderInterceptor = (url: string, options: RequestOptionsInit) => {

    const local = localStorage.getItem(TWT.accessToken)

    const { access_token, expires_in } = local ? JSON.parse(local) : { access_token: '', expires_in: 0 }

    const authHeader = { Authorization: `Bearer ${access_token}` }

    return {
        url: url.substr(0, 1) === '/' ? `/api${url}` : `/api/${url}`,
        options: { ...options, interceptors: true, headers: authHeader },
    }
}

/**
 * 相应处理器
 * @param response Response
 * @param options RequestOptionsInit
 */
const responseHeaderInterceptor = async (response: Response, options: RequestOptionsInit) => {

    if (response.status === 504) {
        notification.error({
            description: '服务异常,无法连接',
            message: codeMessage[504],
        });
        throw new Error(codeMessage[504])
    }

    // blob类型直接返回
    if (options.responseType === 'blob' && response.status == 200) {
        return response;
    }

    const data = await response.clone().json();

    // 默认返回
    let responseRes = response

    // // 处理401状态
    if (data.code === 401) {
        const { params, method, requestPath } = options
        // 执行刷新token
        const res = await getDvaApp()._store.dispatch({
            type: 'user/refreshToken',
            payload: {
                requestPath,
                method,
                responseType: options.responseType,
                data: params
            }
        })

        // 存在返回再设置
        if (res) {
            responseRes = res
        }

    }

    if (data && data.code === 403) {
        notification.error({
            message: data.msg,
        });
        // 跳转到登陆页
        // return router.replace('/user/login');
    } else if (data && data.status === -998) {
        // 无操作权限
        notification.error({
            message: data.msg
        });
    }

    return responseRes;

}

/**
 * 异常处理程序
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    405: '请求方法不被允许。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
 //-----English
    200: The server successfully returned the requested data. ',
    201: New or modified data is successful. ',
    202: A request has entered the background queue (asynchronous task). ',
    204: Data deleted successfully. ',
    400: 'There was an error in the request sent, and the server did not create or modify data. ',
    401: The user does not have permission (token, username, password error). ',
    403: The user is authorized, but access is forbidden. ',
    404: The request sent was for a record that did not exist. ',
    405: The request method is not allowed. ',
    406: The requested format is not available. ',
    410':
        'The requested resource is permanently deleted and will no longer be available. ',
    422: When creating an object, a validation error occurred. ',
    500: An error occurred on the server, please check the server. ',
    502: Gateway error. ',
    503: The service is unavailable. ',
    504: The gateway timed out. ',
 * @see https://beta-pro.ant.design/docs/request-cn
 */
export const request: RequestConfig = {
    errorHandler: (error: any) => {
        const { response } = error

        if (!response) {
            notification.error({
                description: '您的网络发生异常，无法连接服务器',
                message: '网络异常',
            })
        }
        throw error
    },
    // 请求前拦截器
    requestInterceptors: [requestHeaderInterceptor],
    responseInterceptors: [responseHeaderInterceptor]
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {

    const { location } = history

    /**
       * 关键字搜索菜单
       * 
       * @param data 
       * @param keyWord 
       */
    const filterByMenuDate = (data: MenuDataItem[], keyWord: string): MenuDataItem[] => {
        return data.map((item) => {
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

    return {
        rightContentRender: () => <RightContent />,

        disableContentMargin: false,
        waterMarkProps: {
            content: initialState?.currentUser?.user?.username,
        },
        // 渲染菜单数据
        menuDataRender: () => initialState?.currentUser?.menus,
        // 分割菜单
        splitMenus: true,
        // 搜索
        // postMenuData: (menus) => filterByMenuDate(menus || [], ''),
        // 额外主体渲染
        menuExtraRender: ({ collapsed }) => {
            // 菜单搜索框
            return !collapsed && (
                <Input.Search
                    allowClear
                    enterButton
                    placeholder='搜索菜单'
                    size='small'
                    onSearch={(e) => {

                    }}
                />
            )
        },
        menu: {
            defaultOpenAll: false,
            // 关闭菜单多语言
            locale: false,
        },
        footerRender: () => <Footer />,
        onPageChange: () => {

            // 如果没有登录，重定向到 login
            if (!initialState?.currentUser && location.pathname !== loginPath) {
                history.push(loginPath)
            }
        },

        // 开发模式
        links: isDev
            ? [
                <a href="https://www.twelvet.cn/docs/" target="_blank">
                    <QuestionCircleOutlined />
                    <span>官方文档</span>
                </a>
            ]
            : [],
        // 自定义 403 页面
        // unAccessible: <div>unAccessible</div>,
        ...initialState?.settings,
    }
}
