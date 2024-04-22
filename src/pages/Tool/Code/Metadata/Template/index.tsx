import React, { useState, useRef } from 'react'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import {
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { Popconfirm, Button, message, Modal, Form, Input, Space, Divider, Row, Col } from 'antd'
import { FormInstance } from 'antd/lib/form'
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-java"
import "ace-builds/src-noconflict/theme-monokai"
import "ace-builds/src-noconflict/ext-language_tools"
import {
    pageQueryTemplate,
    getTemplate,
    delTemplate,
    addTemplate,
    updateTemplate
} from './service'
import { system } from '@/utils/twelvet'
import { isArray } from 'lodash'
import { proTableConfigs } from '@/setting'
import { useIntl } from '@umijs/max'


/**
 * 代码生成业务模板模块
 */
const Template: React.FC = () => {

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
            xs: { span: 6 },
            sm: { span: 6 },
        },
        wrapperCol: {
            xs: { span: 16 },
            sm: { span: 16 },
        },
    }


    /**
     * 新增代码生成业务模板数据
     * @param row row
     */
    const refPost = async () => {
        setModal({title: formatMessage({id: 'system.add'}), visible: true})
    }

    /**
     * 获取修改代码生成业务模板信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getTemplate(row.id)
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
     * 移除代码生成业务模板数据
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

            const { code, msg } = await delTemplate(params)

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
     * 保存代码生成业务模板数据
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
                        } = fields.id === 0 ? await addTemplate(fields) : await updateTemplate(fields)
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
            title: '模板名称', ellipsis: true, width: 200, valueType: "text", dataIndex: 'templateName',
        },
        {
            title: '模板路径', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'generatorPath',
        },
        {
            title: '模板描述', search: false, ellipsis: true, width: 200, valueType: "text", dataIndex: 'templateDesc',
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
                    const { data } = await pageQueryTemplate(params);
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
                    </Popconfirm>
                ]}

            />

            <Modal
                width={'90%'}
                title={`${modal.title}模板`}
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

                    <Row>
                        <Col sm={18} xs={24}>
                            <Form.Item
                                labelCol={
                                    {
                                        xs: { span: 1 },
                                        sm: { span: 1 },
                                    }
                                }
                                wrapperCol={
                                    {
                                        xs: { span: 23 },
                                        sm: { span: 23 },
                                    }
                                }
                                rules={[{ required: true, message: '模板代码不能为空' }]}
                                name="templateCode"
                            >
                                <AceEditor
                                    placeholder={'输入模板代码'}
                                    mode={'java'}
                                    theme={'monokai'}
                                    name="templateEditor"
                                    width={'100%'}
                                    height={'600px'}
                                    fontSize={16}
                                    showPrintMargin={true}
                                    showGutter={true}
                                    highlightActiveLine={true}
                                    setOptions={{
                                        enableBasicAutocompletion: true,
                                        enableLiveAutocompletion: true,
                                        enableSnippets: true,
                                        showLineNumbers: true,
                                        tabSize: 2,
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col sm={6} xs={24}>
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
                                label="模板名称"
                                rules={[{ required: true, message: '模板名称不能为空' }]}
                                name="templateName"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label="模板路径"
                                rules={[{ required: true, message: '模板路径不能为空' }]}
                                name="generatorPath"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label="模板描述"
                                rules={[{ required: true, message: '模板描述不能为空' }]}
                                name="templateDesc"
                            >
                                <Input.TextArea />
                            </Form.Item>
                        </Col>
                    </Row>

                </Form>


            </Modal>

        </PageContainer>
    )

}

export default Template
