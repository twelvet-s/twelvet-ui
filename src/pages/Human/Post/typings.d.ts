declare namespace HumanPost {
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
        current?: number;
        pageSize?: number;
        postCode: string;
        postName: string;
        status: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        postId: number;
        postCode: string;
        postName: string;
        postSort: number;
        status: string;
        createTime: Date;
    };
}
