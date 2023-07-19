declare namespace SystemToken {
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
        username: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        username: string;
        clientId: string;
        accessToken: string;
        issuedAt: string;
        expiresAt: string;
    };
}
