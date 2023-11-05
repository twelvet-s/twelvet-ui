declare namespace ToolGenDrawerInfo {
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
        dsName: string;
        tableName: string;
        tableComment: string;
        current: number;
        pageSize: number;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        tableName: string;
        tableComment: string;
        createTime: Date;
        updateTime: Date;
    };
}
