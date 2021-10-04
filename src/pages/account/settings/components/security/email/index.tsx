import React, { useState } from 'react';

import { EmailType } from './data';

const formItemLayout = {
    labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
    },
}

/**
 * 修改用户邮箱组件
 */

const Email: React.FC<EmailType> = () => {

    const [visible, setVisible] = useState(false);

    return (
        <>
            
        </>
    )

}

export default Email