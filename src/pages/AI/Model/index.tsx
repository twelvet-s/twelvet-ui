import React, { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import {
    Button,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Slider,
    Space,
    Tooltip,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { addModel, delModel, exportModel, getModel, pageQueryModel, updateModel } from './service';
import { system } from '@/utils/twelvet';
import { isArray } from 'lodash';
import { proTableConfigs } from '@/setting';
import {DictionariesSelect} from '@/components';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import StatusSwitch from './staffStatusSwitch/Index';

/**
 * AI大模型模块
 */
const Model: React.FC = () => {
    const { formatMessage } = useIntl();

    const [state] = useState<{
        pageSize: number;
    }>({
        pageSize: 10,
    });

    /**
     * 是否为llm模型
     */
    const [llmFlag, setLLMFlag] = useState<boolean>(true);

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {
            xs: { span: 6 },
            sm: { span: 6 },
        },
        wrapperCol: {
            xs: { span: 14 },
            sm: { span: 14 },
        },
    };

    /**
     * 新增AI大模型数据
     */
    const refPost = async () => {
        setLLMFlag(true);
        setModal({ title: formatMessage({ id: 'system.add' }), visible: true });
    };

    /**
     * 获取修改AI大模型信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getModel(row.modelId);
            if (code !== 200) {
                return message.error(msg);
            }

            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置Modal状态
            setModal({ title: formatMessage({ id: 'system.update' }), visible: true });
            if (data.modelType !== 'LLM') {
                setLLMFlag(false);
            } else {
                setLLMFlag(true);
            }
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除AI大模型数据
     * @param modelId
     */
    const refRemove = async (modelId: (string | number)[] | string | undefined) => {
        try {
            if (!modelId) {
                return true;
            }

            let params;
            if (isArray(modelId)) {
                params = modelId.join(',');
            } else {
                params = modelId;
            }

            const { code, msg } = await delModel(params);

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
     * 保存AI大模型数据
     */
    const onSave = () => {
        form.validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);

                    // ID为0则insert，否则将update
                    const { code, msg } =
                        fields.modelId === 0 ? await addModel(fields) : await updateModel(fields);
                    if (code !== 200) {
                        return message.error(msg);
                    }

                    message.success(msg);

                    if (acForm.current) {
                        acForm!.current.reload();
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
    const columns: ProColumns<any>[] = [
        {
            title: '供应商',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'modelProviderName',
        },
        {
            title: '模型类型',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'modelTypeName',
        },
        {
            title: '模型',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'model',
        },
        {
            title: '别名',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'alias',
        },
        {
            title: '默认',
            ellipsis: true,
            width: 200,
            dataIndex: 'defaultFlag',
            valueEnum: {
                true: { text: '默认', status: 'default' },
                false: { text: '非默认', status: 'notDefault' },
            },
            render: (_, row) => <StatusSwitch row={row} />,
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

                        <Popconfirm onConfirm={() => refRemove(row.modelId)} title="确定删除吗">
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
                rowKey="modelId"
                columns={columns}
                request={async (params) => {
                    const { data } = await pageQueryModel(params);
                    const { records, total } = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
                rowSelection={{}}
                toolBarRender={(action, { selectedRowKeys }) => [
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
                    <Popconfirm
                        key="export"
                        title="是否导出数据"
                        onConfirm={() => {
                            exportModel({
                                ...formRef.current?.getFieldsValue(),
                            });
                        }}
                    >
                        <Button type="default">
                            <FundProjectionScreenOutlined />
                            {formatMessage({ id: 'system.export' })}
                        </Button>
                    </Popconfirm>,
                ]}
            />

            <Modal
                width={800}
                title={`${modal.title}AI大模型`}
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
                        name="modelId"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="供应商"
                        rules={[{ required: true, message: '供应商不能为空' }]}
                        name="modelProvider"
                    >
                        <DictionariesSelect type="ai_model_provider" />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="模型类型"
                        rules={[{ required: true, message: '模型类型不能为空' }]}
                        name="modelType"
                    >
                        <DictionariesSelect
                            onChange={(v) => {
                                if (v !== 'LLM') {
                                    setLLMFlag(false);
                                } else {
                                    setLLMFlag(true);
                                }
                            }}
                            type="ai_model_type"
                        />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label={
                            <Tooltip title="模型平台的标准名称，用于用户识别平台对应">
                                模型 <QuestionCircleOutlined />
                            </Tooltip>
                        }
                        rules={[{ required: true, message: '模型不能为空' }]}
                        name="model"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label={
                            <Tooltip title="主要用于程序调用，对应关系请看Spring AI">
                                别名 <QuestionCircleOutlined />
                            </Tooltip>
                        }
                        rules={[{ required: true, message: '别名不能为空' }]}
                        name="alias"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="apiKey"
                        rules={[{ required: true, message: 'apiKey不能为空' }]}
                        name="apiKey"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="模型请求地址"
                        rules={[{ required: true, message: '模型请求地址不能为空' }]}
                        name="baseUrl"
                    >
                        <Input />
                    </Form.Item>

                    {llmFlag && (
                        <>
                            <Form.Item
                                {...formItemLayout}
                                label={
                                    <Tooltip title="数值越大，回答越有创意和想象力；数值越小，回答越严谨">
                                        创意活跃度 <QuestionCircleOutlined />
                                    </Tooltip>
                                }
                                rules={[{ required: true, message: '创意活跃度不能为空' }]}
                                name="temperature"
                                initialValue={0.8}
                            >
                                <Slider min={0} max={1} step={0.1} />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label={
                                    <Tooltip title="考虑多少种可能性，值越大，接受更多可能的回答；值越小，倾向选择最可能的回答。不推荐和创意活跃度一起更改">
                                        思维开放度 <QuestionCircleOutlined />
                                    </Tooltip>
                                }
                                rules={[{ required: true, message: '思维开放度不能为空' }]}
                                name="topP"
                                initialValue={0.8}
                            >
                                <Slider min={0} max={1} step={0.1} />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item
                        {...formItemLayout}
                        label={
                            <Tooltip title="部分模型参考文档配置">
                                特殊参数 <QuestionCircleOutlined />
                            </Tooltip>
                        }
                        rules={[{ required: false, message: '模型不能为空' }]}
                        name="extParam"
                        initialValue={'{}'}
                    >
                        <AceEditor
                            mode={'json'}
                            theme={'monokai'}
                            width={'100%'}
                            fontSize={14}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            // 是否只读
                            readOnly={false}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
                                maxLines: 10, // 设置最大行数，超出时显示滚动条
                                minLines: 5, // 设置最小行数
                                wrapBehavioursEnabled: true, // 启用自动换行
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default Model;
