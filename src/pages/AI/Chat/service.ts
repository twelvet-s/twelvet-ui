import { eventSource } from '@/utils/twelvet';
import { request } from '@umijs/max';

// 请求的控制器名称
const controller = '/ai/chat';

/**
 * 查询AI知识库列表
 * @param query 查询参数
 */
export async function listKnowledgeQueryDoc(query: { [key: string]: any }) {
    return request(`/ai/knowledge/list`, {
        method: `get`,
        params: query,
    });
}

/**
 * 查询对应的AI知识库聊天历史记录
 * @param query 查询参数
 */
export async function pageQueryDoc(query: { [key: string]: any }) {
    return request(`${controller}/history/page`, {
        method: `get`,
        params: query,
    });
}

/**
 * TTS
 * @param data 查询参数
 */
export async function tts(data: { [key: string]: any }) {
    return request(`${controller}/tts`, {
        method: `post`,
        data: data,
    });
}

/**
 * 发送SSE请求数据
 * @param data 请求参数
 * @param handleMessage 接受处理
 * @param handleDone 结束处理
 * @param handleError 错误处理
 * @returns AbortController 用于控制停止请求
 */
export const sendMessage = async (
    data: {
        knowledgeId: number;
        content: string;
        carryContextFlag: boolean;
    },
    handleMessage: (data: any) => void,
    handleDone: () => void,
    handleError?: () => void,
): Promise<AbortController> => {
    return eventSource(`${controller}`, data, handleMessage, handleDone, handleError);
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
