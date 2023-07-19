declare namespace SystemMenu {

    /**
     * 搜索参数
     */
    type PageParams = {
        current: number;
        pageSize: number;
        menuName: string;
        status: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        menuName: string;
        menuType: string;
        icon: string;
        orderNum: string;
        perms: string;
        component: string;
        status: string;
        createTime: Date;
    };
}
