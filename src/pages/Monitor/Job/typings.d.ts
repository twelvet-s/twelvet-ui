declare namespace MonitorJob {
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
    jobName: string;
    jobGroup: string;
    status: string;
  };

  /**
   * 响应参数
   */
  type PageListItem = {
    jobName: string;
    jobGroup: string;
    invokeTarget: string;
    cronExpression: string;
    status: string;
  };
}
