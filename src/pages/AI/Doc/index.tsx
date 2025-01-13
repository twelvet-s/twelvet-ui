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
    batchUpload,
    delDoc,
    exportDoc,
    listKnowledgeQueryDoc,
    pageQueryDoc,
    updateDoc,
} from './service';
import { system } from '@/utils/twelvet';
import { isArray } from 'lodash';
import TWT, { proTableConfigs } from '@/setting';
import DocSlice from '@/pages/AI/Doc/componets/Slice';
import DictionariesRadio from '@/components/TwelveT/Dictionaries/DictionariesRadio';
import './styles.less';
import type { RcFile } from 'antd/lib/upload';

/**
 * AI知识库文档模块
 */
const Doc: React.FC = () => {
    const { formatMessage } = useIntl();

    const { Dragger } = Upload;

    const [state] = useState<{
        pageSize: number;
    }>({
        pageSize: 10,
    });

    /**
     * 单个文件上传最大（单位MB）
     */
    const fileMax = 10;

    /**
     * 上传文件最大数量
     */
    const fileNumberMax = 5;

    /**
     * 允许上传的文件类型
     */
    const allowFileType = [
        'text/markdown',
        '.md',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    /**
     * 上传文件列表
     */
    const [fileList, setFileList] = useState<RcFile[]>([]);

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

    useEffect(() => {
        selectKnowledgeData();
    }, []);

    /**
     * 新增AI知识库文档数据
     */
    const refPost = async () => {
        selectKnowledgeData();
        setModal({ title: formatMessage({ id: 'system.add' }), visible: true });
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
        // 数据保存中不允许关闭
        if (loadingModal) {
            return
        }
        setModal({ title: '', visible: false });
        // 恢复默认选择
        setSourceType('INPUT');
        form.resetFields();
        setFileList([]);
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

                    // 如果是上传文件类型，需要特殊处理
                    if (fields.sourceType === 'UPLOAD') {
                        // 表单数据
                        const formData = new FormData();

                        // 添加文件数据源
                        if (fileList.length <= 0) {
                            return message.error('资料不能为空');
                        }
                        fileList.forEach((file: RcFile) => {
                            formData.append('files', file);
                        });

                        const { code, msg, data } = await batchUpload(formData);
                        if (code !== 200) {
                            return message.error(msg);
                        }

                        const files: {
                            fileName: string;
                            fileUrl: string;
                        }[] = [];

                        // 基础路径
                        const fileBase =
                            TWT.static?.charAt(0) === '/' ? TWT.static : `${TWT.static}/`;

                        // 插入文件列表
                        for (let fileItem of data) {
                            files.push({
                                fileName: fileItem.originalFileName,
                                fileUrl: `${fileBase}${fileItem.path}`,
                            });
                        }
                        // 插入数据
                        fields.fileList = files;
                    }

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
                            name="fileList"
                            rules={[
                                {
                                    required: true,
                                    message: '请上传资料',
                                    validator: () => {
                                        if (fileList.length <= 0) {
                                            return Promise.reject(new Error('请上传资料'));
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Dragger
                                name="fileList"
                                // 设置默认可选择支持上传的文件类型
                                accept={allowFileType.join(',')}
                                // 支持多文件上传
                                multiple={true}
                                // 文件列表
                                fileList={fileList}
                                onChange={(info) => {
                                    const fileList: any[] = info.fileList;

                                    if (fileList.length > fileNumberMax) {
                                        return message.warning(
                                            `上传文件数量超出限制，最多允许上传 ${fileNumberMax} 个文件`,
                                        );
                                    }

                                    let files: any[] = [];

                                    fileList.forEach(
                                        (file: {
                                            type: string;
                                            name: string;
                                            size: number;
                                            originFileObj: RcFile;
                                        }) => {
                                            if (file.size > 1024 * 1024 * fileMax) {
                                                return message.warning(
                                                    `文件大小不允许超出${fileMax}MB`,
                                                );
                                            }
                                            // md 文件可能识别为空类型
                                            if (
                                                file.type === '' ||
                                                allowFileType.includes(file.type)
                                            ) {
                                                // 加入数组
                                                if (file.originFileObj) {
                                                    // files.push(file.originFileObj)
                                                    files.push(file.originFileObj);
                                                } else {
                                                    // files.push(file)
                                                    files.push(file);
                                                }
                                            } else {
                                                message.warning(`不支持此文件类型`);
                                            }
                                        },
                                    );

                                    setFileList(files);
                                }}
                                // 继续限制上传文件
                                beforeUpload={() => {
                                    // 不允许直接上传, 手动操作
                                    return false;
                                }}
                            >
                                将文件拖到此处，或 <span className={`color-blue`}>点击上传</span>
                            </Dragger>
                            <span>
                                请上传 大小不超过 <span className={`color-red`}>{fileMax}MB</span>
                                格式为
                                <span className={`color-red`}>
                                    md/doc/xls/ppt/txt/pdf/docx/xlsx/pptx
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
