import React, { ReactNode, useRef, useState } from 'react';
import { Card, Drawer } from 'antd';
import { proTableConfigs } from '@/setting';
import { type ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { pageQuerySlice } from '@/pages/AI/Doc/componets/Slice/service';
import { FormInstance } from 'antd/lib/form';
import './styles.less';
import Markdown from 'react-markdown';
import { useIntl } from '@@/exports';

/**
 * AI知识库文档分片模块
 */
const DocSlice: React.FC<{
    info: {
        docId?: number;
        visible: boolean;
    };
    onClose: () => void;
}> = (props) => {
    const { formatMessage } = useIntl();

    const [state] = useState<{
        pageSize: number;
    }>({
        pageSize: 6,
    });

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const { info, onClose } = props;

    // Form参数
    const columns: ProColumns<any>[] = [
        {
            title: '卡片',
            fixed: 'right',
            width: 320,
            valueType: 'option',
            dataIndex: 'operation',
            render: (text: ReactNode, record, index: number, action) => {
                // 将每一行的值包装成一个方块 div
                return (
                    <Card
                        // TODO 需要改为文档切片对应的数值
                        title={`切片${index}`}
                        actions={[
                            <span key={record.sliceId}>字符数：{record.content.length}</span>,

                            /*<span key={record.sliceId}>
                                {formatMessage({id: 'system.update'})}
                            </span>,*/
                        ]}
                        /*extra={
                            // TODO 需要支持切片开关
                            <Switch defaultChecked />
                        }*/
                        className={'row'}
                        bordered={false}
                    >
                        <Card className={'row-info'} bordered={false}>
                            <Markdown>{record.content}</Markdown>
                        </Card>
                    </Card>
                );
            },
        },
    ];

    return (
        <Drawer
            width="80%"
            placement="right"
            closable={false}
            destroyOnClose={true}
            onClose={() => {
                onClose();
            }}
            open={info.visible}
        >
            <ProTable
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                // 禁用搜索
                search={false}
                // 禁用工具
                toolBarRender={false}
                // 关闭选择框
                rowSelection={false}
                // 隐藏标头
                showHeader={false}
                tableClassName={'table-ctn'}
                rowClassName={'row-ctn'}
                actionRef={acForm}
                formRef={formRef}
                rowKey="docSliceId"
                columns={columns}
                request={async (params) => {
                    params.docId = info.docId;
                    const { data } = await pageQuerySlice(params);
                    const { records, total } = data;
                    return Promise.resolve({
                        data: records,
                        success: true,
                        total,
                    });
                }}
            />
        </Drawer>
    );
};

export default DocSlice;
