declare namespace LogLogin {
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
    current?: number;
    pageSize?: number;
    userName: ?string;
    ipaddr: string;
    status: string;
    msg: string;
    accessTime: Date;
    between?: string;
    beginTime?: string;
    endTime?: string;
  };

  /**
   * 响应参数
   */
  type PageListItem = {
    userName: ?string;
    ipaddr: string;
    status: string;
    msg: string;
    accessTime: Date;
  };
}
