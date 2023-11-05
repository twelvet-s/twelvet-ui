declare namespace ToolGen {
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
        tableName: string;
        tableComment: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        tableId: number;
        tableName: string;
        tableComment: string;
        className: string;
        createTime: Date;
        updateTime: Date;
    };
}
