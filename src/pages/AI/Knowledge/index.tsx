import React, { useState, useRef } from 'react'
import { useIntl } from '@umijs/max'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import {
    DeleteOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { Popconfirm, Button, message, Modal, Form, Input, Space, Divider, InputNumber } from 'antd'
import { FormInstance } from 'antd/lib/form'
import {
    pageQueryKnowledge,
    getKnowledge,
    delKnowledge,
    addKnowledge,
    updateKnowledge,
    exportKnowledge
} from './service'
import { system } from '@/utils/twelvet'
import { isArray } from 'lodash'
import { proTableConfigs } from '@/setting'


/**
 * AI知识库模块
 */
const Knowledge: React.FC = () => {

    const { formatMessage } = useIntl()

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
            xs: { span: 5 },
            sm: { span: 5 },
        },
        wrapperCol: {
            xs: { span: 20 },
            sm: { span: 20 },
        },
    }


    /**
     * 新增AI知识库数据
     * @param row row
     */
    const refPost = async () => {
        setModal({ title: formatMessage({ id: 'system.add' }), visible: true })
    }

    /**
     * 获取修改AI知识库信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getKnowledge(row.knowledgeId)
            if (code !== 200) {
                return message.error(msg)
            }


            // 赋值表单数据
            form.setFieldsValue(data)

            // 设置Modal状态
            setModal({ title: formatMessage({ id: 'system.update' }), visible: true })

        } catch (e) {
            system.error(e)
        }
    }

    /**
     * 移除AI知识库数据
     * @param knowledgeId
     */
    const refRemove = async (knowledgeId: (string | number)[] | string | undefined) => {
        try {
            if (!knowledgeId) {
                return true
            }

            let params
            if (isArray(knowledgeId)) {
                params = knowledgeId.join(",")
            } else {
                params = knowledgeId
            }

            const { code, msg } = await delKnowledge(params)

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
     * 保存AI知识库数据
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
                        } = fields.knowledgeId === 0 ? await addKnowledge(fields) : await updateKnowledge(fields)
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
            title: '知识库名称', ellipsis: true, width: 200, valueType: "text", dataIndex: 'knowledgeName',
        },
        {
            title: '知识库排序', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'knowledgeSort',
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
                                <EditOutlined />
                                {useIntl().formatMessage({ id: 'system.update' })}
                            </Space>
                        </a>

                        <Divider type="vertical" />

                        <Popconfirm
                            onConfirm={() => refRemove(row.knowledgeId)}
                            title="确定删除吗"
                        >
                            <a href='#'>
                                <Space>
                                    <CloseOutlined />
                                    {useIntl().formatMessage({ id: 'system.delete' })}
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
                rowKey="knowledgeId"
                columns={columns}
                request={async (params) => {
                    const { data } = await pageQueryKnowledge(params);
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
                        {useIntl().formatMessage({ id: 'system.add' })}
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
                            <DeleteOutlined />
                            {useIntl().formatMessage({ id: 'system.delete.batch' })}
                        </Button>
                    </Popconfirm>,
                    <Popconfirm
                        key='export'
                        title="是否导出数据"
                        onConfirm={() => {
                            exportKnowledge({
                                ...formRef.current?.getFieldsValue()
                            })
                        }}
                    >
                        <Button type="default">
                            <FundProjectionScreenOutlined />
                            {useIntl().formatMessage({ id: 'system.export' })}
                        </Button>
                    </Popconfirm>
                ]}

            />

            <Modal
                title={`${modal.title}AI知识库`}
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
                        name="knowledgeId"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="知识库名称"
                        rules={[{ required: true, message: '知识库名称不能为空' }]}
                        name="knowledgeName"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="欢迎语"
                        rules={[{ required: true, message: '欢迎语不能为空' }]}
                        name="welcomeMsg"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="会话轮数"
                        rules={[{ required: true, message: '会话轮数不能为空' }]}
                        name="multiRound"
                        initialValue={5}
                    >
                        <InputNumber />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="匹配条数"
                        rules={[{ required: true, message: '匹配条数不能为空' }]}
                        name="topK"
                        initialValue={3}
                    >
                        <InputNumber />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="排序"
                        rules={[{ required: false, message: '知识库排序不能为空' }]}
                        name="knowledgeSort"
                        initialValue={1}
                    >
                        <InputNumber />
                    </Form.Item>

                </Form>


            </Modal>
        </PageContainer>
    )

}

export default Knowledge
