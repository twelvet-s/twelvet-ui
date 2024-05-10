import React, {useState, useRef} from 'react';

import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {proTableConfigs} from '@/setting';
import {
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
    Popconfirm,
    Button,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Tooltip,
    Divider,
    Space,
} from 'antd';
import {pageQuery, remove, getByClientId, insert, update} from './service';
import {system, auth} from '@/utils/twelvet';
import {isArray} from 'lodash';
import DictionariesSelect from '@/components/TwelveT/Dictionaries/DictionariesSelect';

/**
 * 终端模块
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

    const [state] = useState<SystemClient.State>({
        pageSize: 10,
    });

    const acForm = useRef<ActionType>();

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {
            xs: {span: 5},
            sm: {span: 5},
        },
        wrapperCol: {
            xs: {span: 16},
            sm: {span: 16},
        },
    };

    /**
     * 新增终端
     */
    const refPost = async () => {
        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    };

    /**
     * 获取修改终端信息
     * @param clientId
     */
    const refPut = async (clientId: number) => {
        try {
            const {data} = await getByClientId(clientId);

            // 分割授权类型数据
            data.authorizedGrantTypes = data.authorizedGrantTypes.split(',');

            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true});
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除终端
     * @param clientIds
     */
    const refRemove = async (clientIds: (string | number)[] | string | undefined) => {
        try {
            if (!clientIds) {
                return;
            }

            let params;
            if (isArray(clientIds)) {
                params = clientIds.join(',');
            } else {
                params = clientIds;
            }

            const {msg} = await remove(params);

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
                    // 需合并授权结果
                    fields.authorizedGrantTypes = fields.authorizedGrantTypes.join(',');

                    // 开启加载中
                    setLoadingModal(true);
                    // ID为0则insert，否则将update
                    const {code, msg} = modal.title === '新增' ? await insert(fields) : await update(fields);
                    if (code !== 200) {
                        return message.error(msg);
                    }

                    message.success(msg);

                    acForm?.current?.reload();

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
    const columns: ProColumns<SystemClient.PageListItem>[] = [
        {
            title: '编号',
            width: 200,
            valueType: 'text',
            dataIndex: 'clientId',
        },
        {
            title: '授权范围',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'scope',
        },
        {
            title: '授权类型',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'authorizedGrantTypes',
        },
        {
            title: '令牌有效期',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'accessTokenValidity',
        },
        {
            title: '刷新令牌有效期',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'refreshTokenValidity',
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
                        <a onClick={() => refPut(row.clientId)} hidden={auth('system:client:update')}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={() => refRemove([row.clientId])} title="确定删除吗">
                            <a href="#" hidden={auth('system:client:remove')}>
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
            <ProTable<SystemClient.PageListItem, SystemClient.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                rowKey="clientId"
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
                    <Button key={'addTool'} hidden={auth('system:client:insert')} type="default" onClick={refPost}>
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
                ]}
            />

            <Modal
                title={`${modal.title}终端`}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                width={700}
                onOk={onSave}
                onCancel={handleCancel}
            >
                <Form name="Client" form={form}>
                    <Form.Item {...formItemLayout} label="编号" name="clientId">
                        <Input placeholder="编号" disabled={modal.title === '修改'}/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label={
                            <Tooltip
                                title="
                                不填写默认不更改
                            "
                            >
                                安全码 <QuestionCircleOutlined/>
                            </Tooltip>
                        }
                        name="clientSecret"
                    >
                        <Input placeholder="安全码"/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="授权范围"
                        name="scope"
                        rules={[{required: true, message: '授权范围不能为空'}]}
                    >
                        <Input placeholder="授权范围"/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label={'授权类型'}
                        name="authorizedGrantTypes"
                        rules={[{required: true, message: '授权范围不能为空'}]}
                    >
                        <DictionariesSelect type="sys_oauth_client_details"/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="令牌时效（ms）"
                        name="accessTokenValidity"
                        initialValue={3600}
                        rules={[{required: true, message: '令牌时效不能为空'}]}
                    >
                        <InputNumber placeholder="令牌时效"/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="刷新时效（ms）"
                        name="refreshTokenValidity"
                        initialValue={7200}
                        rules={[{required: true, message: '刷新时效不能为空'}]}
                    >
                        <InputNumber placeholder="刷新时效"/>
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default Post;
