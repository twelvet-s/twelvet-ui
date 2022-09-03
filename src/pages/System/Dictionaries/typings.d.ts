declare namespace SystemDictionaries {
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
    dictName: string;
    dictType: string;
    status: string;
  };

  /**
   * 响应参数
   */
  type PageListItem = {
    dictName: string;
    dictType: string;
    status: string;
    remark: string;
    createTime: Date;
  };
}
