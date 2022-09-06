import React, {useRef, useState} from 'react';

import ProTable from '@ant-design/pro-table';
import type {ProColumns, ActionType} from '@ant-design/pro-components';
import {PageContainer} from '@ant-design/pro-components';
import {proTableConfigs} from '@/setting';
import {CloseOutlined, DeleteOutlined, DownloadOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Divider, message, Popconfirm, Space} from 'antd';
import {pageQuery, remove} from './service';
import ImportDFS from './components/importDFS/Index';
import type {FormInstance} from 'antd/lib/form';
import {isArray} from 'lodash';
import {system, auth} from '@/utils/twelvet';
import TWT from '@/setting';

/**
 * 分布式文件系统
 */
const DFS: React.FC = () => {
  const acForm = useRef<ActionType>();

  const formRef = useRef<FormInstance>();

  const [importDFSVisible, setImpDFSVisible] = useState<boolean>(false);

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
  const columns: ProColumns<SystemDfs.PageListItem>[] = [
    {
      title: '空间',
      search: false,
      width: 80,
      valueType: 'text',
      dataIndex: 'spaceName',
    },
    {
      title: '文件名',
      copyable: true,
      width: 250,
      valueType: 'text',
      search: false,
      dataIndex: 'fileName',
    },
    {
      title: '文件原名',
      copyable: true,
      width: 200,
      valueType: 'text',
      dataIndex: 'originalFileName',
    },
    {
      title: '文件类型',
      width: 80,
      valueType: 'text',
      search: false,
      dataIndex: 'type',
    },
    {
      title: '文件大小',
      width: 80,
      valueType: 'text',
      search: false,
      dataIndex: 'size',
    },
    {
      title: '创建日期',
      width: 200,
      valueType: 'dateTime',
      search: false,
      dataIndex: 'createTime',
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
            <a href={`${TWT.static}${row.path}`} target={'_blank'} rel="noreferrer">
              <Space>
                <DownloadOutlined/>
                查看
              </Space>
            </a>
            <Divider type="vertical"/>
            <Popconfirm onConfirm={() => refRemove([row.fileId])} title="确定删除吗">
              <a href="#" hidden={auth('system:dict:remove')}>
                <Space>
                  <CloseOutlined/>
                  删除
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
      <ProTable<SystemDfs.PageListItem, SystemDfs.PageParams>
        {...proTableConfigs}
        pagination={{
          // 是否允许每页大小更改
          showSizeChanger: true,
          // 每页显示条数
          pageSize: state.pageSize,
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
        toolBarRender={(action, {selectedRowKeys}) => [
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
              批量删除
            </Button>
          </Popconfirm>,
          <Button
            type="primary"
            key={'upload'}
            onClick={() => {
              setImpDFSVisible(true);
            }}
          >
            <PlusOutlined/>
            上传文件
          </Button>,
        ]}
      />

      <ImportDFS
        visible={importDFSVisible}
        onCancel={() => {
          setImpDFSVisible(false);
        }}
        ok={() => {
          acForm.current?.reload();
        }}
      />
    </PageContainer>
  );
};

export default DFS;
