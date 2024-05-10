import React, { useRef, useState } from 'react'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { ProTable, PageContainer } from '@ant-design/pro-components'
import { proTableConfigs } from '@/setting'
import {
    CloseOutlined,
    CloudSyncOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileZipOutlined,
    SyncOutlined,
} from '@ant-design/icons'
import type { FormInstance } from 'antd'
import { Button, Divider, message, Popconfirm, Space } from 'antd'
import { batchGenCode, pageQuery, remove, synchDb } from './service'
import { system } from '@/utils/twelvet'
import DrawerInfo from './components/DrawerInfo'
import PreviewCode from './components/PreviewCode'
import EditCode from './components/EditCode'
import { useIntl } from '@umijs/max'

/**
 * 代码生成器
 */
const Gen: React.FC = () => {

    const {formatMessage} = useIntl()

    const acForm = useRef<ActionType>()

    const formRef = useRef<FormInstance>()

    const [state] = useState<ToolGen.State>({
        pageSize: 10,
    })

    const [drawerInfoVisible, setDrawerInfoVisible] = useState<boolean>(false)

    const [previewCodeVisible, setPreviewCodeVisible] = useState<{
        tableId: number
        visible: boolean;
    }>({
        tableId: 0,
        visible: false,
    });

    const [editCodeVisible, setEditCodeVisible] = useState<{
        tableId: number;
        visible: boolean;
    }>({
        tableId: 0,
        visible: false,
    });

    /**
     * 移除
     * @param tableIds
     */
    const refRemove = async (tableIds: (string | number)[] | undefined) => {
        try {
            if (!tableIds) {
                return true;
            }
            const { code, msg } = await remove(tableIds);
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
     *
     * @param tableId 同步表结构域
     */
    const refSynchDb = async (tableId: number) => {
        try {
            const { code, msg } = await synchDb(tableId);
            if (code !== 200) {
                return message.error(msg);
            }

            message.success(msg);
        } catch (e) {
            system.error(e);
        }
    };

    // Form参数
    const columns: ProColumns<ToolGen.PageListItem>[] = [
        {
            title: '表名称',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'tableName',
        },
        {
            title: '表描述',
            width: 200,
            valueType: 'text',
            dataIndex: 'tableComment',
        },
        {
            title: '实体',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'className',
        },
        {
            title: '创建时间',
            width: 200,
            valueType: 'dateTime',
            search: false,
            dataIndex: 'createTime',
        },
        {
            title: '更新时间',
            width: 200,
            valueType: 'dateTime',
            search: false,
            dataIndex: 'updateTime',
        },
        {
            title: '操作',
            fixed: 'right',
            width: 400,
            search: false,
            render: (dom, record) => {
                return (
                    <>
                        <a
                            onClick={() =>
                                setPreviewCodeVisible({
                                    tableId: record.tableId,
                                    visible: true,
                                })
                            }
                        >
                            <Space>
                                <EyeOutlined />
                                {formatMessage({id: 'system.preview'})}
                            </Space>
                        </a>
                        <Divider type="vertical" />
                        <a
                            href="#"
                            onClick={() =>
                                setEditCodeVisible({
                                    tableId: record.tableId,
                                    visible: true,
                                })
                            }
                        >
                            <Space>
                                <EditOutlined />
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>
                        <Divider type="vertical" />
                        <Popconfirm onConfirm={() => refRemove([record.tableId])} title="确定删除吗">
                            <a href="#">
                                <Space>
                                    <CloseOutlined />
                                    {formatMessage({id: 'system.delete'})}
                                </Space>
                            </a>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Popconfirm onConfirm={() => refSynchDb(record.tableId)} title="确定强制同步结构吗">
                            <a href="#">
                                <Space>
                                    <SyncOutlined spin />
                                    {formatMessage({id: 'system.sync'})}
                                </Space>
                            </a>
                        </Popconfirm>
                        <Divider type="vertical" />
                        <Popconfirm onConfirm={() => batchGenCode([record.tableId])} title="确定生成吗">
                            <a href="#">
                                <Space>
                                    <FileZipOutlined />
                                    {formatMessage({id: 'system.gen.code'})}
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
            <ProTable<ToolGen.PageListItem, ToolGen.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="tableId"
                columns={columns}
                request={async (params) => {
                    const { data } = await pageQuery(params);
                    const { records, total } = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
                rowSelection={{}}
                toolBarRender={(action, { selectedRowKeys, selectedRows }) => [
                    <Button
                        key={'importTool'}
                        type="primary"
                        onClick={() => {
                            setDrawerInfoVisible(true);
                        }}
                    >
                        <CloudSyncOutlined />
                        导入数据
                    </Button>,
                    <Popconfirm
                        key={'generateTool'}
                        disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                        onConfirm={() => {
                            const tableids = selectedRows?.map((item) => {
                                return item.tableId;
                            });
                            if (tableids) {
                                batchGenCode(tableids);
                            }
                        }}
                        title="是否批量生成"
                    >
                        <Button disabled={!(selectedRowKeys && selectedRowKeys.length > 0)} type="default">
                            <FileZipOutlined />
                            批量生成
                        </Button>
                    </Popconfirm>,
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
            {/* 代码预览 */}
            <PreviewCode
                onClose={() => {
                    setPreviewCodeVisible({
                        tableId: 0,
                        visible: false,
                    });
                }}
                info={previewCodeVisible}
            />

            {/* 数据导入 */}
            <DrawerInfo
                onClose={() => {
                    setDrawerInfoVisible(false);
                    acForm.current?.reload();
                }}
                visible={drawerInfoVisible}
            />

            {/* 代码生成结构编辑 */}
            <EditCode
                onClose={() => {
                    setEditCodeVisible({
                        tableId: 0,
                        visible: false,
                    });
                    acForm.current?.reload();
                }}
                info={editCodeVisible}
            />
        </PageContainer>
    );
};

export default Gen;
