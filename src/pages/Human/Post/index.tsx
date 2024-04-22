import React, {useState, useRef} from 'react';

import {proTableConfigs} from '@/setting';
import { useIntl } from '@umijs/max';
import {
    DeleteOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import {
    Popconfirm,
    Button,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Radio,
    Space,
    Divider,
} from 'antd';
import type {FormInstance} from 'antd/lib/form';
import {pageQuery, remove, exportExcel, getByPostId, insert, update} from './service';
import {system, auth} from '@/utils/twelvet';
import type {ProColumns, ActionType} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {isArray} from 'lodash';

/**
 * 岗位模块
 */
const Post: React.FC = () => {
    const {formatMessage} = useIntl()

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [state] = useState<HumanPost.State>({
        pageSize: 10,
    });

    const [form] = Form.useForm();

    const {TextArea} = Input;

    const formItemLayout = {
        labelCol: {
            xs: {span: 4},
            sm: {span: 4},
        },
        wrapperCol: {
            xs: {span: 18},
            sm: {span: 18},
        },
    };

    /**
     * 新增岗位
     */
    const refPost = async () => {
        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    };

    /**
     * 获取修改岗位信息
     * @param postId
     */
    const refPut = async (postId: number) => {
        try {
            const {data} = await getByPostId(postId);
            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true});
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除岗位
     * @param postIds
     */
    const refRemove = async (postIds: (string | number)[] | string | undefined) => {
        try {
            if (!postIds) {
                return true;
            }

            let params;
            if (isArray(postIds)) {
                params = postIds.join(',');
            } else {
                params = postIds;
            }

            const {code, msg} = await remove(params);

            if (code !== 200) {
                return message.error(msg);
            }

            message.success(msg);

            acForm?.current?.reload();
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 取消Modal的显示
     */
    const handleCancel = () => {
        setModal({title: '', visible: false});
        form.resetFields();
    };

    /**
     * 保存数据
     */
    const onSave = () => {
        form
            .validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);
                    // ID为0则insert，否则将update
                    const {code, msg} = fields.postId === 0 ? await insert(fields) : await update(fields);
                    if (code !== 200) {
                        return message.error(msg);
                    }

                    message.success(msg);

                    if (acForm.current) {
                        acForm.current.reload();
                    }

                    // 关闭模态框
                    handleCancel();
                } catch (e) {
                    system.error(e);
                } finally {
                    setLoadingModal(false);
                }
            })
            .catch((e) => {
                system.error(e);
            });
    };

    // Form参数
    const columns: ProColumns<HumanPost.PageListItem>[] = [
        {
            title: '岗位编码',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'postCode',
        },
        {
            title: '岗位名称',
            width: 200,
            valueType: 'text',
            dataIndex: 'postName',
        },
        {
            title: '岗位排序',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'postSort',
        },
        {
            title: '状态',
            width: 80,
            dataIndex: 'status',
            valueEnum: {
                '0': {text: '正常', status: 'success'},
                '1': {text: '停用', status: 'error'},
            },
        },
        {
            title: '创建时间',
            search: false,
            width: 200,
            valueType: 'dateTime',
            dataIndex: 'createTime',
        },
        {
            title: '操作',
            fixed: 'right',
            width: 200,
            valueType: 'option',
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <>
                        <a onClick={() => refPut(row.postId)} hidden={auth('system:post:update')}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={() => refRemove([row.postId])} title="确定删除吗">
                            <a href="#" hidden={auth('system:post:remove')}>
                                <Space>
                                    <CloseOutlined />
                                    {formatMessage({id: 'system.delete'})}
                                </Space>
                            </a>
                        </Popconfirm>
                    </>
                );
            },
        },
    ];

    return (
        <PageContainer>
            <ProTable<HumanPost.PageListItem, HumanPost.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="postId"
                columns={columns}
                request={async (params) => {
                    const {data} = await pageQuery(params);
                    const {records, total} = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
                rowSelection={{}}
                toolBarRender={(action, {selectedRowKeys}) => [
                    <Button key={'addTool'} type="default" onClick={refPost} hidden={auth('system:post:insert')}>
                        <PlusOutlined />
                        {formatMessage({id: 'system.add'})}
                    </Button>,
                    <Popconfirm
                        key={'deleteTool'}
                        disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                        onConfirm={() => refRemove(selectedRowKeys)}
                        title="是否删除选中数据"
                    >
                        <Button
                            disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                            type="primary"
                            danger
                        >
                            <DeleteOutlined/>
                            {formatMessage({id: 'system.delete.batch'})}
                        </Button>
                    </Popconfirm>,
                    <Popconfirm
                        key={'exportTool'}
                        title="是否导出数据"
                        onConfirm={() => {
                            exportExcel({
                                ...formRef.current?.getFieldsValue(),
                            });
                        }}
                    >
                        <Button type="default" hidden={auth('system:post:export')}>
                            <FundProjectionScreenOutlined/>
                            {formatMessage({id: 'system.export'})}
                        </Button>
                    </Popconfirm>,
                ]}
            />

            <Modal
                title={`${modal.title}岗位`}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                onOk={onSave}
                onCancel={handleCancel}
            >
                <Form name="Post" form={form}>
                    <Form.Item hidden {...formItemLayout} label="岗位ID" name="postId" initialValue={0}>
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="岗位名称"
                        name="postName"
                        rules={[{required: true, message: '岗位名称不能为空'}]}
                    >
                        <Input placeholder="岗位名称"/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="岗位编码"
                        name="postCode"
                        rules={[{required: true, message: '岗位编码不能为空'}]}
                    >
                        <Input placeholder="岗位编码"/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="岗位顺序"
                        name="postSort"
                        initialValue={0}
                        rules={[{required: true, message: '岗位顺序不能为空'}]}
                    >
                        <InputNumber placeholder="岗位顺序"/>
                    </Form.Item>

                    <Form.Item {...formItemLayout} label="岗位状态" name="status" initialValue="0">
                        <Radio.Group>
                            <Radio value="0">正常</Radio>
                            <Radio value="1">停用</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item {...formItemLayout} label="备注" name="remark">
                        <TextArea placeholder="请输入内容"/>
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default Post;
