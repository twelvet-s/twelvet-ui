declare namespace LogOperation {
    /**
     * 状态参数
     */
    type State = {
        pageSize: number;
        exportExcelLoading: boolean;
        deleteLoading: boolean;
    };

    /**
     * 搜索参数
     */
    type PageParams = {
        current: number;
        pageSize: number;
        service: string;
        operName: string;
        dateTime: date;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        service: string;
        requestMethod: string;
        businessType: string;
        operName: string;
        operIp: string;
        status: string;
        dateTime: date;
    };
}
