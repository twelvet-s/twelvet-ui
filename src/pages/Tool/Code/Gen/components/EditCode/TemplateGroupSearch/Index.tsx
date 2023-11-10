import React, { useState, useEffect } from 'react'
import { Select } from 'antd'
import { selectGenGroupAll } from '../service'
import { system } from '@/utils/twelvet'

const TemplateGroupSearch: React.FC<{
    onChange?: (value: any, option: any | any[]) => void
}> = props => {

    const [treeData, setTreeData] = useState<any>([])

    const { Option } = Select

    const makeDsConf = async () => {
        try {
            const { data } = await selectGenGroupAll()

            // 制作数据
            const tree: any = []

            data.map((item: {
                id: number
                groupName: string
            }) => {
                tree.push(
                    <Option key={item.id} value={item.id}>{item.groupName}</Option>
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
            allowClear
            showSearch
        >
            {treeData}
        </Select>
    )
}

export default TemplateGroupSearch
