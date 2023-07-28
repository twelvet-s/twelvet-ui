import React, { useState, useRef } from 'react'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import {
    DeleteOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined
} from '@ant-design/icons'
import { Popconfirm, Button, message, Modal, Form, Input, Space, Divider } from 'antd'
import { FormInstance } from 'antd/lib/form'
import {
    listDept,
    getDept,
    delDept,
    addDept,
    updateDept,
    exportDept
} from "./service";
import { system } from '@/utils/twelvet'
import { isArray } from 'lodash'
import { proTableConfigs } from '@/setting'


/**
 * 部门模块
 */
const Dept: React.FC = () => {

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
     * 新增部门数据
     * @param row row
     */
    const refPost = async () => {
        setModal({ title: "新增", visible: true })
    }

    /**
     * 获取修改部门信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getDept(row.deptId)
            if (code !== 200) {
                return message.error(msg)
            }


            // 赋值表单数据
            form.setFieldsValue(data)

            // 设置Modal状态
            setModal({ title: "修改", visible: true })

        } catch (e) {
            system.error(e)
        }
    }

    /**
     * 移除部门数据
     * @param row deptId
     */
    const refRemove = async (deptId: (string | number)[] | string | undefined) => {
        try {
            if (!deptId) {
                return true
            }

            let params
            if (isArray(deptId)) {
                params = deptId.join(",")
            } else {
                params = deptId
            }

            const { code, msg } = await delDept(params)

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
     * 保存部门数据
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
                        } = fields.deptId === 0 ? await addDept(fields) : await updateDept(fields)
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
            title: '父部门id', ellipsis: true, width: 200, valueType: "text", dataIndex: 'parentId',
        },
        {
            title: '祖级列表', ellipsis: true, width: 200, valueType: "text", dataIndex: 'ancestors',
        },
        {
            title: '部门名称', ellipsis: true, width: 200, valueType: "text", dataIndex: 'deptName',
        },
        {
            title: '显示顺序', ellipsis: true, width: 200, valueType: "text", dataIndex: 'orderNum',
        },
        {
            title: '负责人', ellipsis: true, width: 200, valueType: "text", dataIndex: 'leader',
        },
        {
            title: '联系电话', ellipsis: true, width: 200, valueType: "text", dataIndex: 'phone',
        },
        {
            title: '邮箱', ellipsis: true, width: 200, valueType: "text", dataIndex: 'email',
        },
        {
            title: '部门状态', ellipsis: true, width: 200, valueType: "text", dataIndex: 'status',
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
                                修改
                            </Space>
                        </a>

                        <Divider type="vertical" />

                        <Popconfirm
                            onConfirm={() => refRemove(row.deptId)}
                            title="确定删除吗"
                        >
                            <a href='#'>
                                <Space>
                                    <CloseOutlined />
                                    删除
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
                    pageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="deptId"
                columns={columns}
                request={listDept}
                rowSelection={{}}
                beforeSearchSubmit={(params) => {
                    // 分隔搜索参数
                    if (params.between) {
                        const { between } = params
                        // 移除参数
                        delete params.between

                        // 适配参数
                        params.beginTime = between[0]
                        params.endTime = between[1]
                    }
                    return params
                }}
                toolBarRender={(action, { selectedRowKeys }) => [
                    <Button key='add' type="default" onClick={refPost}>
                        <PlusOutlined />
                        新增
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
                            批量删除
                        </Button>
                    </Popconfirm>,
                    <Popconfirm
                        key='export'
                        title="是否导出数据"
                        onConfirm={() => {
                            exportDept({
                                ...formRef.current?.getFieldsValue()
                            })
                        }}
                    >
                        <Button type="default">
                            <FundProjectionScreenOutlined />
                            导出数据
                        </Button>
                    </Popconfirm>
                ]}

            />

            <Modal
                title={`${modal.title}部门`}
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
                        name="deptId"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="父部门id"
                        rules={[{ required: false, message: '父部门id不能为空' }]}
                        name="parentId"
                    >
                        <Input placeholder={"请输入父部门id"} />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="父部门id"
                        rules={[{ required: false, message: '父部门id不能为空' }]}
                        name="parentId"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="部门名称"
                        rules={[{ required: false, message: '部门名称不能为空' }]}
                        name="deptName"
                    >
                        <Input placeholder={"请输入部门名称"} />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="部门名称"
                        rules={[{ required: false, message: '部门名称不能为空' }]}
                        name="deptName"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="显示顺序"
                        rules={[{ required: false, message: '显示顺序不能为空' }]}
                        name="orderNum"
                    >
                        <Input placeholder={"请输入显示顺序"} />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="显示顺序"
                        rules={[{ required: false, message: '显示顺序不能为空' }]}
                        name="orderNum"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="负责人"
                        rules={[{ required: false, message: '负责人不能为空' }]}
                        name="leader"
                    >
                        <Input placeholder={"请输入负责人"} />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="负责人"
                        rules={[{ required: false, message: '负责人不能为空' }]}
                        name="leader"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="联系电话"
                        rules={[{ required: false, message: '联系电话不能为空' }]}
                        name="phone"
                    >
                        <Input placeholder={"请输入联系电话"} />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="联系电话"
                        rules={[{ required: false, message: '联系电话不能为空' }]}
                        name="phone"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="邮箱"
                        rules={[{ required: false, message: '邮箱不能为空' }]}
                        name="email"
                    >
                        <Input placeholder={"请输入邮箱"} />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="邮箱"
                        rules={[{ required: false, message: '邮箱不能为空' }]}
                        name="email"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="部门状态"
                        rules={[{ required: false, message: '部门状态不能为空' }]}
                        name="status"
                    >
                        <Input placeholder={"请输入部门状态"} />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="删除标志"
                        rules={[{ required: false, message: '删除标志不能为空' }]}
                        name="delFlag"
                    >
                        <Input placeholder={"请输入删除标志"} />
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label="删除标志"
                        rules={[{ required: false, message: '删除标志不能为空' }]}
                        name="delFlag"
                    >
                        <Input />
                    </Form.Item>

                </Form>


            </Modal>
        </PageContainer>
    )

}

export default Dept