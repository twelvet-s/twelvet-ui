import type { Settings as LayoutSettings } from '@ant-design/pro-layout'
import { PageLoading } from '@ant-design/pro-layout'
import { message, notification } from 'antd'
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { request as httpRequest } from 'umi'
import { history } from 'umi'
import RightContent from '@/components/RightContent'
import { QuestionCircleOutlined } from '@ant-design/icons'
import type { RequestOptionsInit } from 'umi-request'
import TWT from './setting'
import { getCurrentUser, getRouters, refreshToken as refreshTokenService } from './pages/login/service'
import Footer from './components/TwelveT/Footer'
import { logout, setAuthority } from './utils/twelvet'

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
    fetchUserInfo?: () => Promise<API.CurrentUser | undefined>
}> {
    const fetchUserInfo = async () => {
        try {
            const { user = {}, roles, permissions, code, msg } = await getCurrentUser()
            if (code !== 200) {
                return message.error(msg)
            }

            localStorage.setItem(TWT.preAuthorize, JSON.stringify(permissions))

            const { data } = await getRouters()

            return {
                user,
                menus: data,
                roles,
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
    403: '用户权限不足。',
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

    let authHeader;
    if (!options.headers.Authorization) {
        authHeader = { ...options.headers, Authorization: `Bearer ${access_token}` }
    } else {
        authHeader = {
            ...options.headers,
        }
    }


    return {
        url: url.substr(0, 1) === '/' ? `/api${url}` : `/api/${url}`,
        options: { ...options, interceptors: true, headers: authHeader },
    }
}

/**
 * 刷新token
 * @param url 访问URL（成功刷新后重新请求地址）
 * @param method 请求方式
 * @param responseType 请求类型
 * @param params body
 * @param params query
 * @returns 
 */
const refreshToken: Response = async (
    url: string,
    method: string,
    responseType: string,
    data: {},
    params: {}
) => {

    let response

    // 续签失败将要求重新登录
    const res = await refreshTokenService()

    if (res.code == 400) {
        notification.error({
            message: `续签失败`,
            description: `续签失败,请重新登录`,
        })
        return logout()
    }

    setAuthority(res)

    // 重新请求本次数据
    if (url) {
        await httpRequest(url, {
            method,
            responseType: responseType === 'blob' ? 'blob' : 'json',
            // 禁止自动序列化response
            parseResponse: false,
            data,
            params
        }).then((res: any) => {
            response = res
        })
    }

    // 返回响应
    return response


}

/**
 * 响应处理器
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

    if (response.status === 403) {
        notification.error({
            message: codeMessage[403],
        });
        return false
        // 跳转到登陆页
        // return router.replace('/user/login');
    }

    const responseType = options.responseType

    // blob类型直接返回
    if (responseType === 'blob' && response.status == 200) {
        return response;
    }

    const jsonData = await response.clone().json();

    // 默认返回
    let responseRes = response

    // // 处理401状态
    if (jsonData.code === 401) {
        const { data, params, method, url } = options
        // 执行刷新token
        const res = await refreshToken(
            url,
            method,
            responseType,
            data,
            params
        )

        // 存在返回再设置
        if (res) {
            responseRes = res
        }

    }

    if (jsonData && jsonData.code === 500) {
        notification.error({
            message: jsonData.msg,
        });
        // 跳转到登陆页
        // return router.replace('/user/login');
    } else if (jsonData && jsonData.code === 403) {
        notification.error({
            message: jsonData.msg,
        });
        // 跳转到登陆页
        // return router.replace('/user/login');
    } else if (jsonData && jsonData.status === -998) {
        // 无操作权限
        notification.error({
            message: jsonData.msg
        });
    } else if (jsonData && jsonData.code === 503) {
        // 未开启相关服务
        notification.error({
            description: codeMessage[503],
            message: jsonData.msg,
        });
        throw new Error(jsonData.msg)
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

    return {
        rightContentRender: () => <RightContent />,

        disableContentMargin: false,
        waterMarkProps: {
            // 水印设置
            content: `${initialState?.currentUser?.user?.username}-TwelveT`,
        },
        // 渲染菜单数据
        menuDataRender: () => initialState?.currentUser?.menus,
        // 分割菜单（改为false兼容约定路由）
        splitMenus: false,
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
                <a key='docs' href="https://www.twelvet.cn/docs/" target="_blank" rel="noreferrer">
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
