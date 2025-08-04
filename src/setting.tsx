const {NODE_ENV} = process.env;

const isDev: boolean = NODE_ENV === 'development';

const REQUEST_URI = isDev ? 'http://localhost:8080' : 'https://api.twelvet.cn'
/**
 * proTable默认配置
 */
export const proTableConfigs = {
    // 支持横向超出自适应
    scroll: {
        x: 'auto',
    },
    // 分页设置
    // pagination: {
    //     // 是否允许每页大小更改
    //     showSizeChanger: true,
    //     // 每页显示条数
    //     pageSize: 10,
    // },
    // 处理返回数据
    // postData: (data: any[]) => {
    //     if (data instanceof Array) {
    //         return data
    //     }
    //     const { records, total } = data
    //     console.log(records)
    //     return records
    // },
    // 展开子列表设置
    expandable: {
        // 展开列名称
        childrenColumnName: 'children',
        // 展开缩进px
        indentSize: 15,
        defaultExpandAllRows: false,
    },
};

const TWT: any = {
    // 请求API
    requestUri: REQUEST_URI,
    // OAuth2
    accessToken: 'TWT_access_token',
    refreshToken: 'TWT_refresh_token',
    // 权限cookie
    preAuthorize: 'TWT_pre_authorize',
    // 是否dev模式
    isDev,
    action: `${REQUEST_URI}/`,
    uploadUrl: `${REQUEST_URI}/dfs/commonUpload`,
    static: 'https://static.twelvet.cn',
    // 忽略无需登录的路径
    authIgnore: [
        '/login/oauth2/github',
        // TODO 调试使用，后续移除
        '/ai/flow'
    ]
};

export default TWT;
