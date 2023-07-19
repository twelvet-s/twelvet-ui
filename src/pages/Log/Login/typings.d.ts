declare namespace LogLogin {
    /**
     * 状态参数
     */
    type State = {
        pageSize: number
        exportExcelLoading: boolean
        deleteLoading: boolean
    }

    /**
     * 搜索参数
     */
    type PageParams = {
        infoId: number
        userName: string
        ipaddr: string
        status: string
        beginTime: string
        endTime: string
        current: number
        pageSize: number
    }

    /**
     * 响应参数
     */
    type PageListItem = {
        infoId: number
        userName: string
        ipaddr: string
        status: string
        msg: string
        accessTime: Date
    }
}
