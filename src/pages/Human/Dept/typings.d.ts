declare namespace HumanDept {
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
    deptName: string;
    status: string;
  };

  /**
   * 响应参数
   */
  type PageListItem = {
    deptName: string;
    orderNum: string;
    status: string;
    createTime: Date;
  };
}
