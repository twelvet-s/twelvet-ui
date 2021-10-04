import React, { useState } from 'react';

import { Modal } from 'antd';
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

const Email: React.FC<EmailType> = (props) => {

    /**
     * 取消Modal的显示
     */
    const handleCancel = () => {

        props.onCancel()
    }

    return (
        <>
            <Modal
                title={`修改邮箱`}
                visible={props.emailModal}
                okText={`修改`}
                onCancel={handleCancel}
            >

                敬请期待

            </Modal>
        </>
    )

}

export default Email