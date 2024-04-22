import React, {useEffect, useState} from 'react'
import {message, Switch} from 'antd'
import {system} from '@/utils/twelvet'
import {changeStatus} from './../../service'

/**
 * 状态组件操作
 * @param props row 参数
 */
const JobStatus: React.FC<{
    row: Record<string, any>
}> = (props) => {

    const [loading, setLoading] = useState<boolean>(false)
    const [checked, setChecked] = useState<string>(props.row.status)

    useEffect(() => {
        setChecked(props.row.status)
    }, [props.row.status])

    const toggle = async () => {
        try {
            setLoading(true)
            const params: Record<string, any> = {}
            params.jobId = props.row.jobId
            params.status = checked === '1' ? '0' : '1'
            const {code, msg} = await changeStatus(params)

            if (code !== 200) {
                return message.error(msg)
            }

            if (checked === '1') {
                setChecked('0')
            } else {
                setChecked('1')
            }

            return message.success(msg)
        } catch (e) {
            system.log(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Switch
            loading={loading}
            onClick={toggle}
            checked={checked === '0'}
        />
    )
}

export default JobStatus
