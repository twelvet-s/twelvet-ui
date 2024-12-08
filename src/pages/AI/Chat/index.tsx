import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Divider, Input, Space } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from './service';
import Markdown from 'react-markdown';

/**
 * AI助手模块
 */
const AIChat: React.FC = () => {
    // 是否处于处理数据中
    const [processingData, setProcessingData] = useState<boolean | undefined>(false)
    const [content, setContent] = useState<string>()
    const [sseData, setSSEData] = useState<string>()

    /**
     * 发起SSE请求
     */
    const doSse = () => {
        // 如果处于处理数据中忽略
        if (processingData) {
            return
        }

        try {
            // 数据处理中
            setProcessingData(true)

            // 清空上一次回答
            setSSEData('');

            sendMessage(
                {
                    content: content,
                },
                (value) => {
                    setSSEData((prevData) => prevData + value.content); // 更新状态
                },
                () => {
                    console.log('结束对话');
                },
            );
            // 清空输入
            setContent('')
        } catch (e) {
            console.error('处理聊天失败', e)
        } finally {
            setProcessingData(false)
        }
    };

    return (
        <PageContainer>
            {/*<div>{sseData.map((item, i) => item.result.output.content)}</div>*/}
            <Card>
                <Markdown>{sseData}</Markdown>

                <Space.Compact style={{ width: '100%' }}>
                    <Input.TextArea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="输入提问内容"
                        onKeyDown={(e) => {
                            // 回车发送
                            if (e.key === 'Enter') {
                                doSse()
                            }
                        }}
                    />
                    <Button type='primary' onClick={doSse} disabled={processingData}>Send</Button>
                </Space.Compact>
            </Card>
        </PageContainer>
    );
};

export default AIChat;
