import { refreshToken } from '@/pages/Login/service';
import TWT from '@/setting';
import { request, history } from '@umijs/max';
import { notification } from 'antd';

/**
 * 系统日志输出
 */
export const system = {
    log: (...args: any) => {
        if (TWT.isDev) {
            console.log('【TWT】Log:', ...args);
        }
    },
    table: (...args: [any]) => {
        if (TWT.isDev) {
            console.table('【TWT】Table:', ...args);
        }
    },
    /**
     * 唯一的生成环境同样显示
     */
    error: (...args: any) => {
        console.error('【TWT】Error:', ...args);
    },
    trace: (...args: any) => {
        if (TWT.isDev) {
            console.trace('【TWT】Trace:', ...args);
        }
    },
};

/**
 * 定时刷新Token
 * @param expires 过期时间
 */
let tokenTimed: NodeJS.Timeout;
export function timedRefreshToken() {
    // 取消定时任务
    clearTimeout(tokenTimed)

    // 定时刷新token避免过期
    const local = localStorage.getItem(TWT.accessToken);
    const { expires_in } = local ? JSON.parse(local) : { expires_in: 0 }

    tokenTimed = setTimeout(() => {
        // 续签失败将要求重新登录
        refreshToken().then(res => {

            if (res.code === 400) {
                notification.error({
                    message: `Token已失效`,
                    description: `续签失败,请重新登录`,
                    duration: 0,
                });
            } else {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                setAuthority(res);
            }
        });
        // 提前5分钟刷新
    }, expires_in);

}

/**
 * 设置授权令牌
 * @param authority
 */
export function setAuthority(authority: Record<string, any>): void {
    const date = new Date();
    const expires = date.getTime() + (authority.expires_in * 1000)
    // 设置access_token
    localStorage.setItem(
        TWT.accessToken,
        JSON.stringify({
            access_token: authority.access_token,
            expires_in: expires,
        }),
    );

    timedRefreshToken();

    // 设置refresh_token
    localStorage.setItem(TWT.refreshToken, authority.refresh_token);
}

/**
 * 移除授权令牌
 */
export function removeAuthority() {
    // 移除access_token
    localStorage.removeItem(TWT.accessToken);
    // 移除refresh_token
    localStorage.removeItem(TWT.refreshToken);
    // 移除权限
    localStorage.removeItem(TWT.preAuthorize);
}

/**
 * 构造树型结构数据
 * @param params
 */
export const makeTree = (params: {
    dataSource: Record<string, any>[];
    id?: string | 'id';
    parentId?: string | 'parentId';
    children?: string | 'children';
    enhance?: Record<string, string>;
    rootId?: number | false | 0;
}) => {
    // 获取默认数据
    const id = params.id || 'id';
    const parentId = params.parentId || 'parentId';
    const children = params.children || 'children';
    const enhance = params.enhance || [];
    const rootId = params.rootId || 0;

    // 对源数据深克隆
    const cloneData = JSON.parse(JSON.stringify(params.dataSource));

    // 循环所有项
    const treeData = cloneData.filter((father: { [key: string]: any; children: any }) => {
        // 增强参数
        for (const key in enhance) {
            father[key] = father[enhance[key]]
        }

        // 循环找出每个父目录的子目录
        const branchArr = cloneData.filter((child: Record<string, any>) => {
            // 返回每一项的子级数组
            return father[id] === child[parentId];
        });

        // 放进子分类
        if (branchArr.length > 0) {
            father[children] = branchArr;
        }

        // 无需判断直接返回
        if (!rootId && rootId !== 0) {
            return true;
        }

        // 返回第一层
        return father[parentId] === rootId;
    });

    if (treeData.length > 0) {
        return treeData;
    }

    system.error('树列表制作可能出错了,请检查是否正确数据');

    return cloneData;
};

/**
 * 统一退出登录操作
 */
export const logout = () => {
    // 移除授权token
    removeAuthority();
    // 跳转登录
    history.push('/login');
};

/**
 * 获取所有菜单（不包含目录）
 * @param menus 被标准化列表数据
 */
export const reductionMenuList = (
    menus: {
        name: string;
        path: string;
        hidden: boolean;
        icon: string;
        menuType: string;
        routes: {
            name: string;
            path: string;
            hidden: boolean;
            icon: string;
            menuType: string;
            routes: [];
        }[];
    }[],
) => {
    const res: {
        title: string;
        key: string;
        path: string;
        icon: string;
        closable: boolean;
    }[] = [];

    menus.map((item) => {
        let closable = true;
        // 默认首页不允许关闭
        if (item.path === '/') {
            closable = false;
        }

        if (item.menuType === 'C') {
            // 将所有菜单添加
            const menu = {
                title: item.name,
                key: item.path,
                path: item.path,
                icon: item.icon,
                closable,
            };

            res.push(menu);
        }

        if (item?.routes?.length) {
            const reductionMenus = reductionMenuList(item.routes);
            res.push(...reductionMenus);
        }
        return false
    });

    return res;
};

/**
 * 获取文件名称
 * @param contentDisposition 响应头信息
 * @returns 名称
 */
const getFileNameFromContentDisposition = (contentDisposition: string) => {
    const regex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = regex.exec(contentDisposition);
    if (matches !== null && matches[1]) {
        let fileName = matches[1].replace(/['"]/g, '');
        // 解码文件名，如果有需要的话
        fileName = decodeURIComponent(fileName);
        fileName = fileName.replace('utf-8', '')
        return fileName;
    }
    return null;
}

/**
 * 通用下载方法
 * @param url 地址
 * @param params 参数
 * @param filename 文件名称(空即为输出默认)
 */
export const download = (url: string, params?: Record<string, any>, filename?: string) => {
    request(`${url}`, {
        method: 'POST',
        data: {
            ...params,
        },
        params: {
            refresh: new Date().getTime(),
        },
        responseType: 'blob',
        // 需要原始响应头
        getResponse: true,
    })
        .then((response) => {
            let currentFileName = filename;
            // 空的将采用默认
            if (!currentFileName) {
                const contentDisposition = response.headers['content-disposition'];
                if (!contentDisposition) {
                    system.error('获取文件名称失败');
                    return response.data;
                }
                const name = getFileNameFromContentDisposition(contentDisposition)
                if (name) {
                    // 获取并还原编码
                    currentFileName = name;
                } else {
                    currentFileName = 'unknown';
                }
            }

            if ('download' in document.createElement('a')) {
                // 非IE下载
                const link = document.createElement('a');
                link.download = currentFileName || 'unknown';
                link.style.display = 'none';
                link.href = URL.createObjectURL(response.data);
                document.body.appendChild(link);
                link.click();
                URL.revokeObjectURL(link.href);
                document.body.removeChild(link);
            }
        })
        .catch((r) => {
            system.error(r);
        });
};

/**
 * 通用文件上传
 * @param url 地址
 * @param formData 数据对象 FormData
 */
export const upload = (url: string, formData: FormData) => {
    return request(`${url}`, {
        method: 'POST',
        requestType: 'form',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: '*/*',
        },
        data: formData,
    });
};

/**
 * 校验是否存在权限数据
 * @param authStr 需要的权限
 * @returns 具备：false，不具备：true
 */
export const auth = (authStr: string) => {
    const auths = localStorage.getItem(TWT.preAuthorize)
    if (!auths) {
        return true
    }
    const authArr = JSON.parse(auths);
    if (authArr.includes('*:*:*') || authArr.includes('*')) {
        return false
    }

    return !authArr.includes(authStr)
}
