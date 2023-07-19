declare namespace MonitorJob {
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
        jobName: string;
        jobGroup: string;
        status: string;
    };

    /**
     * 响应参数
     */
    type PageListItem = {
        jobId: number;
        jobName: string;
        jobGroup: string;
        invokeTarget: string;
        cronExpression: string;
        status: string;
    };
}
