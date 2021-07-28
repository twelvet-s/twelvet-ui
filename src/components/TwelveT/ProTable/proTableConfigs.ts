/**
 * proTable默认配置
 */
export default {
    // 支持横向超出自适应
    // 分页设置
    pagination: {
        showSizeChanger: true,
        // 每页显示条数
        pageSize: 10,
    },
    // 处理返回数据
    postData: (data: any[]) => {
        if (data instanceof Array) {
            return data
        }
        const { records } = data
        return records
    },
    // 展开子列表设置
    expandable: {
        // 展开列名称
        childrenColumnName: 'children',
        // 展开缩进px
        indentSize: 50,
        defaultExpandAllRows: true,
    }
}