import { eventSource, getToken } from '@/utils/twelvet';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { request } from '@umijs/max';

// 请求的控制器名称
const controller = '/ai/chat';

// 对话接口

export interface MessageContent {
    file?: string;
    content: string;
    type: string;
}

export interface Message {
    role: string;
    content: MessageContent;
}

export const sendMessage = async (
    data: {
        modelId: number,
        content: string
    },
    handleMessage: (data: any) => void,
    handleDone: () => void,
): Promise<void> => {
    eventSource('/ai/chat', data, handleMessage, handleDone);
};

// export const sendMessage = async (
//     message: any,
//     handleMessage: (data: any) => void,
//     handleDone: () => void
// ): Promise<void> => {
//
//     const eventSourceUrl = `/ai/chat`
//
//     const controller = new AbortController();
//
//     request(eventSourceUrl, {
//         method: 'POST',
//         headers: {
//             responseType: 'stream',
//             accept: 'text/event-stream', // 设置响应类型为流
//         },
//         data: {
//             ...message
//         }
//     }).then(response => {
//         //console.log('===response=====', response)
//         response.body.on('data', (chunk) => {
//             console.log('Received chunk:', chunk.toString());
//         });
//
//         response.data.on('end', () => {
//             console.log('Stream ended');
//         });
//
//         response.data.on('error', (err) => {
//             console.error('Stream error:', err);
//         });
//     }).catch(e => {
//         console.log('发生错误', e)
//     })
//
//
// }
