declare namespace Gen {
  /**
   * 状态参数
   */
  type State = {
    pageSize: number
  }

  /**
   * 搜索参数
   */
  type PageParams = {
    tableId: number
    tableName: string
    tableComment?: string
    current: number
    pageSize: number
  }

  /**
   * 响应参数
   */
  type PageListItem = {
    tableId: number
    tableName: string
    tableComment: string
    className: string
    createTime: Date
    updateTime: Date
  }
}
