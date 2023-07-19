import React, {useState, useEffect} from 'react'
import {TreeSelect} from 'antd'
import {treeSelect} from '../../service'
import {system} from '@/utils/twelvet'

const DeptSearch: React.FC = props => {

    // 部门数据
    const [depts, setDepts] = useState<Record<string, any>[]>([{}])

    const makeDept = async () => {
        try {
            const {data} = await treeSelect()

            setDepts(data)

        } catch (e) {
            system.error(e)
        }
    }

    useEffect(() => {
        makeDept()
    }, [])

    return (
        <>
            <TreeSelect
                // 必须设置props，否则无法取值Search
                {...props}
                placeholder={"部门"}
                allowClear
                showSearch
                treeLine
                treeNodeFilterProp="title"
                treeNodeLabelProp='title'
                treeData={depts}
            />
        </>
    )
}

export default DeptSearch
