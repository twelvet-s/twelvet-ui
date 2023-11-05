declare namespace HumanRole {
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
        roleName: string;
        roleKey: string;
        status: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        roleId: number;
        roleName: string;
        roleKey: string;
        roleSort: number;
        status: string;
        createTime: Date;
    };
}
