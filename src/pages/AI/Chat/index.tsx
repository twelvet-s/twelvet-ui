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

    /**
     * 发起SSE请求
     */
    const doSse = () => {

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
    };

    return (
        <PageContainer>
            <Space.Compact style={{ width: '100%' }}>
                <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="输入提问内容"
                ></Input>
                <Button type='primary' onClick={doSse}>Send</Button>
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
