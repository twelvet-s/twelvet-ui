import React, {useRef, useState} from 'react';

import {proTableConfigs} from '@/setting';
import {CloseOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
    Button,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Radio,
    Row,
    Space,
    TreeSelect,
} from 'antd';
import {getInfo, insert, list, remove, update} from './service';
import {auth, makeTree, system} from '@/utils/twelvet';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';

/**
 * 部门模块
 */
const Dept: React.FC = () => {

    const {formatMessage} = useIntl()

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    // 部门数据源
    const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    const acForm = useRef<ActionType>();
    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {
            sm: {span: 6},
        },
        wrapperCol: {
            sm: {span: 16},
        },
    };

    /**
     * 更新部门数据(保证部门数据的最新)
     */
    const putData = async () => {
        try {
            const {code, msg, data} = await list({});
            if (code !== 200) {
                return message.error(msg);
            }

            const tree = makeTree({
                dataSource: data,
                id: `deptId`,
                enhance: {
                    key: `deptId`,
                    title: `deptName`,
                    value: `deptId`,
                },
            });

            setDataSource([
                {
                    key: 0,
                    title: `顶级企业`,
                    value: 0,
                    children: tree,
                },
            ]);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 获取新增部门信息
     * @param deptId
     */
    const refPost = async (deptId: number) => {
        // 更新数据
        putData();

        if (deptId !== 0) {
            const field: Record<string, any> = {parentId: deptId};
            // 设置表单数据
            form.setFieldsValue(field);
        }

        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    };

    /**
     * 获取修改部门信息
     * @param deptId
     */
    const refPut = async (deptId: number) => {
        try {
            // 更新部门数据
            putData();
            const {data} = await getInfo(deptId);

            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true});
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除部门
     * @param row row
     */
    const refRemove = async (row: Record<string, any>) => {
        try {
            const {code, msg} = await remove(row.deptId);
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
                    // deptId为0则insert，否则将update
                    const {msg} = fields.deptId === 0 ? await insert(fields) : await update(fields);

                    message.success(msg);

                    acForm?.current?.reload();

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
    const columns: ProColumns<HumanDept.PageListItem>[] = [
        {
            title: '部门名称',
            ellipsis: false,
            width: 200,
            valueType: 'text',
            dataIndex: 'deptName',
        },
        {
            title: '排序',
            ellipsis: false,
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'orderNum',
        },
        {
            title: '状态',
            ellipsis: false,
            dataIndex: 'status',
            valueEnum: {
                '0': {text: '正常', status: 'success'},
                '1': {text: '停用', status: 'error'},
            },
        },
        {
            title: '创建时间',
            width: 200,
            valueType: 'dateTime',
            search: false,
            dataIndex: 'createTime',
        },
        {
            title: '操作',
            fixed: 'right',
            search: false,
            width: 200,
            valueType: 'option',
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <>
                        <a onClick={() => refPost(row.deptId)} hidden={auth('system:dept:insert')}>
                            <Space>
                                <PlusOutlined/>
                                {formatMessage({id: 'system.add'})}
                            </Space>
                        </a>
                        <Divider type="vertical"/>

                        <a onClick={() => refPut(row.deptId)} hidden={auth('system:dept:update')}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>
                        <Divider type="vertical"/>

                        <Popconfirm onConfirm={() => refRemove(row)} title="确定删除吗">
                            <a href="#" hidden={auth('system:dept:remove')}>
                                <Space>
                                    <CloseOutlined />
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
            <ProTable<HumanDept.PageListItem, HumanDept.PageParams>
                {...proTableConfigs}
                actionRef={acForm}
                rowKey="deptId"
                columns={columns}
                defaultExpandAllRows={true}
                // 处理响应的数据
                postData={(postDataSource) => {
                    return makeTree({
                        dataSource: postDataSource,
                        id: 'deptId',
                    });
                }}
                request={list}
                toolBarRender={() => [
                    <Button key={'addTool'} type="default" onClick={() => refPost(0)}>
                        <PlusOutlined />
                        {formatMessage({id: 'system.add'})}
                    </Button>,
                ]}
                pagination={false}
            />

            <Modal
                title={`${modal.title}部门`}
                width={700}
                open={modal.visible}
                confirmLoading={loadingModal}
                okText={`${modal.title}`}
                onOk={onSave}
                onCancel={handleCancel}
            >
                <Form name="Dept" form={form}>
                    <Form.Item hidden label="部门ID" name="deptId" initialValue={0}>
                        <Input/>
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
                        label="上级部门"
                        name="parentId"
                        rules={[{required: true, message: '请选择上级部门'}]}
                    >
                        <TreeSelect
                            // 支持搜索
                            showSearch
                            // 根据title进行搜索
                            treeNodeFilterProp="title"
                            dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                            placeholder="请选择上级部门"
                            treeData={dataSource}
                        />
                    </Form.Item>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="部门名称"
                                name="deptName"
                                rules={[{required: true, message: '部门名称不能为空'}]}
                            >
                                <Input placeholder="部门名称"/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="显示排序"
                                name="orderNum"
                                rules={[{required: true, message: '部门排序不能为空'}]}
                            >
                                <InputNumber placeholder="排序" min={0}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item {...formItemLayout} label="负责人" name="leader">
                                <Input placeholder="负责人"/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item {...formItemLayout} label="联系电话" name="phone">
                                <Input placeholder="联系电话"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item {...formItemLayout} label="邮箱" name="email">
                                <Input placeholder="邮箱"/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item {...formItemLayout} label="状态" name="status" initialValue={'0'}>
                                <Radio.Group>
                                    <Radio value={'0'}>正常</Radio>
                                    <Radio value={'1'}>停用</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default Dept;
