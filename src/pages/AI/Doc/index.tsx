import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
    CloseOutlined,
    CopyOutlined,
    DeleteOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import {
    Button,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Upload,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import {
    addDoc,
    delDoc,
    exportDoc,
    getDoc,
    listKnowledgeQueryDoc,
    pageQueryDoc,
    updateDoc,
} from './service';
import { system } from '@/utils/twelvet';
import { isArray } from 'lodash';
import { proTableConfigs } from '@/setting';
import DocSlice from '@/pages/AI/Doc/componets/Slice';
import DictionariesRadio from '@/components/TwelveT/Dictionaries/DictionariesRadio';
import './styles.less';

/**
 * AI知识库文档模块
 */
const Doc: React.FC = () => {
    const { formatMessage } = useIntl();

    const [state] = useState<{
        pageSize: number;
    }>({
        pageSize: 10,
    });

    // 默认的数据来源
    const [sourceType, setSourceType] = useState<string>(`INPUT`);

    // 进入Model处理的切片信息
    const [docSliceInfo, setDocSliceInfo] = useState<{
        docId?: number;
        visible: boolean;
    }>({
        visible: false,
    });

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    // 知识库列表
    const [knowledgeData, setKnowledgeData] = useState<
        Array<{
            label: string;
            value: number;
        }>
    >([]);

    const [knowledgeTreeData, setKnowledgeTreeData] = useState<React.ReactNode[]>([]);

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

    useEffect(() => {
        selectKnowledgeData();
    }, []);

    /**
     * 获取知识库列表
     */
    const selectKnowledgeData = async () => {
        try {
            const { code, msg, data } = await listKnowledgeQueryDoc({});
            if (code !== 200) {
                return message.error(msg);
            }

            const selectData = [];
            for (let knowledge of data) {
                selectData.push({
                    label: knowledge.knowledgeName,
                    value: knowledge.knowledgeId,
                });
            }

            // 制作选择数据
            const tree: React.ReactNode[] = [];
            data.forEach((item: { knowledgeId: number; knowledgeName: string }) => {
                tree.push(
                    <Select.Option key={item.knowledgeId} value={item.knowledgeId}>
                        {item.knowledgeName}
                    </Select.Option>,
                );
            });

            setKnowledgeTreeData(tree);

            setKnowledgeData(selectData);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 新增AI知识库文档数据
     */
    const refPost = async () => {
        selectKnowledgeData();
        setModal({ title: formatMessage({ id: 'system.add' }), visible: true });
    };

    /**
     * 获取修改AI知识库文档信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            selectKnowledgeData();

            const { code, msg, data } = await getDoc(row.docId);
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
     * 移除AI知识库文档数据
     * @param docId
     */
    const refRemove = async (docId: (string | number)[] | string | undefined) => {
        try {
            if (!docId) {
                return true;
            }

            let params;
            if (isArray(docId)) {
                params = docId.join(',');
            } else {
                params = docId;
            }

            const { code, msg } = await delDoc(params);

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
        // 恢复默认选择
        setSourceType('INPUT')
        form.resetFields();
    };

    /**
     * 保存AI知识库文档数据
     */
    const onSave = () => {
        form.validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);

                    // ID为0则insert，否则将update
                    const { code, msg } =
                        fields.docId === 0 ? await addDoc(fields) : await updateDoc(fields);
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
            title: '知识库',
            ellipsis: true,
            dataIndex: 'knowledgeId',
            hideInTable: true,
            renderFormItem: () => (
                <Select placeholder="知识库" showSearch allowClear>
                    {knowledgeTreeData}
                </Select>
            ),
        },
        {
            title: '文档名称',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'docName',
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
                        <Divider type="vertical" />
                        <a
                            href="#"
                            onClick={() => {
                                setDocSliceInfo({
                                    docId: row.docId,
                                    visible: true,
                                });
                            }}
                        >
                            <Space>
                                <CopyOutlined />
                                切片
                            </Space>
                        </a>
                        <Divider type="vertical" />
                        <Popconfirm onConfirm={() => refRemove(row.docId)} title="确定删除吗">
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
                            exportDoc({
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
                title={`${modal.title}AI知识库文档`}
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
                        name="docId"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        label="知识库"
                        rules={[{ required: true, message: '请选择知识库' }]}
                        name="knowledgeId"
                    >
                        <Select
                            showSearch
                            placeholder="请选择知识库"
                            optionFilterProp="label"
                            options={knowledgeData}
                        />
                    </Form.Item>

                    <Form.Item
                        {...formItemLayout}
                        rules={[{ required: true, message: '请选择来源' }]}
                        label="来源"
                        name="sourceType"
                        initialValue={`INPUT`}
                    >
                        <DictionariesRadio
                            onChange={(e) => {
                                // 设置数据来源
                                setSourceType(e.target.value);
                            }}
                            type="rag_source_type"
                        />
                    </Form.Item>

                    {sourceType === 'UPLOAD' && (
                        <Form.Item
                            {...formItemLayout}
                            label="资料"
                            name="files"
                            rules={[{ required: true, message: '请上传资料' }]}
                        >
                            <Upload.Dragger
                                // 设置默认可选择支持上传的文件类型
                                accept="
                            image/jpeg,
                            image/png,
                            image/jpeg,
                            image/gif,
                            text/markdown,
                            .md,
                            application/msword,
                            application/vnd.ms-excel,
                            application/vnd.ms-powerpoint,
                            text/plain,
                            application/pdf,
                            application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                            application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                            application/vnd.openxmlformats-officedocument.presentationml.presentation
                            "
                            >
                                将文件拖到此处，或 <span className={`color-blue`}>点击上传</span>
                            </Upload.Dragger>
                            <span>
                                请上传 大小不超过 <span className={`color-red`}>10MB</span>格式为
                                <span className={`color-red`}>
                                    jpeg/png/jpg/gif/md/doc/xls/ppt/txt/pdf/docx/xlsx/pptx
                                </span>
                                的文件
                            </span>
                        </Form.Item>
                    )}

                    {sourceType === 'INPUT' && (
                        <>
                            <Form.Item
                                {...formItemLayout}
                                label="文档名称"
                                rules={[{ required: true, message: '文档名称不能为空' }]}
                                name="docName"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                {...formItemLayout}
                                label="内容"
                                rules={[{ required: true, message: '请输入内容' }]}
                                name="content"
                            >
                                <Input.TextArea rows={5} showCount maxLength={1800} />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>

            {/*文档切片*/}
            <DocSlice
                onClose={() => {
                    setDocSliceInfo({
                        docId: 0,
                        visible: false,
                    });
                }}
                info={docSliceInfo}
            />
        </PageContainer>
    );
};

export default Doc;
