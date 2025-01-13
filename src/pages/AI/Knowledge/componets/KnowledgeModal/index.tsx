import React from 'react';
import { Drawer, Form, Input, InputNumber } from 'antd';

/**
 * 新增/更新知识库
 */
const KnowledgeModal: React.FC<{
    info: {
        knowledgeId?: number;
        visible: boolean;
    };
    onClose: () => void;
}> = (props) => {
    const { info, onClose } = props;

    const [form] = Form.useForm()

    const formItemLayout = {
        labelCol: {
            xs: { span: 5 },
            sm: { span: 5 },
        },
        wrapperCol: {
            xs: { span: 20 },
            sm: { span: 20 },
        },
    }

    /**
     * 新增AI知识库数据
     */
    const refPost = async () => {
        setModal({ title: formatMessage({ id: 'system.add' }), visible: true })
    }

    /**
     * 获取修改AI知识库信息
     * @param row row
     */
    const refPut = async (row: { [key: string]: any }) => {
        try {
            const { code, msg, data } = await getKnowledge(row.knowledgeId)
            if (code !== 200) {
                return message.error(msg)
            }


            // 赋值表单数据
            form.setFieldsValue(data)

            // 设置Modal状态
            setModal({ title: formatMessage({ id: 'system.update' }), visible: true })

        } catch (e) {
            system.error(e)
        }
    }

    /**
     * 保存AI知识库数据
     */
    const onSave = () => {
        form
            .validateFields()
            .then(
                async (fields) => {
                    try {
                        // 开启加载中
                        setLoadingModal(true)


                        // ID为0则insert，否则将update
                        const {
                            code,
                            msg
                        } = fields.knowledgeId === 0 ? await addKnowledge(fields) : await updateKnowledge(fields)
                        if (code !== 200) {
                            return message.error(msg)
                        }

                        message.success(msg)

                        if (acForm.current) {
                            acForm.current.reload()
                        }

                        // 关闭模态框
                        handleCancel()
                    } catch (e) {
                        system.error(e)
                    } finally {
                        setLoadingModal(false)
                    }
                }).catch(e => {
            system.error(e)
        })
    }

    return (
        <Drawer
            title={`新增知识库`}
            width="80%"
            placement="right"
            closable={false}
            destroyOnClose={true}
            onClose={() => {
                onClose();
            }}
            open={info.visible}
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
                    <Input.TextArea />
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
            </Form>
        </Drawer>
    );
};

export default KnowledgeModal;
