import { PageContainer } from '@ant-design/pro-components'
import { Button, Card, Col, Input, List, Row, Space, message } from 'antd'
import React, { useState } from 'react'
import { sendMessage } from './service'
import Markdown from 'react-markdown'
import { SendOutlined } from '@ant-design/icons'

/**
 * AI助手模块
 */
const AIChat: React.FC = () => {
    // 是否处于处理数据中
    const [processingData, setProcessingData] = useState<boolean>(false)
    const [content, setContent] = useState<string>('')
    const [sseData, setSSEData] = useState<string>()

    /**
     * 发起SSE请求
     */
    const doSse = async () => {
        // 如果处于处理数据中，或发送内容为空忽略
        if (content.trim().length === 0) {
            message.warning("问题不能为空")
            return
        }
        if (processingData) {
            return
        }

        // 数据处理中
        setProcessingData(!processingData)
        // 清空上一次回答
        setSSEData('')
        const sendData = {
            modelId: 1,
            content: content,
        }
        // 清空输入
        setContent('')

        await sendMessage(
            sendData,
            (value) => {
                setSSEData((prevData) => prevData + value.content) // 更新状态
            },
            () => {
                setProcessingData(!processingData)
                console.log('结束对话')
            },
        )
    }

    return (
        <PageContainer>
            <Card style={{
                display: 'inline-block',
                width: '100%',
                height: '100%',
            }}>
                <Row>
                    <Col className="gutter-row" span={3}>
                        <List
                            itemLayout="horizontal"
                            dataSource={[
                                {
                                    title: 'Ant Design Title 1',
                                },
                                {
                                    title: 'Ant Design Title 2',
                                },
                                {
                                    title: 'Ant Design Title 3',
                                },
                                {
                                    title: 'Ant Design Title 4',
                                },
                            ]}
                            renderItem={(item, index) => (
                                <List.Item>
                                    {item.title}
                                </List.Item>
                            )}
                        />
                    </Col>
                    <Col className="gutter-row" span={21}>
                        <Row>
                            <Col>
                                <Markdown>{sseData}</Markdown>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input.TextArea
                                        autoSize={true}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="输入提问内容"
                                        onKeyDown={(e) => {
                                            if (e.shiftKey) { // 如果按下shift键将不走发送逻辑，允许回车输入
                                                return
                                            }

                                            // 回车发送
                                            if (e.key === 'Enter') {
                                                // 阻止默认的换行行为
                                                e.preventDefault()
                                                doSse()
                                            }
                                        }}
                                    />
                                    <Button type='primary' onClick={doSse} disabled={processingData}>
                                        <SendOutlined rotate={-45} />
                                    </Button>
                                </Space.Compact>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        </PageContainer>
    )
}

export default AIChat
