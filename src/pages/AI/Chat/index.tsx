import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Divider, Input, Space } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { sendMessage } from './service';
import Markdown from 'react-markdown';

/**
 * AI助手模块
 */
const AIChat: React.FC = () => {
    const [content, setContent] = useState<string>();
    const [sseData, setSSEData] = useState<string>();

    const sse = () => {
        // const eventSource = new EventSource('http://localhost:8080/ai/chat?q=你好');

        // eventSource.onmessage = (event) => {
        //     // 处理接收到的数据
        //     const json = JSON.parse(event.data)
        //     setSSEData((prevData) => [...prevData, json]); // 更新状态
        //     console.log(`==${new Date()}==`, sseData)
        // };

        // eventSource.onerror = (event) => {
        //     console.error("EventSource failed:", event);
        //     eventSource.close();
        // };

        // const text = `data:{"results":[{"output":{"messageType":"ASSISTANT","metadata":{"finishReason":"","role":"ASSISTANT","id":"20241102182559c1bc73e5277045e0","messageType":"ASSISTANT"},"toolCalls":[],"content":"端"},"metadata":{"finishReason":"","contentFilterMetadata":null}}],"result":{"output":{"messageType":"ASSISTANT","metadata":{"finishReason":"","role":"ASSISTANT","id":"20241102182559c1bc73e5277045e0","messageType":"ASSISTANT"},"toolCalls":[],"content":"端"},"metadata":{"finishReason":"","contentFilterMetadata":null}},"metadata":{"id":"20241102182559c1bc73e5277045e0","model":"glm-4-0520","rateLimit":{"requestsReset":0.0,"tokensLimit":0,"requestsLimit":0,"tokensReset":0.0,"tokensRemaining":0,"requestsRemaining":0},"usage":{"promptTokens":0,"generationTokens":0,"totalTokens":0},"promptMetadata":[],"empty":false}}`
        // if (text.startsWith('data:')) {
        //     const jsonText = text.slice(5).trim();
        //     console.log(jsonText);
        //     if (jsonText) {
        //         const json = JSON.parse(jsonText)
        //         console.log('====json=====', json)
        //     }
        // }

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
    };

    return (
        <PageContainer>
            <Space.Compact style={{ width: '100%' }}>
                <Input
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="输入提问内容"
                ></Input>
                <Button type='primary' onClick={sse}>Send</Button>
            </Space.Compact>

            <Divider />
            {/*<div>{sseData.map((item, i) => item.result.output.content)}</div>*/}
            <Card>
                <Markdown>{sseData}</Markdown>
            </Card>
        </PageContainer>
    );
};

export default AIChat;
