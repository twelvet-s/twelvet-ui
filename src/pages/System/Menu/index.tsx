import React, {useRef, useState} from 'react';

import {proTableConfigs} from '@/setting';
import {CloseOutlined, createFromIconfontCN, EditOutlined, PlusOutlined} from '@ant-design/icons';
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
import { useIntl } from '@umijs/max';


/**
 * 菜单模块
 */
const Menu: React.FC = () => {
    const {formatMessage} = useIntl()

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    // 菜单数据源
    const [dataSource, setDataSource] = useState<Record<string, any>[]>([]);

    // 显示Modal
    const [modal, setModal] = useState<{ title: string; visible: boolean }>({
        title: ``,
        visible: false,
    });

    // 菜单类型参数设置的显示
    const [menuType, setMenuType] = useState<string>(`M`);
    const acForm = useRef<ActionType>();
    const [form] = Form.useForm();

    // 创建远程Icon
    const IconFont = createFromIconfontCN();

    const formItemLayout = {
        labelCol: {
            sm: {span: 6},
        },
        wrapperCol: {
            sm: {span: 16},
        },
    };

    /**
     * 更新菜单数据(保证菜单数据的最新)
     */
    const putData = async () => {
        try {
            const {code, msg, data} = await list({});
            if (code !== 200) {
                return message.error(msg);
            }

            const children = makeTree({
                dataSource: data,
                id: `menuId`,
                enhance: {
                    key: `menuId`,
                    title: `menuName`,
                    value: `menuId`,
                },
            });

            setDataSource([
                {
                    key: 0,
                    title: `主目录`,
                    value: 0,
                    children,
                },
            ]);
        } catch (e) {
            system.error(e);
        }
    };


    /**
     * 获取新增菜单信息
     * @param row row
     */
    const refPost = async (row: Record<string, any>) => {
        // 更新数据
        putData();

        const field: Record<string, any> = {parentId: row.menuId};
        // 设置表单数据
        form.setFieldsValue(field);
        setModal({title: formatMessage({id: 'system.add'}), visible: true});
    };

    /**
     * 获取修改菜单信息
     * @param row row
     */
    const refPut = async (row: Record<string, any>) => {
        try {
            // 更新菜单数据
            putData();
            const {code, msg, data} = await getInfo(row.menuId);
            if (code !== 200) {
                return message.error(msg);
            }
            // 赋值表单数据
            form.setFieldsValue(data);

            // 设置菜单类型
            setMenuType(data.menuType);

            // 设置Modal状态
            setModal({title: formatMessage({id: 'system.update'}), visible: true});
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 移除菜单
     * @param row row
     */
    const refRemove = async (row: Record<string, any>) => {
        try {
            const {code, msg} = await remove(row.menuId);
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

        setMenuType(`M`);
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
                    // menuId为0则insert，否则将update
                    const {msg} = fields.menuId === 0 ? await insert(fields) : await update(fields);

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
    const columns: ProColumns<SystemMenu.PageListItem>[] = [
        {
            title: '菜单名称',
            fixed: 'left',
            width: 200,
            ellipsis: false,
            valueType: 'text',
            dataIndex: 'menuName',
        },
        {
            title: 'Icon',
            width: 50,
            ellipsis: false,
            valueType: 'text',
            search: false,
            dataIndex: 'icon',
            render: (item) => {
                return item && <IconFont type={item.toString()}/>;
            },
        },
        {
            title: '排序',
            width: 50,
            ellipsis: false,
            valueType: 'text',
            search: false,
            dataIndex: 'orderNum',
        },
        {
            title: '权限标识',
            width: 200,
            search: false,
            dataIndex: 'perms',
        },
        {
            title: '组件路径',
            width: 200,
            search: false,
            dataIndex: 'component',
        },
        {
            title: '状态',
            width: 80,
            ellipsis: false,
            dataIndex: 'status',
            valueEnum: {
                0: {text: '正常', status: 'success'},
                1: {text: '停用', status: 'error'},
            },
        },
        {
            title: '创建时间',
            width: 150,
            valueType: 'dateTime',
            search: false,
            dataIndex: 'createTime',
        },
        {
            title: '操作',
            fixed: 'right',
            width: 280,
            search: false,
            valueType: 'option',
            dataIndex: 'operation',
            render: (_, row) => {
                return (
                    <>
                        {(row.menuType === `M` || row.menuType === `C`) && (
                            <>
                                <a onClick={() => refPost(row)} hidden={auth('system:menu:insert')}>
                                    <Space>
                                        <PlusOutlined/>
                                        {formatMessage({id: 'system.add'})}
                                    </Space>
                                </a>
                                <Divider type="vertical"/>
                            </>
                        )}

                        <a onClick={() => refPut(row)} hidden={auth('system:menu:update')}>
                            <Space>
                                <EditOutlined/>
                                {formatMessage({id: 'system.update'})}
                            </Space>
                        </a>
                        <Divider type="vertical"/>
                        <Popconfirm onConfirm={() => refRemove(row)} title="确定删除吗">
                            <a href="#" hidden={auth('system:menu:remove')}>
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
            <ProTable<SystemMenu.PageListItem, SystemMenu.PageParams>
                {...proTableConfigs}
                actionRef={acForm}
                rowKey="menuId"
                columns={columns}
                // 处理响应的数据
                postData={(postDataSource?: any) => {
                    return makeTree({
                        dataSource: postDataSource,
                        id: 'menuId',
                    });
                }}
                request={list}
                toolBarRender={() => [
                    <Button
                        key={'addTool'}
                        hidden={auth('system:menu:insert')}
                        type="default"
                        onClick={() => refPost({menuId: 0})}
                    >
                        <PlusOutlined />
                        {formatMessage({id: 'system.add'})}
                    </Button>,
                ]}
                pagination={false}
            />

            <Modal
                title={`${modal.title}菜单`}
                width={700}
                open={modal.visible}
                confirmLoading={loadingModal}
                okText={`${modal.title}`}
                onOk={onSave}
                onCancel={handleCancel}
            >
                <Form name="Menu" form={form}>
                    <Form.Item hidden label="菜单ID" name="menuId" initialValue={0}>
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
                        label="上级菜单"
                        name="parentId"
                    >
                        <TreeSelect
                            // 支出搜索
                            showSearch
                            // 根据title进行搜索
                            treeNodeFilterProp="title"
                            dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                            placeholder="上级菜单"
                            treeData={dataSource}
                        />
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
                        label="菜单类型"
                        name="menuType"
                        initialValue="M"
                    >
                        <Radio.Group
                            onChange={(e) => {
                                // 设置菜单状态
                                setMenuType(e.target.value);
                            }}
                        >
                            <Radio value="M">目录</Radio>
                            <Radio value="C">菜单</Radio>
                            <Radio value="F">按钮</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {menuType !== 'F' && (
                        <Form.Item
                            label="菜单图标"
                            name="icon"
                            rules={[{required: true, message: '菜单图标不能为空'}]}
                        >
                            <Input placeholder="菜单图标"/>
                        </Form.Item>
                    )}

                    <Row>
                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="菜单名称"
                                name="menuName"
                                rules={[{required: true, message: '菜单名称不能为空'}]}
                            >
                                <Input placeholder="菜单名称"/>
                            </Form.Item>
                        </Col>

                        <Col sm={12} xs={24}>
                            <Form.Item
                                {...formItemLayout}
                                label="显示排序"
                                name="orderNum"
                                rules={[{required: true, message: '菜单排序不能为空'}]}
                            >
                                <InputNumber placeholder="排序" min={0}/>
                            </Form.Item>
                        </Col>
                    </Row>

                    {menuType !== `F` && (
                        <Row>
                            <Col sm={12} xs={24}>
                                <Form.Item {...formItemLayout} label="是否外链" name="isFrame" initialValue={'1'}>
                                    <Radio.Group>
                                        <Radio value={'0'}>是</Radio>
                                        <Radio value={'1'}>否</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>

                            <Col sm={12} xs={24}>
                                <Form.Item
                                    {...formItemLayout}
                                    label="路由地址"
                                    name="path"
                                    rules={[{required: true, message: '路由地址不能为空'}]}
                                >
                                    <Input placeholder="路由地址"/>
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Row>
                        {menuType === `C` && (
                            <Col sm={12} xs={24}>
                                <Form.Item
                                    {...formItemLayout}
                                    label="组件路径"
                                    name="component"
                                    rules={[{required: true, message: '组件路径不能为空'}]}
                                >
                                    <Input placeholder="组件路径"/>
                                </Form.Item>
                            </Col>
                        )}

                        {menuType !== `M` && (
                            <Col sm={12} xs={24}>
                                <Form.Item
                                    {...formItemLayout}
                                    label="权限标识"
                                    name="perms"
                                    rules={[{required: true, message: '权限标识不能为空'}]}
                                >
                                    <Input placeholder="权限标识"/>
                                </Form.Item>
                            </Col>
                        )}
                    </Row>

                    {menuType !== 'F' && (
                        <Row>
                            <Col sm={12} xs={24}>
                                <Form.Item {...formItemLayout} label="显示状态" name="visible" initialValue={'0'}>
                                    <Radio.Group>
                                        <Radio value={'0'}>是</Radio>
                                        <Radio value={'1'}>否</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>

                            <Col sm={12} xs={24}>
                                <Form.Item {...formItemLayout} label="菜单状态" name="status" initialValue={'0'}>
                                    <Radio.Group>
                                        <Radio value={'0'}>正常</Radio>
                                        <Radio value={'1'}>停用</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default Menu;
