const { NODE_ENV } = process.env

const isDev: boolean = NODE_ENV == 'development'
const urlPrefix: string = '/api'

const TWT: any = {
    // OAuth2
    accessToken: 'TWT_access_token',
    refreshToken: 'TWT_refresh_token',
    // 权限cookie
    preAuthorize: 'TWT_pre_authorize',
    // 是否dev模式
    isDev,
    // api请求前缀
    urlPrefix,
    action: `${urlPrefix}/`,
    uploadUrl: `${urlPrefix}/dfs/commonUpload`,
    static: 'http://static.twelvet.cn'
}

export default TWT