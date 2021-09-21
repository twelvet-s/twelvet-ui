import React, { Component, useState } from 'react';

import { Button, FormInstance, message, Modal } from 'antd';
import { EmailType } from './data';
import { system } from '@/utils/twelvet';
import { updatePwd } from './service';
import ProForm, { ProFormCheckbox, ProFormDatePicker, ProFormDateTimePicker, ProFormSelect, ProFormText, ProFormTextArea, StepsForm } from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';

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
            <Button type="primary" onClick={() => setVisible(true)}>
                <PlusOutlined />
                分步表单新建
            </Button>
            <StepsForm
                onFinish={async (values) => {
                    console.log(values);
                    setVisible(false);
                    message.success('提交成功');
                }}
                formProps={{
                    validateMessages: {
                        required: '此项为必填项',
                    },
                }}
                stepsFormRender={(dom, submitter) => {
                    return (
                        <Modal
                            title="修改/绑定邮件"
                            width={800}
                            onCancel={() => setVisible(false)}
                            visible={visible}
                            footer={submitter}
                            destroyOnClose
                        >
                            {dom}
                        </Modal>
                    );
                }}
            >
                <StepsForm.StepForm
                    name="base"
                    title="验证邮件"
                    onFinish={async () => {
                        return true;
                    }}
                >
                    <ProFormText
                        name="name"
                        width="md"
                        label="实验名称"
                        tooltip="最长为 24 位，用于标定的唯一 id"
                        placeholder="请输入名称"
                        rules={[{ required: true }]}
                    />
                    
                </StepsForm.StepForm>
                <StepsForm.StepForm name="checkbox" title="设置参数">
                    <ProFormCheckbox.Group
                        name="checkbox"
                        label="迁移类型"
                        width="lg"
                        options={['结构迁移', '全量迁移', '增量迁移', '全量校验']}
                    />
                </StepsForm.StepForm>
                <StepsForm.StepForm name="time" title="发布实验">
                    <ProFormCheckbox.Group
                        name="checkbox"
                        label="部署单元"
                        rules={[
                            {
                                required: true,
                            },
                        ]}
                        options={['部署单元1', '部署单元2', '部署单元3']}
                    />
                    
                </StepsForm.StepForm>
            </StepsForm>
        </>
    )

}

export default Email