import React, { useState, useEffect } from 'react'
import { Select } from 'antd'
import { listQueryTemplate } from '../service'
import { system } from '@/utils/twelvet'

const TemplateSearch: React.FC<{
    onChange?: (value: any, option: any | any[]) => void
}> = props => {

    const [treeData, setTreeData] = useState<any>([])

    const { Option } = Select

    const makeDsConf = async () => {
        try {
            const { data } = await listQueryTemplate()

            // 制作数据
            const tree: any = []

            data.map((item: {
                id: number
                templateName: string
            }) => {
                tree.push(
                    <Option key={item.id} value={item.id}>{item.templateName}</Option>
                )
                return false
            })

            setTreeData(tree)

        } catch (e) {
            system.error(e)
        }
    }

    useEffect(() => {
        makeDsConf()
    }, [])

    return (
        <Select
            // 必须设置props，否则无法取值Search
            {...props}
            placeholder={"数据源"}
            allowClear
            showSearch
            mode={'multiple'}
        >
            {treeData}
        </Select>
    )
}

export default TemplateSearch
