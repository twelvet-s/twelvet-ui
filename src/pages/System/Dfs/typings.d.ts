declare namespace SystemDfs {
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
    originalFileName: string;
  };

  /**
   * 响应参数
   */
  type PageListItem = {
    spaceName: string;
    fileName: string;
    originalFileName: string;
    type: string;
    size: string;
    createTime: Date;
  };
}
