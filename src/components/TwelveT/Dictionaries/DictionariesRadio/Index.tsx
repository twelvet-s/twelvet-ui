import React, { useEffect, useState } from 'react'
import { CheckboxOptionType, message, Radio, RadioChangeEvent } from 'antd'
import { getDictionariesType } from './service'
import { system } from '@/utils/twelvet'

/**
 * 字典模块数据管理类型选择器
 */
const DictionariesRadio: React.FC<{
    type: string
    onChange?: (e: RadioChangeEvent) => void
}> = (props) => {

    const [treeData, setTreeData] = useState<Array<CheckboxOptionType | string>>([])

    const { type } = props

    const makeTree = async () => {
        try {
            const { code, msg, data } = await getDictionariesType(type)
            if (code !== 200) {
                return message.error(msg)
            }

            // 制作数据
            let tree: Array<CheckboxOptionType | string> = []
            data.map((item: {
                dictCode: number
                dictValue: string
                dictLabel: string
            }) => {
                tree.push(
                    { label: item.dictLabel, value: item.dictValue }
                )
                return false
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
        <Radio.Group
            {...props}
            options={treeData}
        />
    )

}

export default DictionariesRadio
