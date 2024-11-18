import React, { useState, useRef } from 'react'
import { useIntl } from '@umijs/max'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import {
    DeleteOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { Popconfirm, Button, message, Modal, Form, Input, Space, Select } from 'antd'
import { FormInstance } from 'antd/lib/form'
import {
    pageQueryDoc,
    getDoc,
    delDoc,
    addDoc,
    updateDoc,
    exportDoc,
    listModelQueryDoc
} from './service'
import { system } from '@/utils/twelvet'
import { isArray } from 'lodash'
import { proTableConfigs } from '@/setting'


/**
 * AI知识库文档模块
 */
const Doc: React.FC = () => {

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

    // 知识库列表
    const [modelData, setModelData] = useState<Array<{
        label: string
        value: number
    }>>([])

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
     * 获取知识库列表
     */
    const selectModelData = async () => {
        try {
            const { code, msg, data } = await listModelQueryDoc({})
            if (code !== 200) {
                return message.error(msg)
            }

            const selectData = []
            for (let model of data) {
                console.log(model)
                selectData.push({
                    label: model.modelName,
                    value: model.modelId
                })
            }
            setModelData(selectData)
        } catch (e) {
            system.error(e)
        }
    }


    /**
     * 新增AI知识库文档数据
     * @param row row
     */
    const refPost = async () => {
        selectModelData()
        setModal({ title: formatMessage({ id: 'system.add' }), visible: true })
    }

    /**
     * 获取修改AI知识库文档信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            selectModelData()

            const { code, msg, data } = await getDoc(row.docId)
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
     * 移除AI知识库文档数据
     * @param row docId
     */
    const refRemove = async (docId: (string | number)[] | string | undefined) => {
        try {
            if (!docId) {
                return true
            }

            let params
            if (isArray(docId)) {
                params = docId.join(",")
            } else {
                params = docId
            }

            const { code, msg } = await delDoc(params)

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
     * 保存AI知识库文档数据
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
                        } = fields.docId === 0 ? await addDoc(fields) : await updateDoc(fields)
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
            title: '文档名称', ellipsis: true, width: 200, valueType: "text", dataIndex: 'docName',
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
                        <Popconfirm
                            onConfirm={() => refRemove(row.docId)}
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
                rowKey="docId"
                columns={columns}
                request={async (params) => {
                    const { data } = await pageQueryDoc(params);
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
                            exportDoc({
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
                title={`${modal.title}AI知识库文档`}
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
                        name="docId"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="知识库"
                        rules={[{ required: true, message: '请选择知识库' }]}
                        name="modelId"
                    >
                        <Select
                            showSearch
                            placeholder="请选择知识库"
                            optionFilterProp="label"
                            options={modelData}
                        />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="文档名称"
                        rules={[{ required: false, message: '文档名称不能为空' }]}
                        name="docName"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="内容"
                        rules={[{ required: false, message: '内容' }]}
                        name="content"
                    >
                        <Input.TextArea />
                    </Form.Item>

                </Form>


            </Modal>
        </PageContainer>
    )

}

export default Doc
