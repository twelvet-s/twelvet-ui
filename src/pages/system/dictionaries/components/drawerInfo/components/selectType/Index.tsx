import React, { useEffect, useState } from 'react'
import { message, Select } from 'antd'
import { optionSelect } from './service'
import { system } from '@/utils/twelvet'

/**
 * 字典模块数据管理类型选择器
 */
const DrawerInfo: React.FC<{}> = (props) => {

    const { Option } = Select

    const [treeData, setTreeData] = useState<Array<React.ReactNode>>([])

    useEffect(() => {
        makeTree()
    }, [])

    const makeTree = async () => {
        try {
            const { code, msg, data } = await optionSelect()
            if (code != 200) {
                return message.error(msg)
            }

            // 制作数据
            let tree: Array<React.ReactNode> = []
            data.map((item: {
                dictId: number
                dictType: string
                dictName: string
            }) => {
                tree.push(
                    <Option key={item.dictId} value={item.dictType}>{item.dictName}</Option>
                )
            })

            setTreeData(tree)

        } catch (e) {
            system.error(e)
        }
    }

    return (
        <Select
            {...props}
            placeholder='字典名称'
            showSearch
            allowClear
        >
            {treeData}
        </Select>
    )

}

export default DrawerInfo