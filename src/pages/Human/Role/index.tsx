import React, {useState, useRef} from 'react';

import {proTableConfigs} from '@/setting';
import RoleStatusSwitch from './components/Switch';
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
    InputNumber,
    Radio,
    Tree,
    TreeSelect,
    Row,
    Col,
    Space,
    Divider,
} from 'antd';
import type {FormInstance} from 'antd/lib/form';
import {
    pageQuery,
    remove,
    exportExcel,
    getByroleId,
    insert,
    update,
    roleMenuTreeSelectByMenuId,
    roleMenuTreeSelect,
    roleDeptTreeSelectByDeptId,
    roleDeptTreeSelect,
} from './service';
import {system, auth} from '@/utils/twelvet';
import {isArray} from 'lodash';
import type {DataNode} from 'antd/lib/tree';
import type {Key} from 'antd/lib/table/interface';
import type {ProColumns, ActionType} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';

/**
 * 角色模块
 */
const Role: React.FC = () => {

    const {formatMessage} = useIntl()

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    const [state] = useState<HumanRole.State>({
        pageSize: 10,
    });

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    const acForm = useRef<ActionType>();

    const formRef = useRef<FormInstance>();

    const [form] = Form.useForm();

    const [menuData, setMenuData] = useState<DataNode[]>();
    const [checkdMenuData, setCheckdMenuData] = useState<Key[]>([]);
    const [finalCheckdMenuData, setFinalCheckdMenuData] = useState<Key[]>([]);

    const [deptData, setDeptData] = useState<DataNode[]>();
    const [checkdDeptData, setCheckdDeptData] = useState<Key[]>([]);

    // 权限范围
    const [dataScope, setDataScope] = useState<string>();

    /**
     * 根据ID获取菜单权限数据
     */
    const getMenuDataById = async (roleId: number) => {
        try {
            const {data} = await roleMenuTreeSelectByMenuId(roleId);

            const {checkedMenus, menus} = data;

            // 显示数据
            const keys: Key[] = [];

            // 最终提交数据
            const finalkeys: Key[] = [];

            // 初始化选中菜单数据
            checkedMenus.map((menu: { menuId: number; menuType: string }) => {
                if (menu.menuType === 'F') {
                    // 显示数据
                    keys.push(menu.menuId);
                }
                // 所有初始化数据都必须提交
                finalkeys.push(menu.menuId);
                return false
            });

            // 初始最终提交数据
            setFinalCheckdMenuData(finalkeys);

            // 显示数据
            setCheckdMenuData(keys);

            // 设置菜单数据
            setMenuData(menus);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 根据Id获取部门数据
     */
    const getDeptDataById = async (roleId: number) => {
        try {
            const {code, msg, data} = await roleDeptTreeSelectByDeptId(roleId);
            if (code !== 200) {
                return message.error(msg);
            }

            setCheckdDeptData(data.checkedKeys);
            setDeptData(data.depts);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 获取菜单权限数据
     */
    const getMenuData = async () => {
        try {
            const {code, msg, data} = await roleMenuTreeSelect();
            if (code !== 200) {
                return message.error(msg);
            }
            setMenuData(data);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 获取部门数据
     */
    const getDeptData = async () => {
        try {
            const {code, msg, data} = await roleDeptTreeSelect();
            if (code !== 200) {
                return message.error(msg);
            }

            setDeptData(data);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 新增角色
     */
    const refPost = async () => {
        // 获取权限数据
        getMenuData();
        getDeptData();
        // 设置数据权限范围
        setDataScope('1');
        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    };

    /**
     * 获取修改角色信息
     * @param roleId
     */
    const refPut = async (roleId: number) => {
        try {
            // 获取权限数据
            getMenuDataById(roleId);
            getDeptDataById(roleId);
            const {code, msg, data} = await getByroleId(roleId);
            if (code !== 200) {
                return message.error(msg);
            }
            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置数据权限范围
            setDataScope(data.dataScope);

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true});
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除角色
     * @param roleIds
     */
    const refRemove = async (roleIds: (string | number)[] | string | undefined) => {
        try {
            if (!roleIds) {
                return true;
            }

            let params;
            if (isArray(roleIds)) {
                params = roleIds.join(',');
            } else {
                params = roleIds;
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
        setModal({title: '', visible: false});

        setCheckdDeptData([]);
        setDeptData([]);

        setCheckdMenuData([]);
        setMenuData([]);

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
                    // 设置菜单权限
                    fields.menuIds = finalCheckdMenuData;
                    // 设置数据权限
                    fields.deptIds = checkdDeptData;

                    // ID为0则insert，否则将update
                    const {code, msg} = fields.roleId === 0 ? await insert(fields) : await update(fields);
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

    const dataScopeOptions = [
        {
            key: '1',
            value: '1',
            title: '全部数据权限',
        },
        {
            key: '2',
            value: '2',
            title: '自定数据权限',
        },
        {
            key: '3',
            value: '3',
            title: '本部门数据权限',
        },
        {
            key: '4',
            value: '4',
            title: '本部门及以下数据权限',
        },
        {
            key: '5',
            value: '5',
            title: '仅本人数据权限',
        },
    ];

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

    // Form参数
    const columns: ProColumns<HumanRole.PageListItem>[] = [
        {
            title: '角色名称',
            ellipsis: true,
            width: 200,
            valueType: 'text',
            dataIndex: 'roleName',
        },
        {
            title: '权限字符',
            width: 200,
            valueType: 'text',
            dataIndex: 'roleKey',
        },
        {
            title: '显示顺序',
            width: 200,
            valueType: 'text',
            search: false,
            dataIndex: 'roleSort',
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
            render: (_, row) => [<RoleStatusSwitch row={row} key={row.roleId}/>],
        },
        {
            title: '创建时间',
            search: false,
            width: 200,
            valueType: 'dateTime',
            dataIndex: 'createTime',
        },
        {
            title: '操作',
            fixed: 'right',
            width: 200,
            valueType: 'option',
            dataIndex: 'operation',
            render: (_, row) => {
                // 不允许操作admin
                return (
                    row.roleKey !== 'admin' && (
                        <>
                            <a onClick={() => refPut(row.roleId)} hidden={auth('system:role:update')}>
                                <Space>
                                    <EditOutlined/>
                                    {formatMessage({id: 'system.update'})}
                                </Space>
                            </a>
                            <Divider type="vertical"/>
                            <Popconfirm onConfirm={() => refRemove([row.roleId])} title="确定删除吗">
                                <a href="#" hidden={auth('system:role:remove')}>
                                    <Space>
                                        <CloseOutlined/>
                                        {formatMessage({id: 'system.delete'})}
                                    </Space>
                                </a>
                            </Popconfirm>
                        </>
                    )
                );
            },
        },
    ];

    return (
        <PageContainer>
            <ProTable<HumanRole.PageListItem, HumanRole.PageParams>
                {...proTableConfigs}
                pagination={{
                    // 是否允许每页大小更改
                    showSizeChanger: true,
                    // 每页显示条数
                    defaultPageSize: state.pageSize,
                }}
                actionRef={acForm}
                formRef={formRef}
                rowKey="roleId"
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
                        key={'addTTool'}
                        type="default"
                        hidden={auth('system:role:insert')}
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
                        <Button type="default">
                            <FundProjectionScreenOutlined/>
                            {formatMessage({id: 'system.export'})}
                        </Button>
                    </Popconfirm>,
                ]}
            />

            <Modal
                title={`${modal.title}角色`}
                open={modal.visible}
                width={700}
                okText={`${modal.title}`}
                confirmLoading={loadingModal}
                onOk={onSave}
                onCancel={handleCancel}
            >
                <Form name="Role" form={form}>
                    <Form.Item hidden {...formItemLayout} label="角色ID" name="roleId" initialValue={0}>
                        <Input/>
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
                                label="角色名称"
                                name="roleName"
                                rules={[{required: true, message: '角色名称不能为空'}]}
                            >
                                <Input placeholder="角色名称"/>
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
                                label="权限字符"
                                name="roleKey"
                                rules={[{required: true, message: '权限字符不能为空'}]}
                            >
                                <Input placeholder="权限字符"/>
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
                                label="角色顺序"
                                name="roleSort"
                                initialValue={0}
                                rules={[{required: true, message: '角色顺序不能为空'}]}
                            >
                                <InputNumber placeholder="角色顺序"/>
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
                                label="角色状态"
                                name="status"
                                initialValue={'0'}
                            >
                                <Radio.Group>
                                    <Radio value={'0'}>正常</Radio>
                                    <Radio value={'1'}>停用</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item {...formItemLayout} label="菜单权限" name="menuIds">
                        <Tree
                            showLine
                            checkable
                            onCheck={(checkedKeys: any, halfChecked: any) => {
                                // 显示在页面的数据
                                setCheckdMenuData(checkedKeys);

                                // 解决无法选中未完全选中时，无法获取父ID
                                const keys = [...checkedKeys, ...halfChecked.halfCheckedKeys];
                                // 最终提交数据需加上父ID
                                setFinalCheckdMenuData(keys);
                            }}
                            // 默认选中的数据
                            checkedKeys={checkdMenuData}
                            treeData={menuData}
                        />
                    </Form.Item>

                    <Form.Item {...formItemLayout} label="权限范围" name="dataScope" initialValue={'1'}>
                        <TreeSelect
                            // 支出搜索
                            showSearch
                            // 根据title进行搜索
                            treeNodeFilterProp="title"
                            treeData={dataScopeOptions}
                            onChange={(v: string) => {
                                setDataScope(v);
                            }}
                        />
                    </Form.Item>

                    {dataScope === '2' && (
                        <Form.Item {...formItemLayout} label="数据权限" name="deptIds">
                            <Tree
                                showLine
                                checkable
                                height={150}
                                onCheck={(checkedKeys: any) => {
                                    setCheckdDeptData(checkedKeys);
                                }}
                                checkedKeys={checkdDeptData}
                                treeData={deptData}
                            />
                        </Form.Item>
                    )}

                    <Form.Item {...formItemLayout} label="备注" name="remark">
                        <TextArea placeholder="请输入内容"/>
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default Role;
