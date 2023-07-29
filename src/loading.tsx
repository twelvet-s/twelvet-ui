import React from 'react'

import { Spin } from "antd"
import './loading.less'

const Loading: React.FC = () => {
    return (
        <div className="spin-container">
            <Spin size="large" />
        </div>
    )
}

export default Loading
