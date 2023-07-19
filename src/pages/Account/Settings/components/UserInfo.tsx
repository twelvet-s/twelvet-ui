import React, {useEffect} from 'react'

import {ProForm, ProFormRadio, ProFormText} from '@ant-design/pro-components'
import {Form, message} from 'antd'
import {updateUserProfile} from '../service'
import {system} from '@/utils/twelvet'
import {FormattedMessage} from '@umijs/max'

/**
 * 用户资料设置
 */
const UserInfo: React.FC<{
    user: {
        username: string;
        nickName: string;
        sex: string;
    }
}> = (props) => {

    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(props.user)
    }, [props.user])

    /**
     * 修改信息
     * @param data 修改数据
     */
    const save = async (data: {
        nickName: string;
        phonenumber: string;
        email: string;
        sex: string;
    }) => {

        try {
            const {code, msg} = await updateUserProfile(data)

            if (code !== 200) {
                return message.error(msg);
            }

            message.success(msg);
        } catch (e) {
            system.error(e);
        }
    }

    return (
        <ProForm
            form={form}
            onFinish={save}
        >
            <ProFormText hidden name='username' label="用户名称" placeholder="用户名称"/>
            <ProFormText rules={[{required: true, message: '请输入用户昵称'}]} name='nickName' label="用户昵称"
                         placeholder="用户昵称"/>
            <ProFormText rules={[
                {
                    required: true, message: '请输入手机号码'
                },
                {
                    pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
                    message: (
                        <FormattedMessage
                            id="pages.login.phoneNumber.invalid"
                            defaultMessage="手机号格式错误！"
                        />
                    ),
                },
            ]} name='phonenumber' label="手机号码" placeholder="手机号码"/>
            <ProFormText rules={[
                {required: true, message: '请输入邮箱'},
                {
                    pattern: /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,})$/,
                    message: '不合法的邮箱地址',
                },
            ]} name='email' label="邮箱" placeholder="邮箱"/>
            <ProFormRadio.Group
                rules={[{required: true, message: '请选择性别'}]}
                name='sex'
                label="性别"
                options={[
                    {
                        label: '男',
                        value: '0',
                    },
                    {
                        label: '女',
                        value: '1',
                    },
                    {
                        label: '保密',
                        value: '2',
                    },
                ]}
            />
        </ProForm>
    )

}

export default UserInfo
