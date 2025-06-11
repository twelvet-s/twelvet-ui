import React, { ReactNode, useRef, useState } from 'react';
import { Card, Drawer, Form, Input, message, Modal } from 'antd';
import { proTableConfigs } from '@/setting';
import { type ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { getSlice, pageQuerySlice, updateSlice } from '@/pages/AI/Doc/componets/Slice/service';
import { FormInstance } from 'antd/lib/form';
import './styles.less';
import Markdown from 'react-markdown';
import { system } from '@/utils/twelvet';
import { useIntl } from '@@/exports';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

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

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

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

    const [state] = useState<{
        pageSize: number;
    }>({
        pageSize: 6,
    });

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const { info, onClose } = props;

    /**
     * 取消Modal的显示
     */
    const handleCancel = () => {
        setModal({ title: '', visible: false });

        form.resetFields();
    };

    /**
     * 获取修改切片信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getSlice(row.sliceId);
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
     * 保存切片数据
     */
    const onSave = () => {
        form.validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);

                    // ID为0则insert，否则将update
                    const { code, msg } = await updateSlice(fields);
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
            title: '卡片',
            fixed: 'right',
            width: 320,
            valueType: 'option',
            dataIndex: 'operation',
            render: (text: ReactNode, record, index: number) => {
                // 将每一行的值包装成一个方块 div
                return (
                    <Card
                        // TODO 需要改为文档切片对应的数值
                        title={`切片${index}`}
                        actions={[
                            <span key={record.sliceId}>字符数：{record.content.length}</span>,

                            <span key={record.sliceId} onClick={() => refPut(record)}>
                                {formatMessage({ id: 'system.update' })}
                            </span>,
                        ]}
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
        <>
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

            <Modal
                title={`${modal.title}切片内容`}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                onOk={onSave}
                onCancel={handleCancel}
                // 销毁组件，要求重新装载
                destroyOnClose
                width={'100vw'}
            >
                <Form form={form}>
                    <Form.Item
                        hidden
                        {...formItemLayout}
                        label="主键"
                        name="sliceId"
                        initialValue={0}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        labelCol={{
                            xs: { span: 2 },
                            sm: { span: 2 },
                        }}
                        wrapperCol={{
                            xs: { span: 20 },
                            sm: { span: 20 },
                        }}
                        label="内容"
                        name="content"
                    >
                        <AceEditor
                            mode={'json'}
                            theme={'monokai'}
                            width={'100%'}
                            fontSize={14}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            // 是否只读
                            readOnly={false}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
                                minLines: 5, // 设置最小行数
                                wrapBehavioursEnabled: true, // 启用自动换行
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default DocSlice;
