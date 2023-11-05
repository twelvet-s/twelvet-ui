declare namespace SystemDictionariesDrawerinfo {
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
        status: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        dictCode: string;
        dictName: string;
        dictValue: string;
        dictSort: number;
        status: string;
        remark: string;
        createTime: Date;
    };
}
