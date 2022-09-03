declare namespace SystemClient {
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
    clientId: string;
  };

  /**
   * 响应参数
   */
  type PageListItem = {
    clientId: string;
    scope: string;
    authorizedGrantTypes: string;
    accessTokenValidity: string;
    refreshTokenValidity: string;
  };
}
