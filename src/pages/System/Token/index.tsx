import React, {useRef, useState} from 'react';

import type {ProColumns, ActionType} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {proTableConfigs} from '@/setting';
import {CloseOutlined} from '@ant-design/icons';
import {message, Popconfirm, Space} from 'antd';
import {pageQuery, remove} from './service';
import type {FormInstance} from 'antd/lib/form';
import {isArray} from 'lodash';
import {system, auth} from '@/utils/twelvet';
import { useIntl } from '@umijs/max';

/**
 * Token令牌管理
 */
const Token: React.FC = () => {

    const {formatMessage} = useIntl()

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [state] = useState<SystemDfs.State>({
        pageSize: 10,
    });

    /**
     * 删除文件
     * @param fileIds
     */
    const refRemove = async (fileIds: (string | number)[] | string | undefined) => {
        try {
            if (!fileIds) {
                return;
            }

            let params;
            if (isArray(fileIds)) {
                params = fileIds.join(',');
            } else {
                params = fileIds;
            }

            const {msg} = await remove(params);

            message.success(msg);

            acForm?.current?.reload();
        } catch (e) {
            system.error(e);
        }
    };

    // Form参数
    const columns: ProColumns<SystemToken.PageListItem>[] = [
        {
            title: '用户名',
            copyable: true,
            width: 250,
            valueType: 'text',
            dataIndex: 'username',
        },
        {
            title: '客户端',
            copyable: true,
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'clientId',
        },
        {
            title: 'accessToken',
            copyable: true,
            width: 500,
            valueType: 'text',
            search: false,
            dataIndex: 'accessToken',
        },
        {
            title: '登录时间',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'issuedAt',
        },
        {
            title: '过期时间',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'expiresAt',
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
                        <Popconfirm onConfirm={() => refRemove([row.accessToken])} title="确定强退吗">
                            <a href="#" hidden={auth('system:token:remove')}>
                                <Space>
                                    <CloseOutlined/>
                                    {formatMessage({id: 'system.forceful.retreat'})}
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
            <ProTable<SystemToken.PageListItem, SystemToken.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                rowKey="fileId"
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
                formRef={formRef}
                rowSelection={{}}
            />
        </PageContainer>
    );
};

export default Token;
