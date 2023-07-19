declare namespace SystemClient {
    /**
     * 状态参数
     */
    type State = {
        pageSize: number;
    };

    /**
     * 搜索参数
     */
    type PageParams = {
        current: number;
        pageSize: number;
        clientId: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        clientId: number;
        scope: string;
        authorizedGrantTypes: string;
        accessTokenValidity: string;
        refreshTokenValidity: string;
    };
}
