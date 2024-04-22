import React, {useState, useRef} from 'react';

import {proTableConfigs} from '@/setting';
import {
    DeleteOutlined,
    FundProjectionScreenOutlined,
    PlusOutlined,
    EditOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
    Popconfirm,
    Button,
    message,
    Modal,
    Form,
    Input,
    Radio,
    Row,
    Col,
    Select,
    TreeSelect,
    Space,
    Divider,
} from 'antd';
import type {FormInstance} from 'antd/lib/form';
import DpetSearch from './components/dpetSearch/Index';
import ImportStaff from './components/importStaff/Index';
import StaffStatusSwitch from './components/staffStatusSwitch/Index';
import {
    pageQuery,
    remove,
    exportExcel,
    getByStaffId,
    getByStaff,
    insert,
    update,
    treeSelect,
    updatePassword,
} from './service';
import {system, auth} from '@/utils/twelvet';
import {isArray} from 'lodash';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';

/**
 * 职员模块
 */
const Staff: React.FC = () => {

    const {formatMessage} = useIntl()

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean; modelType: string }>({
        title: ``,
        visible: false,
        modelType: '',
    });

    const [resetPassword, setResetPassword] = useState<{
        title: string;
        visible: boolean;
        modelType: string;
    }>({title: ``, visible: false, modelType: ''});

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    const [importStaffVisible, setImportStaffVisible] = useState<boolean>(false);

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [form] = Form.useForm();

    const [prform] = Form.useForm();

    // 部门数据
    const [DEPTS, setDEPTS] = useState<Record<string, any>[]>([]);

    // 岗位数据
    const [POSTS, setPOSTS] = useState<Record<string, any>[]>([]);

    // 角色数据
    const [ROLES, setROLES] = useState<Record<string, any>[]>([]);

    const {TextArea} = Input;

    const formItemLayout = {
        labelCol: {
            xs: {span: 4},
            sm: {span: 4},
        },
        wrapperCol: {
            xs: {span: 18},
            sm: {span: 18},
        },
    };

    const makeDept = async () => {
        try {
            const {code, msg, data} = await treeSelect();
            if (code !== 200) {
                return message.error(msg);
            }

            setDEPTS(data);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 新增职员
     */
    const refPost = async () => {
        setModal({title: formatMessage({id: 'system.add'}), visible: true, modelType: 'POST'});
        // 获取新增用户所属数据
        const {data} = await getByStaff();

        const {posts, roles} = data;

        const postTees: Record<string, any>[] = new Array<Record<string, any>>();
        // 制作岗位数据
        posts.filter((item: { postName: string; postId: number }) => {
            return postTees.push({
                title: item.postName,
                key: item.postId,
                value: item.postId,
            });
        });

        setPOSTS(postTees);

        const roleTees: Record<string, any>[] = new Array<Record<string, any>>();
        // 制作岗位数据
        roles.filter((item: { roleName: string; roleId: number }) => {
            return roleTees.push({
                title: item.roleName,
                key: item.roleId,
                value: item.roleId,
            });
        });

        setROLES(roleTees);

        // 获得部门数据
        makeDept();
    };

    const changPassword = async (userId: number) => {
        prform.setFieldsValue({userId: userId});
        // 设置Modal状态
        setResetPassword({title: formatMessage({id: 'system.rest.password'}), visible: true, modelType: 'PUT'});
    };

    /**
     * 获取修改职员信息
     * @param row row
     */
    const refPut = async (row: Record<string, any>) => {
        try {
            const {code, msg, data} = await getByStaffId(row.userId);
            if (code !== 200) {
                return message.error(msg);
            }

            const {staff, posts, postIds, roles, roleIds} = data;

            staff.postIds = postIds;
            staff.roleIds = roleIds;

            // 赋值表单数据
            form.setFieldsValue(staff);

            const postTree: Record<string, any>[] = new Array<Record<string, any>>();
            // 制作岗位数据
            posts.filter((item: { postName: string; postId: number }) => {
                return postTree.push({
                    title: item.postName,
                    key: item.postId,
                    value: item.postId,
                });
            });

            setPOSTS(postTree);

            const roleTree: Record<string, any>[] = new Array<Record<string, any>>();
            // 制作岗位数据
            roles.filter((item: { roleName: string; roleId: number }) => {
                return roleTree.push({
                    title: item.roleName,
                    key: item.roleId,
                    value: item.roleId,
                });
            });

            setROLES(roleTree);

            // 获得部门数据
            makeDept();

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true, modelType: 'PUT'});
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除职员
     * @param userIds
     */
    const refRemove = async (userIds: (string | number)[] | string | undefined) => {
        try {
            if (!userIds) {
                return true;
            }

            let params;
            if (isArray(userIds)) {
                params = userIds.join(',');
            } else {
                params = userIds;
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
     * 取消Modal的显示
     */
    const handleCancel = () => {
        setModal({title: '', visible: false, modelType: ''});
        form.resetFields();
    };
    /**
     * 取消Modal的显示
     */
    const rehandleCancelHandler = () => {
        setResetPassword({title: '', visible: false, modelType: ''});
        prform.resetFields();
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
                    const {code, msg} = fields.userId === 0 ? await insert(fields) : await update(fields);
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
    /**
     * 保存数据
     */
    const resetPasswordHandler = () => {
        prform
            .validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);

                    // ID为0则insert，否则将update
                    const {code, msg} = await updatePassword(fields);
                    if (code !== 200) {
                        return message.error(msg);
                    }

                    message.success(msg);

                    // 关闭模态框
                    rehandleCancelHandler();
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
    const columns: ProColumns<HumanStaff.PageListItem>[] = [
        {
            title: '部门',
            key: 'deptId',
            hideInTable: true,
            dataIndex: 'deptId',
            renderFormItem: () => <DpetSearch/>,
        },
        {
            title: '用户账号',
            width: 200,
            valueType: 'text',
            dataIndex: 'username',
        },
        {
            title: '用户昵称',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'nickName',
        },
        {
            title: '部门',
            width: 200,
            ellipsis: false,
            valueType: 'text',
            search: false,
            dataIndex: 'deptName',
            render: (_, row) => {
                return row.dept.deptName;
            },
        },
        {
            title: '手机号码',
            width: 200,
            valueType: 'text',
            dataIndex: 'phonenumber',
        },
        {
            title: '状态',
            ellipsis: false,
            width: 80,
            dataIndex: 'status',
            valueEnum: {
                '0': {text: '正常', status: 'success'},
                '1': {text: '停用', status: 'error'},
            },
            render: (_, row) => <StaffStatusSwitch row={row}/>,
        },
        {
            title: '创建时间',
            search: false,
            width: 200,
            valueType: 'dateTime',
            dataIndex: 'createTime',
        },
        {
            title: '创建时间',
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
            title: '操作',
            fixed: 'right',
            width: 200,
            valueType: 'option',
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <>
                        <a onClick={() => refPut(row)} hidden={auth('system:user:update')}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={() => refRemove([row.userId])} title="确定删除吗">
                            <a href="#" hidden={auth('system:user:remove')}>
                                <Space>
                                    <CloseOutlined />
                                    {formatMessage({id: 'system.delete'})}
                                </Space>
                            </a>
                        </Popconfirm>
                        <Divider type="vertical"/>
                        <a onClick={() => changPassword(row.userId)}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.rest.password'})}
                            </Space>
                        </a>
                    </>
                );
            },
        },
    ];

    return (
        <PageContainer>
            <ProTable<HumanStaff.PageListItem, HumanStaff.PageParams>
                {...proTableConfigs}
                actionRef={acForm}
                formRef={formRef}
                rowKey="userId"
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
                    <Button
                        key={'addTool'}
                        hidden={auth('system:user:insert')}
                        type="default"
                        onClick={refPost}
                    >
                        <PlusOutlined />
                        {formatMessage({id: 'system.add'})}
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
                        <Button type="default" hidden={auth('system:user:export')}>
                            <FundProjectionScreenOutlined/>
                            {formatMessage({id: 'system.export'})}
                        </Button>
                    </Popconfirm>,
                    <Button
                        key={'importTool'}
                        hidden={auth('system:user:import')}
                        type="primary"
                        onClick={() => {
                            setImportStaffVisible(true);
                        }}
                    >
                        <PlusOutlined/>
                        {formatMessage({id: 'system.import'})}
                    </Button>,
                ]}
            />

            <Modal
                title={`${resetPassword.title}`}
                open={resetPassword.visible}
                width={500}
                okText={`${resetPassword.title}`}
                confirmLoading={loadingModal}
                onOk={resetPasswordHandler}
                onCancel={rehandleCancelHandler}
            >
                <Form name="resetPassword" form={prform}>
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                label="新密码"
                                name="password"
                                rules={[{required: true, message: '密码不能为空'}]}
                            >
                                <Input placeholder="输入新密码"/>
                            </Form.Item>
                            <Form.Item hidden label="用户ID" name="userId" initialValue={0}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                title={`${modal.title}职员`}
                open={modal.visible}
                width={600}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                onOk={onSave}
                onCancel={handleCancel}
            >
                <Form name="Staff" form={form}>
                    <Form.Item hidden {...formItemLayout} label="角色ID" name="userId" initialValue={0}>
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        hidden
                        {...{
                            labelCol: {
                                sm: {span: 8},
                            },
                            wrapperCol: {
                                sm: {span: 16},
                            },
                        }}
                        label="用户账号"
                        name="username"
                        rules={[{required: true, message: '用户账号不能为空'}]}
                    >
                        <Input placeholder="用户账号"/>
                    </Form.Item>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...{
                                    labelCol: {
                                        sm: {span: 8},
                                    },
                                    wrapperCol: {
                                        sm: {span: 16},
                                    },
                                }}
                                label="用户昵称"
                                name="nickName"
                                rules={[{required: true, message: '用户昵称不能为空'}]}
                            >
                                <Input placeholder="用户昵称"/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...{
                                    labelCol: {
                                        sm: {span: 8},
                                    },
                                    wrapperCol: {
                                        sm: {span: 16},
                                    },
                                }}
                                label="归属部门"
                                name="deptId"
                                rules={[{required: true, message: '归属部门不能为空'}]}
                            >
                                <TreeSelect showSearch treeLine treeNodeFilterProp="title" treeData={DEPTS}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...{
                                    labelCol: {
                                        sm: {span: 8},
                                    },
                                    wrapperCol: {
                                        sm: {span: 16},
                                    },
                                }}
                                label="手机号码"
                                name="phonenumber"
                                rules={[{required: true, message: '手机号码不能为空'}]}
                            >
                                <Input placeholder="手机号码"/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...{
                                    labelCol: {
                                        sm: {span: 8},
                                    },
                                    wrapperCol: {
                                        sm: {span: 16},
                                    },
                                }}
                                label="邮箱"
                                name="email"
                                rules={[{required: true, message: '邮箱不能为空'}]}
                            >
                                <Input placeholder="邮箱"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    {modal.modelType === 'POST' && (
                        <Row>
                            <Col sm={12} xs={24}>
                                <Form.Item
                                    {...{
                                        labelCol: {
                                            sm: {span: 8},
                                        },
                                        wrapperCol: {
                                            sm: {span: 16},
                                        },
                                    }}
                                    label="登录账号"
                                    name="username"
                                    rules={[{required: true, message: '登录账号不能为空'}]}
                                >
                                    <Input placeholder="登录账号"/>
                                </Form.Item>
                            </Col>

                            <Col sm={12} xs={24}>
                                <Form.Item
                                    {...{
                                        labelCol: {
                                            sm: {span: 8},
                                        },
                                        wrapperCol: {
                                            sm: {span: 16},
                                        },
                                    }}
                                    label="用户密码"
                                    name="password"
                                    rules={[{required: true, message: '密码不能为空'}]}
                                >
                                    <Input placeholder="密码"/>
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...{
                                    labelCol: {
                                        sm: {span: 8},
                                    },
                                    wrapperCol: {
                                        sm: {span: 16},
                                    },
                                }}
                                label="用户性别"
                                name="sex"
                                initialValue={'0'}
                                rules={[{required: true, message: '请选择用户性别'}]}
                            >
                                <Select>
                                    <Select.Option value={'0'}>男</Select.Option>
                                    <Select.Option value={'1'}>女</Select.Option>
                                    <Select.Option value={'2'}>保密</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...{
                                    labelCol: {
                                        sm: {span: 8},
                                    },
                                    wrapperCol: {
                                        sm: {span: 16},
                                    },
                                }}
                                label="状态"
                                name="status"
                                initialValue={'0'}
                            >
                                <Radio.Group>
                                    <Radio value={'0'}>正常</Radio>
                                    <Radio value={'1'}>冻结</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...{
                                    labelCol: {
                                        sm: {span: 8},
                                    },
                                    wrapperCol: {
                                        sm: {span: 16},
                                    },
                                }}
                                label="岗位"
                                name="postIds"
                                rules={[{required: true, message: '岗位不能为空'}]}
                            >
                                <TreeSelect treeNodeFilterProp="title" treeCheckable={true} treeData={POSTS}/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...{
                                    labelCol: {
                                        sm: {span: 8},
                                    },
                                    wrapperCol: {
                                        sm: {span: 16},
                                    },
                                }}
                                label="角色"
                                name="roleIds"
                            >
                                <TreeSelect treeNodeFilterProp="title" treeCheckable={true} treeData={ROLES}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item {...formItemLayout} label="备注" name="remark">
                        <TextArea placeholder="请输入内容"/>
                    </Form.Item>
                </Form>
            </Modal>

            <ImportStaff
                visible={importStaffVisible}
                onCancel={() => {
                    setImportStaffVisible(false);
                }}
                ok={() => {
                    acForm.current?.reload();
                }}
            />
        </PageContainer>
    );
};

export default Staff;
