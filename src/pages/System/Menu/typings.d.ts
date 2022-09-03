declare namespace SystemMenu {
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
    menuName: string;
    status: string;
  };

  /**
   * 响应参数
   */
  type PageListItem = {
    menuName: string;
    icon: string;
    orderNum: string;
    perms: string;
    component: string;
    status: string;
    createTime: Date;
  };
}
