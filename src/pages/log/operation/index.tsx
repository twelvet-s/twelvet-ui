import { Popconfirm } from 'antd'
import React, { useState, useRef, useEffect } from 'react'

/**
 * 操作日志
 */
const Operation: React.FC<{}> = () => {


    return (
        <>
            <Popconfirm
                title="Are you sure to delete this task?"
                okText="Yes"
                cancelText="No"
            >
                <a href="#">Delete</a>
            </Popconfirm>
        </>
    )

}

export default Operation