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
} from '@ant-design/icons';
import { Button, Divider, message, Popconfirm, Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { delKnowledge, exportKnowledge, pageQueryKnowledge } from './service';
import { system } from '@/utils/twelvet';
import { isArray } from 'lodash';
import { proTableConfigs } from '@/setting';
import KnowledgeModal from '@/pages/AI/Knowledge/componets/KnowledgeModal';

/**
 * AI知识库模块
 */
const Knowledge: React.FC = () => {
    const { formatMessage } = useIntl();

    const [state] = useState<{
        pageSize: number;
    }>({
        pageSize: 10,
    });

    // 进入Model处理的切片信息
    const [knowledgeModal, setKnowledgeModal] = useState<{
        knowledgeId: number;
        visible: boolean;
    }>({
        knowledgeId: 0,
        visible: false,
    });

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    /**
     * 移除AI知识库数据
     * @param knowledgeId
     */
    const refRemove = async (knowledgeId: (string | number)[] | string | undefined) => {
        try {
            if (!knowledgeId) {
                return true;
            }

            let params;
            if (isArray(knowledgeId)) {
                params = knowledgeId.join(',');
            } else {
                params = knowledgeId;
            }

            const { code, msg } = await delKnowledge(params);

            if (code !== 200) {
                return message.error(msg);
            }

            message.success(msg);

            acForm?.current?.reload();
        } catch (e) {
            system.error(e);
        }
    };

    // Form参数
    const columns: ProColumns<any>[] = [
        {
            title: '知识库名称',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'knowledgeName',
        },
        {
            title: '知识库排序',
            search: false,
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'knowledgeSort',
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
                        <a
                            onClick={() =>
                                setKnowledgeModal({
                                    knowledgeId: row.knowledgeId,
                                    visible: true,
                                })
                            }
                        >
                            <Space>
                                <EditOutlined />
                                {formatMessage({ id: 'system.update' })}
                            </Space>
                        </a>

                        <Divider type="vertical" />

                        <Popconfirm onConfirm={() => refRemove(row.knowledgeId)} title="确定删除吗">
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
                rowKey="knowledgeId"
                columns={columns}
                request={async (params) => {
                    const { data } = await pageQueryKnowledge(params);
                    const { records, total } = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
                rowSelection={{}}
                toolBarRender={(action, { selectedRowKeys }) => [
                    <Button key="add" type="default" onClick={() => setKnowledgeModal({
                        knowledgeId: 0,
                        visible: true,
                    })}>
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
                            exportKnowledge({
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

            <KnowledgeModal
                onClose={() => {
                    setKnowledgeModal({
                        knowledgeId: 0,
                        visible: false,
                    });
                }}
                info={knowledgeModal}
            />
        </PageContainer>
    );
};

export default Knowledge;
