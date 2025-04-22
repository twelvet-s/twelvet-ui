import React, { useState, useRef } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
    DeleteOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { Popconfirm, Button, message, Modal, Form, Input, Space, Divider } from 'antd';
import { FormInstance } from 'antd/lib/form';
import DictionariesSelect from '@/components/TwelveT/Dictionaries/DictionariesSelect';
import { pageQueryI18n, getI18n, delI18n, addI18n, updateI18n, initI18n } from './service';
import { system } from '@/utils/twelvet';
import { isArray } from 'lodash';
import { proTableConfigs } from '@/setting';
import { useIntl } from '@umijs/max';

/**
 * 国际化模块
 */
const I18n: React.FC = () => {
    const { formatMessage } = useIntl();

    const [state] = useState<{
        pageSize: number;
    }>({
        pageSize: 10,
    });

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    // 默认使用语言
    const defaultLanguage: string = 'zh_CN';

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {
            xs: { span: 4 },
            sm: { span: 4 },
        },
        wrapperCol: {
            xs: { span: 18 },
            sm: { span: 18 },
        },
    };

    /**
     * 新增国际化数据
     */
    const refPost = async () => {
        setModal({ title: formatMessage({ id: 'system.add' }), visible: true });
    };

    /**
     * 获取修改国际化信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getI18n(row.i18nId);
            if (code !== 200) {
                return message.error(msg);
            }

            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置Modal状态
            setModal({ title: formatMessage({ id: 'system.update' }), visible: true });
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除国际化数据
     * @param i18nId
     */
    const refRemove = async (i18nId: (string | number)[] | string | undefined) => {
        try {
            if (!i18nId) {
                return true;
            }

            let params;
            if (isArray(i18nId)) {
                params = i18nId.join(',');
            } else {
                params = i18nId;
            }

            const { code, msg } = await delI18n(params);

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
        setModal({ title: '', visible: false });

        form.resetFields();
    };

    /**
     * 保存国际化数据
     */
    const onSave = () => {
        form.validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);

                    // ID为0则insert，否则将update
                    const { code, msg } =
                        fields.i18nId === 0 ? await addI18n(fields) : await updateI18n(fields);
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
     * 初始化国际化数据
     */
    const doInitI18n = async () => {
        const { code, msg } = await initI18n();
        if (code !== 200) {
            return message.error(msg);
        }

        message.success(msg);
    };

    // Form参数
    const columns: ProColumns<any>[] = [
        {
            title: '语言类型',
            ellipsis: true,
            search: false,
            width: 200,
            valueType: 'text',
            dataIndex: 'type',
        },
        {
            title: '语言类型',
            ellipsis: true,
            width: 200,
            dataIndex: 'type',
            hideInTable: true,
            renderFormItem: () => <DictionariesSelect type="i18n" />,
        },
        {
            title: '唯一Code',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'code',
        },
        {
            title: '翻译值',
            ellipsis: true,
            search: false,
            width: 200,
            valueType: 'text',
            dataIndex: 'value',
        },
        {
            title: '备注',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'remark',
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
                        <a onClick={() => refPut(row)}>
                            <Space>
                                <EditOutlined />
                                {formatMessage({ id: 'system.update' })}
                            </Space>
                        </a>

                        <Divider type="vertical" />

                        <Popconfirm onConfirm={() => refRemove(row.i18nId)} title="确定删除吗">
                            <a href="#">
                                <Space>
                                    <CloseOutlined />
                                    {formatMessage({ id: 'system.delete' })}
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
                rowKey="i18nId"
                columns={columns}
                request={async (params) => {
                    const { data } = await pageQueryI18n(params);
                    const { records, total } = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
                rowSelection={{}}
                toolBarRender={(action, { selectedRowKeys }) => [
                    <Popconfirm
                        key="init"
                        onConfirm={doInitI18n}
                        title="是否强制执行初始化全局国际化缓存"
                    >
                        <Button type="primary">
                            <ThunderboltOutlined />
                            {formatMessage({ id: 'system.init.i18n' })}
                        </Button>
                    </Popconfirm>,
                    <Button key="add" type="default" onClick={refPost}>
                        <PlusOutlined />
                        {formatMessage({ id: 'system.add' })}
                    </Button>,
                    <Popconfirm
                        key="batchDelete"
                        disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                        onConfirm={() => refRemove(selectedRowKeys)}
                        title="是否删除选中数据"
                    >
                        <Button
                            disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                            type="primary"
                            danger
                        >
                            <DeleteOutlined />
                            {formatMessage({ id: 'system.delete.batch' })}
                        </Button>
                    </Popconfirm>,
                ]}
            />

            <Modal
                title={`${modal.title}国际化`}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                onOk={onSave}
                onCancel={handleCancel}
                // 销毁组件，要求重新装载
                destroyOnClose
            >
                <Form form={form}>
                    <Form.Item
                        hidden
                        {...formItemLayout}
                        label="主键"
                        name="i18nId"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="唯一Code"
                        rules={[{ required: true, message: '唯一Code不能为空' }]}
                        name="code"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="语言类型"
                        rules={[{ required: true, message: '语言类型' }]}
                        name="type"
                        initialValue={defaultLanguage}
                    >
                        <DictionariesSelect type="i18n" />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="翻译值"
                        rules={[{ required: true, message: '翻译值不能为空' }]}
                        name="value"
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="备注"
                        rules={[{ required: false, message: '备注不能为空' }]}
                        name="remark"
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default I18n;
