import React, {} from 'react'

import {ProForm, ProFormText} from '@ant-design/pro-components'
import {Form, message} from 'antd'
import {updateUserPwd} from '../service'
import {system} from '@/utils/twelvet'

/**
 * 用户资料设置
 */
const RestPassword: React.FC = () => {

    const [form] = Form.useForm();

    /**
     * 修改信息
     * @param data 修改数据
     */
    const save = async (data: {
        oldPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) => {

        try {

            if (data.newPassword !== data.confirmPassword) {
                return message.error("确认密码不一致，请重新输入");
            }

            const {code, msg} = await updateUserPwd(data)

            if (code !== 200) {
                return message.error(msg);
            }

            message.success(msg);
        } catch (e) {
            system.error(e);
        }
    }

    return (
        <ProForm form={form} onFinish={save}>
            <ProFormText rules={[{required: true, message: '请输入旧密码'}]} name='oldPassword' label="旧密码"
                         placeholder="旧密码"/>
            <ProFormText rules={[{required: true, message: '请输入新密码'}]} name='newPassword' label="新密码"
                         placeholder="新密码"/>
            <ProFormText rules={[{required: true, message: '请输入确认密码'}]} name='confirmPassword' label="确认密码"
                         placeholder="确认密码"/>
        </ProForm>
    )

}

export default RestPassword
