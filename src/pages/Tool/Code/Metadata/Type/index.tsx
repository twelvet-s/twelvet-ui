import React, { useState, useRef } from 'react'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import {
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { Popconfirm, Button, message, Modal, Form, Input, Space, Divider } from 'antd'
import { FormInstance } from 'antd/lib/form'
import {
    pageQueryType,
    getType,
    delType,
    addType,
    updateType
} from './service'
import { system } from '@/utils/twelvet'
import { isArray } from 'lodash'
import { proTableConfigs } from '@/setting'
import { useIntl } from '@umijs/max'


/**
 * 字段类型管理模块
 */
const Type: React.FC = () => {

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

    const acForm = useRef<ActionType>()

    const formRef = useRef<FormInstance>()

    const [form] = Form.useForm()

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
     * 新增字段类型管理数据
     * @param row row
     */
    const refPost = async () => {
        setModal({title: formatMessage({id: 'system.add'}), visible: true})
    }

    /**
     * 获取修改字段类型管理信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getType(row.id)
            if (code !== 200) {
                return message.error(msg)
            }


            // 赋值表单数据
            form.setFieldsValue(data)

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true})

        } catch (e) {
            system.error(e)
        }
    }

    /**
     * 移除字段类型管理数据
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

            const { code, msg } = await delType(params)

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
     * 保存字段类型管理数据
     */
    const onSave = () => {
        form
            .validateFields()
            .then(
                async (fields) => {
                    try {
                        // 开启加载中
                        setLoadingModal(true)


                        // ID为0则insert，否则将update
                        const {
                            code,
                            msg
                        } = fields.id === 0 ? await addType(fields) : await updateType(fields)
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
            title: '字段类型', ellipsis: true, width: 200, valueType: "text", dataIndex: 'columnType',
        },
        {
            title: '属性类型', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'attrType',
        },
        {
            title: '属性包名', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'packageName',
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
                    const { data } = await pageQueryType(params);
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
                title={`${modal.title}字段类型管理`}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
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

                    <Form.Item
                        {...formItemLayout}
                        label="字段类型"
                        rules={[{ required: true, message: '字段类型不能为空' }]}
                        name="columnType"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="属性类型"
                        rules={[{ required: false, message: '属性类型不能为空' }]}
                        name="attrType"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="属性包名"
                        rules={[{ required: false, message: '属性包名不能为空' }]}
                        name="packageName"
                    >
                        <Input />
                    </Form.Item>
                </Form>


            </Modal>
        </PageContainer>
    )

}

export default Type
