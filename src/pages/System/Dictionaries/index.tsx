import React, {useState, useRef} from 'react';

import {proTableConfigs} from '@/setting';
import type {ProColumns, ActionType} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {
    DeleteOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import {Popconfirm, Button, message, Modal, Form, Input, Radio, Space, Divider} from 'antd';
import type {FormInstance} from 'antd/lib/form';
import {pageQuery, remove, exportExcel, getBydictId, insert, update, clearCache} from './service';
import {system, auth} from '@/utils/twelvet';
import {isArray} from 'lodash';
import DrawerInfo from './components/drawerInfo/Index';
import { useIntl } from '@umijs/max';

/**
 * 字典模块类型管理
 */
const Dictionaries: React.FC = () => {

    const {formatMessage} = useIntl()

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    const [drawerInfo, setDrawerInfo] = useState<{
        drawerInfoKey: string;
        visible: boolean;
    }>({
        drawerInfoKey: '',
        visible: false,
    });

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [state] = useState<SystemDictionaries.State>({
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
     * 新增字典
     */
    const refPost = async () => {
        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    };

    /**
     * 获取修改字典信息
     * @param row row
     */
    const refPut = async (row: Record<string, any>) => {
        try {
            const {code, msg, data} = await getBydictId(row.dictId);
            if (code !== 200) {
                return message.error(msg);
            }
            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true});
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除字典
     * @param dictIds
     */
    const refRemove = async (dictIds: (string | number)[] | string | undefined) => {
        try {
            if (!dictIds) {
                return;
            }

            let params;
            if (isArray(dictIds)) {
                params = dictIds.join(',');
            } else {
                params = dictIds;
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
                    const {code, msg} = fields.dictId === 0 ? await insert(fields) : await update(fields);
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

    /**
     * 清空字典緩存
     */
    const clear = async () => {
        try {
            const {code, msg} = await clearCache();
            if (code !== 200) {
                return message.error(msg);
            }
            message.success(msg);
        } catch (e) {
            system.error(e);
        }
    };

    // Form参数
    const columns: ProColumns<SystemDictionaries.PageListItem>[] = [
        {
            title: '字典名称',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'dictName',
        },
        {
            title: '字典类型',
            width: 200,
            valueType: 'text',
            dataIndex: 'dictType',
        },
        {
            title: '状态',
            ellipsis: false,
            width: 80,
            dataIndex: 'status',
            valueEnum: {
                0: {text: '正常', status: 'success'},
                1: {text: '停用', status: 'error'},
            },
        },
        {
            title: '备注',
            search: false,
            width: 200,
            valueType: 'text',
            dataIndex: 'remark',
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
            width: 320,
            valueType: 'option',
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <>
                        <a onClick={() => refPut(row)} hidden={auth('system:dict:update')}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>

                        <Divider type="vertical"/>

                        <a
                            onClick={() => {
                                setDrawerInfo({
                                    drawerInfoKey: row.dictType,
                                    visible: true,
                                });
                            }}
                        >
                            <Space>
                                <SettingOutlined/>
                                {formatMessage({id: 'system.data.management'})}
                            </Space>
                        </a>

                        <Divider type="vertical"/>

                        <Popconfirm onConfirm={() => refRemove([row.dictId])} title="确定删除吗">
                            <a href="#" hidden={auth('system:dict:remove')}>
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
            <ProTable<SystemDictionaries.PageListItem, SystemDictionaries.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="dictId"
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
                    <Button key={'addTool'} hidden={auth('system:dict:insert')} type="default" onClick={refPost}>
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
                        <Button type="default" hidden={auth('system:dict:export')}>
                            <FundProjectionScreenOutlined/>
                            {formatMessage({id: 'system.export'})}
                        </Button>
                    </Popconfirm>,
                    <Popconfirm key={'cleanTool'} title="是否清空缓存" onConfirm={() => clear()}>
                        <Button type="primary" danger>
                            <FundProjectionScreenOutlined/>
                            清空缓存
                        </Button>
                    </Popconfirm>,
                ]}
            />

            <Modal
                title={`${modal.title}字典`}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                onOk={onSave}
                onCancel={handleCancel}
            >
                <Form name="Dictionaries" form={form}>
                    <Form.Item hidden {...formItemLayout} label="字典ID" name="dictId" initialValue={0}>
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="字典名称"
                        name="dictName"
                        rules={[{required: true, message: '字典名称不能为空'}]}
                    >
                        <Input placeholder="字典名称"/>
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="字典类型"
                        name="dictType"
                        rules={[{required: true, message: '字典类型不能为空'}]}
                    >
                        <Input placeholder="字典类型"/>
                    </Form.Item>

                    <Form.Item {...formItemLayout} label="字典状态" name="status" initialValue={'0'}>
                        <Radio.Group>
                            <Radio value={'0'}>正常</Radio>
                            <Radio value={'1'}>停用</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item {...formItemLayout} label="备注" name="remark">
                        <TextArea placeholder="请输入内容"/>
                    </Form.Item>
                </Form>
            </Modal>

            <DrawerInfo
                onClose={() => {
                    setDrawerInfo({
                        drawerInfoKey: '',
                        visible: false,
                    });
                }}
                info={drawerInfo}
            />
        </PageContainer>
    );
};

export default Dictionaries;
