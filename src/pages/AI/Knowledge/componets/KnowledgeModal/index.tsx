import React, { useEffect, useState } from 'react';
import { Button, Collapse, Divider, Drawer, Form, Input, InputNumber, message, Slider } from 'antd';
import { system } from '@/utils/twelvet';
import { addKnowledge, updateKnowledge, getKnowledge } from './service';

/**
 * 新增/更新知识库
 */
const KnowledgeModal: React.FC<{
    info: {
        knowledgeId: number;
        visible: boolean;
    };
    onClose: () => void;
}> = (props) => {
    const { info, onClose } = props;

    const [form] = Form.useForm();

    const formItemLayout = {
        labelCol: {
            xs: { span: 2 },
            sm: { span: 2 },
        },
        wrapperCol: {
            xs: { span: 22 },
            sm: { span: 22 },
        },
    };

    // 是否执行Modal数据操作中
    const [loadingModal, setLoadingModal] = useState<boolean>(false);

    // 是否执行Modal数据操作中
    const [loadingDataModal, setLoadingDataModal] = useState<boolean>(false);

    /**
     * 初始化表单数据
     */
    const initKnowledge = () => {
        if (info.knowledgeId !== 0) {
            setLoadingDataModal(true);
            getKnowledge(info.knowledgeId)
                .then((res) => {
                    const { code, msg, data } = res;

                    if (code !== 200) {
                        return message.error(msg);
                    }
                    // 赋值表单数据
                    form.setFieldsValue(data);
                })
                .finally(() => {
                    // 取消数据加载中
                    setLoadingDataModal(false);
                });
        }
    };

    /**
     * 初始化设置表单信息
     */
    useEffect(() => {
        initKnowledge();
    }, [info]);

    /**
     * 取消窗口
     */
    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    /**
     * 保存AI知识库数据
     */
    const onSave = () => {
        form.validateFields()
            .then(async (fields) => {
                try {
                    // 开启加载中
                    setLoadingModal(true);

                    // ID为0则insert，否则将update
                    const { code, msg } =
                        fields.knowledgeId === 0
                            ? await addKnowledge(fields)
                            : await updateKnowledge(fields);
                    if (code !== 200) {
                        return message.error(msg);
                    }

                    message.success(msg);

                    // 关闭
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

    return (
        <Drawer
            title={`${info.knowledgeId !== 0 ? '更新' : '新增'}知识库`}
            width="80%"
            placement="right"
            loading={loadingDataModal}
            closable={false}
            destroyOnClose={true}
            onClose={() => {
                handleCancel();
            }}
            open={info.visible}
            footer={
                <div
                    style={{
                        textAlign: 'right',
                    }}
                >
                    <Button onClick={() => handleCancel()}>取消</Button>
                    <Divider type="vertical" />
                    <Button loading={loadingModal} type="primary" onClick={() => onSave()}>
                        保存
                    </Button>
                </div>
            }
        >
            <Form form={form}>
                <Form.Item
                    hidden
                    {...formItemLayout}
                    label="主键"
                    name="knowledgeId"
                    initialValue={0}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="知识库名称"
                    rules={[{ required: true, message: '知识库名称不能为空' }]}
                    name="knowledgeName"
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="欢迎语"
                    rules={[{ required: true, message: '欢迎语不能为空' }]}
                    name="welcomeMsg"
                >
                    <Input.TextArea rows={5} />
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="会话轮数"
                    rules={[{ required: true, message: '会话轮数不能为空' }]}
                    name="multiRound"
                    initialValue={5}
                >
                    <InputNumber />
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="匹配条数"
                    rules={[{ required: true, message: '匹配条数不能为空' }]}
                    name="topK"
                    initialValue={3}
                >
                    <InputNumber />
                </Form.Item>

                <Form.Item
                    {...formItemLayout}
                    label="排序"
                    rules={[{ required: false, message: '知识库排序不能为空' }]}
                    name="knowledgeSort"
                    initialValue={1}
                >
                    <InputNumber />
                </Form.Item>

                <Collapse
                    items={[
                        {
                            key: 1,
                            label: '高级配置',
                            children: (
                                <>
                                    <Form.Item
                                        {...formItemLayout}
                                        label="匹配率"
                                        rules={[{ required: false, message: '匹配率不能为空' }]}
                                        name="score"
                                        initialValue={0.5}
                                    >
                                        <Slider defaultValue={0.5} min={0} max={1} step={0.01} />
                                    </Form.Item>

                                    <Form.Item
                                        {...formItemLayout}
                                        label="切片值"
                                        rules={[{ required: false, message: '切片值不能为空' }]}
                                        name="sliceSize"
                                        initialValue={3000}
                                    >
                                        <InputNumber />
                                    </Form.Item>
                                </>
                            ),
                        },
                    ]}
                />
            </Form>
        </Drawer>
    );
};

export default KnowledgeModal;
