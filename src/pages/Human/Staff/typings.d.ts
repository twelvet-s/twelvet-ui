declare namespace HumanStaff {

    /**
     * 搜索参数
     */
    type PageParams = {
        current: number;
        pageSize: number;
        username: string;
        phonenumber: string;
        status: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        userId: number;
        username: string;
        nickName: string;
        dept: {
            deptName: string
        };
        phonenumber: string;
        status: string;
        createTime: Date;
    };
}
