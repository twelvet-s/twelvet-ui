import { PageContainer } from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { useState, useRef, useEffect } from 'react';

/**
 * AI助手模块
 */
const AIChat: React.FC = () => {

    const [sseData, setSSEData] = useState<[]>([]);

    const sse = () => {
        const eventSource = new EventSource('http://localhost:8000/api/ai/chat?q=你好');

        eventSource.onmessage = (event) => {
            // 处理接收到的数据
            const json = JSON.parse(event.data)
            setSSEData((prevData) => [...prevData, json]); // 更新状态 
            console.log(`==${new Date()}==`, sseData)
        };

        eventSource.onerror = (event) => {
            console.error("EventSource failed:", event);
            eventSource.close();
        };
    }

    return (
        <PageContainer>
            <Button onClick={sse}>发起sse</Button>
            <div>
                <h1>SSE Data</h1>
                {
                    sseData.map((item, i) => (
                        item.result.output.content
                    ))
                }
            </div>
        </PageContainer>
    );
};

export default AIChat;
