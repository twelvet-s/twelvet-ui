import React, {useRef, useState} from 'react';

import {proTableConfigs} from '@/setting';
import {DeleteOutlined, FundProjectionScreenOutlined} from '@ant-design/icons';
import type {FormInstance} from 'antd';
import {Popconfirm, Button, message} from 'antd';
import {pageQuery, remove, exportExcel} from './service';
import {system, auth} from '@/utils/twelvet';
import type {ProColumns, ActionType} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';

/**
 * 登录日志
 */
const Login: React.FC = () => {

    const {formatMessage} = useIntl()

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [state] = useState<LogJob.State>({
        pageSize: 10
    });

    // Form参数
    const columns: ProColumns<LogJob.PageListItem>[] = [
        {
            title: '任务名称',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'jobName',
        },
        {
            title: '任务组名',
            width: 200,
            valueType: 'text',
            dataIndex: 'jobGroup',
        },
        {
            title: '调用目标方法',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'invokeTarget',
        },
        {
            title: '日志信息',
            width: 250,
            valueType: 'text',
            search: false,
            dataIndex: 'jobMessage',
        },
        {
            title: '执行状态',
            ellipsis: false,
            width: 200,
            dataIndex: 'status',
            valueEnum: {
                '0': {text: '成功', status: 'success'},
                '1': {text: '失败', status: 'error'},
            },
        },
        {
            title: '执行时间',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'createTime',
        },
        {
            title: '执行时间',
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
    ];

    /**
     * 移除
     * @param jobLogIds
     * @param action
     */
    const refRemove = async (
        jobLogIds: (string | number)[] | undefined,
        action: any,
    ) => {
        try {
            if (!jobLogIds) {
                return true;
            }
            const {code, msg} = await remove(jobLogIds.join(','));
            if (code !== 200) {
                return message.error(msg);
            }

            message.success(msg);

            action.reload();
        } catch (e) {
            system.error(e);
        }
    };

    return (
        <PageContainer>
            <ProTable<LogJob.PageListItem, LogJob.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="jobLogId"
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
                        onConfirm={() => refRemove(selectedRowKeys, action)}
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
                        onConfirm={() => {
                            exportExcel({
                                ...formRef.current?.getFieldsValue(),
                            });
                        }}
                        title="是否导出数据"
                    >
                        <Button type="default" hidden={auth('system:operlog:export')}>
                            <FundProjectionScreenOutlined/>
                            {formatMessage({id: 'system.export'})}
                        </Button>
                    </Popconfirm>,
                    <Popconfirm key={'cleanTool'} onConfirm={() => refRemove(selectedRowKeys, action)} title="是否清空">
                        <Button type="primary" danger>
                            <DeleteOutlined/>
                            清空
                        </Button>
                    </Popconfirm>,
                ]}
            />
        </PageContainer>
    );
};

export default Login;
