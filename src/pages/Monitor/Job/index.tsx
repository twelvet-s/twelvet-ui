import React, {useEffect, useRef, useState} from 'react';

import {proTableConfigs} from '@/setting';
import {
    AreaChartOutlined,
    CaretRightOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import {
    Popconfirm,
    Button,
    message,
    Space,
    Radio,
    Form,
    Modal,
    Input,
    Row,
    Col,
    Tooltip,
    Divider,
} from 'antd';
import {pageQuery, remove, exportExcel, run, insert, update, getByJobId} from './service';
import {system, auth} from '@/utils/twelvet';
import JobStatus from './components/jobStatusSwitch';
import type {ProColumns} from '@ant-design/pro-components';
import type {ActionType} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import Details from './components/details';
import type {FormInstance} from 'antd/lib/form';
import {isArray} from 'lodash';
import { useIntl, history } from '@umijs/max'
import DictionariesSelect from '@/components/TwelveT/Dictionaries/DictionariesSelect';

/**
 * 定时任务
 */
const Job: React.FC = () => {

    const {formatMessage} = useIntl()

    const formItemLayout = {
        labelCol: {
            sm: {span: 6},
        },
        wrapperCol: {
            sm: {span: 16},
        },
    };

    const [form] = Form.useForm();

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    const [state] = useState<MonitorJob.State>({
        pageSize: 10
    });

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [modelDetails, setModelDetails] = useState<{
        vimodelDetails: boolean;
        jobId: number;
    }>({
        vimodelDetails: false,
        jobId: 0,
    });

    /**
     * 初始化数据
     */
    useEffect(() => {
    }, []);

    /**
     * 获取修改菜单信息
     * @param jobId
     */
    const refPut = async (jobId: number) => {
        try {
            const {data} = await getByJobId({jobId: jobId});
            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true});
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 执行任务
     * @param row
     */
    const runJob = async (row: Record<string, any>) => {
        try {
            // 参数
            const params = {
                jobId: row.jobId,
                jobGroup: row.jobGroup,
            };

            const {code, msg} = await run(params);
            if (code !== 200) {
                return message.error(msg);
            }
            message.success(msg);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除任务
     * @param jobIds
     */
    const refRemove = async (jobIds: (string | number)[] | undefined) => {
        try {
            if (!jobIds) {
                return true;
            }

            let params: string;
            if (isArray(jobIds)) {
                params = jobIds.join(',');
            } else {
                params = jobIds;
            }

            const {code, msg} = await remove(params);
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
     * 新增任务
     */
    const refPost = async () => {
        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    };

    /**
     * 取消Modal的显示
     */
    const handleCancel = () => {
        setModal({title: '', visible: false});
        form.resetFields();
    };

    /**
     * 保存数据
     */
    const onSave = () => {
        form
            .validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);
                    // ID为0则insert，否则将update
                    const {code, msg} = fields.jobId === 0 ? await insert(fields) : await update(fields);
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
    const columns: ProColumns<MonitorJob.PageListItem>[] = [
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
            title: '调用目标字符串',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'invokeTarget',
        },
        {
            title: 'cron执行表达式',
            search: false,
            width: 200,
            valueType: 'text',
            dataIndex: 'cronExpression',
        },
        {
            title: '状态',
            ellipsis: false,
            dataIndex: 'status',
            render: (_, row) => <JobStatus row={row}/>,
        },
        {
            title: '操作',
            fixed: 'right',
            width: 380,
            valueType: 'option',
            search: false,
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <>
                        <a onClick={() => refPut(row.jobId)} hidden={auth('monitor:job:update')}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={() => runJob(row)} title="是否执行任务">
                            <a href="#">
                                <Space>
                                    <CaretRightOutlined/>
                                    {formatMessage({id: 'system.execute'})}
                                </Space>
                            </a>
                        </Popconfirm>
                        <Divider type="vertical"/>
                        <a
                            type="default"
                            onClick={() => {
                                setModelDetails({
                                    vimodelDetails: true,
                                    jobId: row.jobId,
                                });
                            }}
                        >
                            <Space>
                                <EyeOutlined/>
                                {formatMessage({id: 'system.details'})}
                            </Space>
                        </a>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={() => refRemove([row.jobId])} title="是否删除">
                            <a href="#" hidden={auth('monitor:job:remove')}>
                                <Space>
                                    <DeleteOutlined/>
                                    {formatMessage({id: 'system.delete'})}
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
            <ProTable<MonitorJob.PageListItem, MonitorJob.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="jobId"
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
                    <Button key={'addTool'} hidden={auth('monitor:job:insert')} type="default" onClick={refPost}>
                        <PlusOutlined />
                        {formatMessage({id: 'system.add'})}
                    </Button>,
                    <Button key={'log'} hidden={auth('system:operlog')} type="default" onClick={() => {
                        history.push('/log/job')
                    }}>
                        <AreaChartOutlined />
                        {formatMessage({id: 'system.log'})}
                    </Button>,
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
                    <Popconfirm
                        key={'exportTool'}
                        title="是否导出数据"
                        onConfirm={() => {
                            exportExcel({
                                ...formRef.current?.getFieldsValue(),
                            });
                        }}
                    >
                        <Button type="default">
                            <FundProjectionScreenOutlined/>
                            {formatMessage({id: 'system.export'})}
                        </Button>
                    </Popconfirm>,
                ]}
            />

            <Modal
                title={`${modal.title}任务`}
                width={700}
                open={modal.visible}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                onOk={onSave}
                onCancel={handleCancel}
            >
                <Form name="Job" form={form}>
                    <Form.Item hidden {...formItemLayout} label="任务ID" name="jobId" initialValue={0}>
                        <Input/>
                    </Form.Item>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="任务名称"
                                name="jobName"
                                rules={[{required: true, message: '任务名称不能为空'}]}
                            >
                                <Input placeholder="任务名称"/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="任务分组"
                                name="jobGroup"
                                rules={[{required: true, message: '任务分组不能为空'}]}
                            >
                                <DictionariesSelect type="sys_job_group"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        {...{
                            labelCol: {
                                sm: {span: 3},
                            },
                            wrapperCol: {
                                sm: {span: 16},
                            },
                        }}
                        label={
                            <Tooltip
                                title="
                                Bean调用示例：
                                twtTask.twtParams('twt')

                                Class类调用示例：
                                com.twelvet.server.job.task.TWTTask.twtParams('twt')
                                参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                            "
                            >
                                调用方法
                            </Tooltip>
                        }
                        name="invokeTarget"
                        rules={[{required: true, message: '调用方法不能为空'}]}
                    >
                        <Input placeholder="调用方法"/>
                    </Form.Item>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="cron命令"
                                name="cronExpression"
                                rules={[{required: true, message: 'cron命令不能为空'}]}
                            >
                                <Input placeholder="cron命令"/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item {...formItemLayout} label="是否并发" name="concurrent" initialValue={'1'}>
                                <Radio.Group optionType="button" buttonStyle="solid">
                                    <Radio.Button value={'0'}>允许</Radio.Button>
                                    <Radio.Button value={'1'}>禁止</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        {...{
                            labelCol: {
                                sm: {span: 3},
                            },
                            wrapperCol: {
                                sm: {span: 21},
                            },
                        }}
                        label="执行策略"
                        name="misfirePolicy"
                        initialValue={'1'}
                    >
                        <Radio.Group optionType="button" buttonStyle="solid">
                            <Radio.Button value={'1'}>立即执行</Radio.Button>
                            <Radio.Button value={'2'}>执行一次</Radio.Button>
                            <Radio.Button value={'3'}>放弃执行</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        {...{
                            labelCol: {
                                sm: {span: 3},
                            },
                            wrapperCol: {
                                sm: {span: 16},
                            },
                        }}
                        label="状态"
                        name="status"
                        initialValue={'0'}
                    >
                        <Radio.Group optionType="button" buttonStyle="solid">
                            <Radio value={'0'}>正常</Radio>
                            <Radio value={'1'}>暂停</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>

            <Details
                modelDetails={modelDetails}
                onCancel={() => {
                    setModelDetails({
                        vimodelDetails: false,
                        jobId: 0,
                    });
                }}
            />
        </PageContainer>
    );
};

export default Job;
