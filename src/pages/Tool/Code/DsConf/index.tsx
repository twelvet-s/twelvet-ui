import React, { useState, useRef } from 'react'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import {
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { Popconfirm, Button, message, Modal, Form, Input, Space, Divider, Col, Row, InputNumber } from 'antd'
import { FormInstance } from 'antd/lib/form'
import {
    pageQueryConf,
    getConf,
    delConf,
    addConf,
    updateConf
} from './service'
import { system } from '@/utils/twelvet'
import { isArray } from 'lodash'
import { proTableConfigs } from '@/setting'
import DictionariesSelect from '@/components/TwelveT/Dictionaries/DictionariesSelect'
import DictionariesRadio from '@/components/TwelveT/Dictionaries/DictionariesRadio'
import { useIntl } from '@umijs/max'


/**
 * 数据源模块
 */
const Conf: React.FC = () => {

    const {formatMessage} = useIntl()

    const [state] = useState<{
        pageSize: number
    }>({
        pageSize: 10,
    });

    // 显示Modal
    const [modal, setModal] = useState<{ title: string, visible: boolean }>({ title: ``, visible: false })

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false)

    const [confType, setConfType] = useState<0 | 1>(0)

    const [submitPassword, setSubmitPassword] = useState<0 | 1>(1)

    const acForm = useRef<ActionType>()

    const formRef = useRef<FormInstance>()

    const [form] = Form.useForm()

    const formItemLayout = {
        labelCol: {
            xs: { span: 5 },
            sm: { span: 5 },
        },
        wrapperCol: {
            xs: { span: 17 },
            sm: { span: 17 },
        },
    }


    /**
     * 新增数据源数据
     * @param row row
     */
    const refPost = async () => {
        setSubmitPassword(1)
        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    }

    /**
     * 获取修改数据源信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getConf(row.id)
            if (code !== 200) {
                return message.error(msg)
            }


            // 赋值表单数据
            form.setFieldsValue(data)

            // 设置Modal状态
            setSubmitPassword(1)
            setModal({title: formatMessage({id: 'system.update'}), visible: true});

        } catch (e) {
            system.error(e)
        }
    }

    /**
     * 移除数据源数据
     * @param row id
     */
    const refRemove = async (id: (string | number)[] | string | undefined) => {
        try {
            if (!id) {
                return true
            }

            let params
            if (isArray(id)) {
                params = id.join(",")
            } else {
                params = id
            }

            const { code, msg } = await delConf(params)

            if (code !== 200) {
                return message.error(msg)
            }

            message.success(msg)

            acForm?.current?.reload()

        } catch (e) {
            system.error(e)
        }

    }

    /**
     * 取消Modal的显示
     */
    const handleCancel = () => {
        setModal({ title: "", visible: false })

        form.resetFields()

    }

    /**
     * 保存数据源数据
     */
    const onSave = () => {
        form
            .validateFields()
            .then(
                async (fields) => {
                    try {
                        // 开启加载中
                        setLoadingModal(true)

                        if (submitPassword === 1) {
                            fields.password = undefined
                        }

                        // ID为0则insert，否则将update
                        const {
                            code,
                            msg
                        } = fields.id === 0 ? await addConf(fields) : await updateConf(fields)
                        if (code !== 200) {
                            return message.error(msg)
                        }

                        message.success(msg)

                        if (acForm.current) {
                            acForm.current.reload()
                        }

                        // 关闭模态框
                        handleCancel()
                    } catch (e) {
                        system.error(e)
                    } finally {
                        setLoadingModal(false)

                    }
                }).catch(e => {
                    system.error(e)
                })
    }

    // Form参数
    const columns: ProColumns<any>[] = [
        {
            title: '别名', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'name',
        },
        {
            title: '数据库名称', ellipsis: true, width: 200, valueType: "text", dataIndex: 'dsName',
        },
        {
            title: '数据库类型', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'dsType',
        },
        {
            title: '用户名称', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'username',
        },
        {
            title: '创建时间', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'createTime',
        },
        {
            title: '操作',
            fixed: 'right',
            width: 320,
            valueType: "option",
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <>
                        <a onClick={() => refPut(row)}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>

                        <Divider type="vertical" />

                        <Popconfirm
                            onConfirm={() => refRemove(row.id)}
                            title="确定删除吗"
                        >
                            <a href='#'>
                                <Space>
                                    <CloseOutlined />
                                    {formatMessage({id: 'system.delete'})}
                                </Space>
                            </a>
                        </Popconfirm>
                    </>
                )
            }
        },
    ]

    return (
        <PageContainer>
            <ProTable
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="id"
                columns={columns}
                request={async (params) => {
                    const { data } = await pageQueryConf(params);
                    const { records, total } = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
                rowSelection={{}}
                toolBarRender={(action, { selectedRowKeys }) => [
                    <Button key='add' type="default" onClick={refPost}>
                        <PlusOutlined />
                        {formatMessage({id: 'system.add'})}
                    </Button>,
                    <Popconfirm
                        key='batchDelete'
                        disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                        onConfirm={() => refRemove(selectedRowKeys)}
                        title="是否删除选中数据"
                    >
                        <Button
                            disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                            type="primary" danger
                        >
                            <DeleteOutlined/>
                            {formatMessage({id: 'system.delete.batch'})}
                        </Button>
                    </Popconfirm>,
                ]}

            />

            <Modal
                title={`${modal.title}数据源`}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                width={900}
                onOk={onSave}
                onCancel={handleCancel}
                // 销毁组件，要求重新装载
                destroyOnClose
            >

                <Form
                    form={form}
                >
                    <Form.Item
                        hidden
                        {...formItemLayout}
                        label="主键"
                        name="id"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="类型"
                                rules={[{ required: true, message: '数据库类型不能为空' }]}
                                name="dsType"
                                initialValue={'mysql'}
                            >
                                <DictionariesSelect type='ds_type' />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label="用户名"
                                rules={[{ required: true, message: '用户名不能为空' }]}
                                name="username"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label="配置类型"
                                rules={[{ required: true, message: '配置类型不能为空' }]}
                                name="confType"
                                initialValue={'0'}
                            >
                                <DictionariesRadio
                                    onChange={(v: any) => {
                                        const type = parseInt(v.target.value)
                                        if (type === 0 || type === 1) {
                                            setConfType(type)
                                        }
                                    }}
                                    type='ds_config_type' />
                            </Form.Item>

                            {
                                confType === 0 && (
                                    <Form.Item
                                        {...formItemLayout}
                                        label="主机"
                                        rules={[{ required: true, message: '主机不能为空' }]}
                                        name="host"
                                    >
                                        <Input />
                                    </Form.Item>
                                )
                            }

                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="别名"
                                rules={[{ required: true, message: '别名不能为空' }]}
                                name="name"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label="密码"
                                rules={[{ required: true, message: '密码不能为空' }]}
                                name="password"
                            >
                                <Input.Password autoComplete={'new-password'} onChange={() => setSubmitPassword(0)} />
                            </Form.Item>

                            {
                                confType === 0 && (
                                    <>
                                        <Form.Item
                                            {...formItemLayout}
                                            label="端口"
                                            rules={[{ required: true, message: '端口不能为空' }]}
                                            name="port"
                                        >
                                            <InputNumber />
                                        </Form.Item>

                                        <Form.Item
                                            {...formItemLayout}
                                            label="数据库名称"
                                            rules={[{ required: true, message: '数据库名称不能为空' }]}
                                            name="dsName"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </>
                                )
                            }
                        </Col>
                    </Row>

                    {
                        confType === 1 && (
                            <Form.Item
                                label="jdbc-url"
                                rules={[{ required: true, message: 'jdbc-urll不能为空' }]}
                                name="url"
                            >
                                <Input.TextArea />
                            </Form.Item>
                        )
                    }
                </Form>


            </Modal>
        </PageContainer>
    )

}

export default Conf
