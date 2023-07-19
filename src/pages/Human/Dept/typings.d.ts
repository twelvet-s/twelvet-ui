declare namespace HumanDept {

    /**
     * 搜索参数
     */
    type PageParams = {
        current: number;
        pageSize: number;
        deptName: string;
        status: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        deptId: number;
        deptName: string;
        orderNum: string;
        status: string;
        createTime: Date;
    };
}
