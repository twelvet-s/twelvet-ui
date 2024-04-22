import React, {useRef, useState} from 'react';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {ProTable, PageContainer} from '@ant-design/pro-components';
import {DeleteOutlined, FundProjectionScreenOutlined} from '@ant-design/icons';
import type {FormInstance} from 'antd';
import {Popconfirm, Button, message} from 'antd';
import {proTableConfigs} from '@/setting';
import {exportExcel, pageQuery, remove} from './service';
import {system} from '@/utils/twelvet';
import { useIntl } from '@umijs/max';

/**
 * 登录日志
 * @returns
 */
const LogLogin: React.FC = () => {
    const {formatMessage} = useIntl()

    const actionRef = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [state, setState] = useState<LogLogin.State>({
        pageSize: 10,
        exportExcelLoading: false,
        deleteLoading: false,
    });

    // Form参数
    const columns: ProColumns<LogLogin.PageListItem>[] = [
        {
            title: '用户名称',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'userName',
        },
        {
            title: 'IP',
            width: 200,
            valueType: 'text',
            dataIndex: 'ipaddr',
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
            title: '状态',
            ellipsis: false,
            dataIndex: 'status',
            width: 200,
            valueEnum: {
                0: {text: '登录成功', status: 'success'},
                2: {text: '退出成功', status: 'success'},
                1: {text: '登录失败', status: 'error'},
            },
        },
        {
            title: '登录信息',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'msg',
        },
        {
            title: '登录时间',
            width: 200,
            valueType: 'dateTime',
            search: false,
            dataIndex: 'accessTime',
        },
    ];

    /**
     * 移除日志
     * @param action
     * @param infoIds
     */
    const refRemove = async (
        action: ActionType | undefined,
        infoIds: (string | number)[] | undefined,
    ) => {
        try {
            if (!infoIds) {
                return true;
            }
            const {code, msg} = await remove(infoIds.join(','));
            if (code !== 200) {
                return message.error(msg);
            }

            message.success(msg);

            // 重写加载并清空选择
            action?.reload();
        } catch (e) {
            system.error(e);
        }
    };

    return (
        <PageContainer>
            <ProTable<LogLogin.PageListItem, LogLogin.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={actionRef}
                formRef={formRef}
                rowKey="infoId"
                columns={columns}
                rowSelection={{}}
                request={async (params) => {
                    const {data} = await pageQuery(params);
                    const {records, total} = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
                toolBarRender={(action, {selectedRowKeys}) => [
                    <Popconfirm
                        key={'deleteSelect'}
                        disabled={!(selectedRowKeys && selectedRowKeys.length > 0)}
                        onConfirm={() => refRemove(action, selectedRowKeys)}
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
                        key={'exportExcel'}
                        disabled={state.exportExcelLoading}
                        title="是否导出数据"
                        onConfirm={() => {
                            try {
                                setState({
                                    ...state,
                                    exportExcelLoading: true,
                                });
                                exportExcel({
                                    ...formRef.current?.getFieldsValue(),
                                }).then(() => {
                                    system.log("导出成功")
                                });
                            } finally {
                                setState({
                                    ...state,
                                    exportExcelLoading: false,
                                });
                            }
                        }}
                    >
                        <Button
                            type="default"
                            loading={state.exportExcelLoading}
                            disabled={state.exportExcelLoading}
                        >
                            <FundProjectionScreenOutlined/>
                            {formatMessage({id: 'system.export'})}
                        </Button>
                    </Popconfirm>,
                ]}
            />
        </PageContainer>
    );
};

export default LogLogin;
