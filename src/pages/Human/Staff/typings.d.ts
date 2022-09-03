declare namespace HumanStaff {
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
    username: string;
    phonenumber: string;
    status: string;
  };

  /**
   * 响应参数
   */
  type PageListItem = {
    username: string;
    nickName: string;
    dept: string;
    phonenumber: string;
    status: string;
    createTime: Date;
  };
}
