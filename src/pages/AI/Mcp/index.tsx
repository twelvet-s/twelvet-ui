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
    Radio,
    Space,
    Tooltip,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { addMcp, delMcp, exportMcp, getMcp, pageQueryMcp, updateMcp } from './service';
import { system } from '@/utils/twelvet';
import { isArray } from 'lodash';
import { proTableConfigs } from '@/setting';
import DictionariesSelect from '@/components/TwelveT/Dictionaries/DictionariesSelect';
import DictionariesRadio from '@/components/TwelveT/Dictionaries/DictionariesRadio';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

/**
 * AI MCP服务模块
 */
const Mcp: React.FC = () => {
    const { formatMessage } = useIntl();

    const [state] = useState<{
        pageSize: number;
    }>({
        pageSize: 10,
    });

    // mcp类型
    const [mcpTypeState, setMcpTypeState] = useState<'STDIO' | 'SSE'>('STDIO');

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
            xs: { span: 4 },
            sm: { span: 4 },
        },
        wrapperCol: {
            xs: { span: 18 },
            sm: { span: 18 },
        },
    };

    /**
     * 新增AI MCP服务数据
     */
    const refPost = async () => {
        setMcpTypeState('STDIO');
        setModal({ title: formatMessage({ id: 'system.add' }), visible: true });
    };

    /**
     * 获取修改AI MCP服务信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getMcp(row.mcpId);
            if (code !== 200) {
                return message.error(msg);
            }

            // 赋值表单数据
            form.setFieldsValue(data);
            setMcpTypeState(data.mcpType);

            // 设置Modal状态
            setModal({ title: formatMessage({ id: 'system.update' }), visible: true });
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除AI MCP服务数据
     * @param mcpId
     */
    const refRemove = async (mcpId: (string | number)[] | string | undefined) => {
        try {
            if (!mcpId) {
                return true;
            }

            let params;
            if (isArray(mcpId)) {
                params = mcpId.join(',');
            } else {
                params = mcpId;
            }

            const { code, msg } = await delMcp(params);

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
     * 保存AI MCP服务数据
     */
    const onSave = () => {
        form.validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);

                    // ID为0则insert，否则将update
                    const { code, msg } =
                        fields.mcpId === 0 ? await addMcp(fields) : await updateMcp(fields);
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
    const columns: ProColumns<any>[] = [
        {
            title: '服务名称',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'name',
        },
        {
            title: '描述',
            search: false,
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'description',
        },
        {
            title: '请求类型',
            search: false,
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'mcpType',
        },
        {
            title: '命令',
            search: false,
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'command',
        },
        {
            title: '状态',
            search: false,
            ellipsis: true,
            width: 200,
            valueEnum: {
                true: { text: '启用', status: 'success' },
                false: { text: '停用', status: 'error' },
            },
            dataIndex: 'statusFlag',
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

                        <Popconfirm onConfirm={() => refRemove(row.mcpId)} title="确定删除吗">
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
                rowKey="mcpId"
                columns={columns}
                request={async (params) => {
                    const { data } = await pageQueryMcp(params);
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
                            exportMcp({
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
                width={'700px'}
                title={`${modal.title}AI MCP服务`}
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
                        name="mcpId"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label={
                            <Tooltip
                                title="
                                也为clientId，请注意唯一性
                            "
                            >
                                服务名称 <QuestionCircleOutlined />
                            </Tooltip>
                        }
                        rules={[{ required: true, message: '服务名称不能为空' }]}
                        name="name"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="描述"
                        rules={[{ required: false, message: '描述不能为空' }]}
                        name="description"
                    >
                        <Input.TextArea rows={5} />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="类型"
                        rules={[{ required: true, message: '类型不能为空' }]}
                        name="mcpType"
                        initialValue={'STDIO'}
                    >
                        <DictionariesRadio
                            type="ai_mcp_type"
                            onChange={(v) => {
                                setMcpTypeState(v.target.value);
                            }}
                        />
                    </Form.Item>

                    {mcpTypeState === 'SSE' && (
                        <>
                            <Form.Item
                                {...formItemLayout}
                                label="SSE 基础地址"
                                rules={[{ required: true, message: 'SSE 基础地址不能为空' }]}
                                name="sseBaseUrl"
                            >
                                <Input placeholder="https:twelvet.cn" />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label="SSE 访问端点"
                                rules={[{ required: true, message: 'SSE 访问端点不能为空' }]}
                                name="sseEndpoint"
                            >
                                <Input placeholder="/sse" />
                            </Form.Item>
                        </>
                    )}

                    {mcpTypeState === 'STDIO' && (
                        <>
                            <Form.Item
                                {...formItemLayout}
                                label={
                                    <Tooltip
                                        title="
                                服务器必须安装了对应命令才可以使用
                            "
                                    >
                                        命令 <QuestionCircleOutlined />
                                    </Tooltip>
                                }
                                rules={[{ required: true, message: '命令不能为空' }]}
                                name="command"
                                initialValue={'NPX'}
                            >
                                <DictionariesSelect type="ai_mcp_command" />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label={
                                    <Tooltip title="参数一行一个">
                                        参数 <QuestionCircleOutlined />
                                    </Tooltip>
                                }
                                rules={[{ required: true, message: '参数不能为空' }]}
                                name="args"
                            >
                                {/*<Input.TextArea rows={5} placeholder={'-y\n@server'} />*/}
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

                            <Form.Item
                                {...formItemLayout}
                                label={
                                    <Tooltip title="使用json格式参数">
                                        环境变量 <QuestionCircleOutlined />
                                    </Tooltip>
                                }
                                rules={[{ required: false, message: '环境变量不能为空' }]}
                                name="env"
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
                        </>
                    )}

                    <Form.Item
                        {...formItemLayout}
                        label="是否启用"
                        rules={[{ required: true, message: '是否启用不能为空' }]}
                        name="statusFlag"
                        initialValue={true}
                    >
                        <Radio.Group>
                            <Radio value={true}>是</Radio>
                            <Radio value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default Mcp;
