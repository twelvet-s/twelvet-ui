import React, {useEffect, useState} from 'react'
import {Select} from 'antd'
import {optionSelect} from './service'
import {system} from '@/utils/twelvet'

/**
 * 字典模块数据管理类型选择器
 */
const DrawerInfo: React.FC<any> = (props) => {

    const {Option} = Select

    const [treeData, setTreeData] = useState<React.ReactNode[]>([])

    const makeTree = async () => {
        try {
            const {data} = await optionSelect()

            // 制作数据
            const tree: React.ReactNode[] = []
            data.forEach((item: {
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

    useEffect(() => {
        makeTree()
    }, [])

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
