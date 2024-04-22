import React, {useState, useRef, useEffect} from 'react';

import {proTableConfigs} from '@/setting';
import {DeleteOutlined, FundProjectionScreenOutlined, EyeOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable, ProDescriptions} from '@ant-design/pro-components';
import type {FormInstance} from 'antd';
import {Popconfirm, Button, message, Modal, Space} from 'antd';
import {pageQuery, remove, exportExcel, getDictionariesType} from './service';
import {system, auth} from '@/utils/twelvet';
import { useIntl } from '@umijs/max';

/**
 * 操作日志
 */
const Operation: React.FC = () => {

    const {formatMessage} = useIntl()

    const [descriptions, setDescriptions] = useState<Record<string, string | number>>();

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [operType, setOperType] = useState<any>({});

    /**
     * 获取操作类型数据
     */
    const getOperType = async () => {
        try {
            const {data} = await getDictionariesType();

            const res = {};

            data.map((item: { dictValue: string; dictLabel: string }) => {
                res[item.dictValue] = item.dictLabel;
            });

            setOperType(res);

        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 查看详情
     * @param row row
     */
    const handleView = (row: Record<string, string | number>) => {
        // 设置描述数据
        setDescriptions(row);

        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    };

    /**
     * 移除菜单
     * @param infoIds
     */
    const refRemove = async (infoIds: (string | number)[] | undefined) => {
        try {
            if (!infoIds) {
                return;
            }
            const {msg} = await remove(infoIds.join(','));

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
    };

    /**
     * 初始化数据
     */
    useEffect(() => {
        getOperType();
    }, []);

    // Form参数
    const columns: ProColumns<LogOperation.PageListItem>[] = [
        {
            title: '系统模块',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'service',
        },
        {
            title: '请求方式',
            search: false,
            width: 200,
            valueType: 'text',
            dataIndex: 'requestMethod',
        },
        {
            title: '操作类型',
            ellipsis: false,
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'businessType',
            render: (_, row) => {
                return operType[row.businessType];
            },
        },
        {
            title: '操作人员',
            width: 200,
            valueType: 'text',
            dataIndex: 'operName',
        },
        {
            title: '操作IP',
            width: 200,
            search: false,
            dataIndex: 'operIp',
        },
        {
            title: '操作状态',
            width: 200,
            search: false,
            dataIndex: 'status',
            valueEnum: {
                0: {text: '失败', status: 'error'},
                1: {text: '成功', status: 'success'},
            },
        },
        {
            title: '搜索日期',
            key: 'between',
            hideInTable: true,
            valueType: 'dateRange',
            search: {
                transform: (value) => {
                    return {
                        beginTime: value[0],
                        endTime: value[1],
                    };
                },
            },
        },
        {
            title: '操作时间',
            width: 200,
            valueType: 'dateTime',
            search: false,
            dataIndex: 'operTime',
        },
        {
            title: '操作',
            fixed: 'right',
            width: 200,
            valueType: 'option',
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <a onClick={() => handleView(row)}>
                        <Space>
                            <EyeOutlined/>
                            {formatMessage({id: 'system.details'})}
                        </Space>
                    </a>
                );
            },
        },
    ];

    return (
        <PageContainer>
            <ProTable<LogOperation.PageListItem, LogOperation.PageParams>
                {...proTableConfigs}
                actionRef={acForm}
                formRef={formRef}
                rowKey="operId"
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
                    <Popconfirm
                        key={'deleteTool'}
                        disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                        onConfirm={() => refRemove(selectedRowKeys)}
                        title="是否删除选中数据"
                    >
                        <Button
                            hidden={auth('system:operlog:remove')}
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
                        <Button type="default" hidden={auth('system:operlog:export')}>
                            <FundProjectionScreenOutlined/>
                            {formatMessage({id: 'system.export'})}
                        </Button>
                    </Popconfirm>,
                ]}
            />

            <Modal
                title={`查看详情`}
                width={700}
                open={modal.visible}
                okText={`${modal.title}`}
                onCancel={handleCancel}
                footer={null}
            >
                <ProDescriptions column={2}>
                    <ProDescriptions.Item label="操作模块">
                        {descriptions?.service}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="请求方式">
                        {descriptions?.requestMethod}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="请求地址">
                        {descriptions?.operUrl}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="操作方法">
                        {descriptions?.method}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="请求参数" valueType="jsonCode">
                        {descriptions?.operParam}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="返回参数" valueType="jsonCode">
                        {descriptions?.jsonResult}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="操作状态">
                        {descriptions?.status === 1 ? '正常' : '失败'}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="操作人员">
                        {descriptions?.operName}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="操作时间">
                        {descriptions?.operTime}
                    </ProDescriptions.Item>

                    <ProDescriptions.Item label="操作地点">
                        {descriptions?.operIp}
                    </ProDescriptions.Item>
                </ProDescriptions>
            </Modal>
        </PageContainer>
    );
};

export default Operation;
