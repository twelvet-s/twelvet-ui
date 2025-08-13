import {useState, useRef, useCallback, useEffect} from 'react';
import TWT from "@/setting";
import {getToken} from "@/utils/twelvet";

// WebSocket 连接状态枚举
type WebSocketReadyState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

// WebSocket 事件类型
type WebSocketOpenCallback = (event: WebSocketEventMap['open']) => void;
type WebSocketMessageCallback = (event: WebSocketEventMap['message']) => void;
type WebSocketCloseCallback = (event: WebSocketEventMap['close']) => void;
type WebSocketErrorCallback = (event: WebSocketEventMap['error']) => void;

// useWebSocket 的配置选项接口
interface UseWebSocketOptions {
    /**
     * 连接打开时的回调函数
     * @param event - WebSocket 打开事件
     */
    onOpen?: WebSocketOpenCallback;

    /**
     * 收到消息时的回调函数
     * @param event - WebSocket 消息事件
     */
    onMessage?: WebSocketMessageCallback;

    /**
     * 连接关闭时的回调函数
     * @param event - WebSocket 关闭事件
     */
    onClose?: WebSocketCloseCallback;

    /**
     * 发生错误时的回调函数
     * @param event - WebSocket 错误事件
     */
    onError?: WebSocketErrorCallback;

    /**
     * 心跳间隔时间（毫秒）
     * @default 30000
     */
    heartbeatInterval?: number;

    /**
     * 心跳消息内容（JSON 字符串）
     * @default '{"type": "ping"}'
     */
    heartbeatMessage?: string;

    /**
     * 是否启用自动重连
     * @default true
     */
    autoReconnect?: boolean;

    /**
     * 自动重连的间隔时间（毫秒）
     * @default 5000
     */
    reconnectInterval?: number;
}

// useWebSocket 返回值的接口
interface UseWebSocketReturn {
    /**
     * 当前 WebSocket 连接状态
     */
    readyState: WebSocketReadyState;

    /**
     * 发送消息的方法
     * @param message - 要发送的消息，可以是字符串或可序列化为 JSON 的对象
     */
    sendMessage: (message: string | object) => void;

    /**
     * 手动触发重连的方法
     */
    reconnect: () => void;

    /**
     * 手动断开连接的方法
     */
    disconnect: () => void;
}

/**
 * useWebSocket Hook - 管理 WebSocket 连接
 *
 * @param {string} url - WebSocket 服务器地址
 * @param {UseWebSocketOptions} options - 配置选项
 *
 * @returns {UseWebSocketReturn} 包含连接状态、发送消息方法、手动重连/断开方法的对象
 */
const useWebSocket = (
    url: string,
    options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
    // 解构配置项并设置默认值
    const {
        onOpen = () => {
        },
        onMessage = () => {
        },
        onClose = () => {
        },
        onError = () => {
        },
        heartbeatInterval = 30000, // 30秒
        heartbeatMessage = '{"type": "ping"}',
        autoReconnect = true,
        reconnectInterval = 5000, // 5秒
    } = options;

    const [readyState, setReadyState] = useState<WebSocketReadyState>('CLOSED');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 使用 useRef 来存储最新的回调函数，避免闭包问题
    const onOpenCallback = useRef<WebSocketOpenCallback>(onOpen);
    const onMessageCallback = useRef<WebSocketMessageCallback>(onMessage);
    const onCloseCallback = useRef<WebSocketCloseCallback>(onClose);
    const onErrorCallback = useRef<WebSocketErrorCallback>(onError);

    // 更新回调函数引用
    useEffect(() => {
        onOpenCallback.current = onOpen;
    }, [onOpen]);

    useEffect(() => {
        onMessageCallback.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        onCloseCallback.current = onClose;
    }, [onClose]);

    useEffect(() => {
        onErrorCallback.current = onError;
    }, [onError]);

    /**
     * 清除心跳定时器
     */
    const clearHeartbeat = useCallback(() => {
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
    }, []);

    /**
     * 启动心跳
     */
    const startHeartbeat = useCallback(() => {
        clearHeartbeat();
        heartbeatTimerRef.current = setInterval(() => {
            const ws = wsRef.current;
            if (ws && ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(heartbeatMessage);
                    console.log('发送心跳：', heartbeatMessage);
                } catch (error) {
                    console.error('发送心跳失败：', error);
                    // 发送失败可能意味着连接有问题，可以尝试断开重连
                    ws.close(1006, '心跳失败');
                }
            }
        }, heartbeatInterval);
    }, [heartbeatMessage, heartbeatInterval]);

    /**
     * 重置心跳计时器
     */
    const resetHeartbeat = useCallback(() => {
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            startHeartbeat(); // 重新开始计时
        }
    }, [startHeartbeat]);

    /**
     * 清除所有定时器
     */
    const clearTimers = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        clearHeartbeat();
    }, []);

    /**
     * 发送消息
     * @param {string|object} message - 要发送的消息
     */
    const sendMessage = useCallback((message: string | object) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
            ws.send(messageStr);
            // 发送消息也视为活动
            resetHeartbeat();
        } else {
            console.warn('WebSocket未打开，就绪状态：', readyState);
        }
    }, [readyState, resetHeartbeat]);

    /**
     * 手动断开连接
     */
    const disconnect = useCallback(() => {
        const ws = wsRef.current;
        if (ws) {
            // 清除自动重连定时器
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            // 关闭连接，代码1000表示正常关闭
            ws.close(1000, 'Manual disconnect');
        }
    }, []);

    /**
     * 建立 WebSocket 连接
     */
    const connect = useCallback(() => {
        if (!url) {
            console.error('WebSocket URL是必需的');
            return;
        }

        try {
            const requestUri = TWT.requestUri.endsWith('/') ? TWT.requestUri.slice(0, -1) : TWT.requestUri;
            const ws = new WebSocket(
                `${
                    url?.charAt(0) === '/'
                        ? `${requestUri}${url}`
                        : `${requestUri}/${url}`
                }?access_token=${getToken()}`
            );
            wsRef.current = ws;

            // 设置连接状态
            ws.onopen = (event: WebSocketEventMap['open']) => {
                setReadyState('OPEN');
                console.log('WebSocket已连接');
                onOpenCallback.current(event);

                // 启动心跳
                startHeartbeat();
            };

            ws.onmessage = (event: WebSocketEventMap['message']) => {
                // 接收到任何消息都视为活动，重置心跳计时器
                resetHeartbeat();
                if (event.data && typeof event.data === 'string') { // 如果是心跳回应不继续往下执行
                    try {
                        const {type} = JSON.parse(event.data);
                        if ("pong" === type) {
                            return
                        }
                    } catch (e) {

                    }
                }
                // 执行用户定义的消息处理
                onMessageCallback.current(event);
            };

            ws.onclose = (event: WebSocketEventMap['close']) => {
                setReadyState('CLOSED');
                console.log('WebSocket已断开连接', event);
                // 清除定时器
                clearTimers();
                onCloseCallback.current(event);

                // 如果配置了自动重连且不是正常关闭（代码1000），则尝试重连
                if (autoReconnect && event.code !== 1000) {
                    reconnectTimerRef.current = setTimeout(() => {
                        console.log('正在尝试重新连接...');
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.onerror = (event: WebSocketEventMap['error']) => {
                console.error('WebSocket错误：', event);
                onErrorCallback.current(event);
                // 错误可能导致连接关闭，由 onclose 处理重连
            };

            setReadyState('CONNECTING');
        } catch (error) {
            console.error('创建WebSocket失败:', error);
            onErrorCallback.current(error as Event); // 类型断言，因为 error 可能不是标准 Event
        }
    }, [url, autoReconnect, reconnectInterval]);

    /**
     * 手动重连
     */
    const reconnect = useCallback(() => {
        const ws = wsRef.current;
        if (ws) {
            // 清除自动重连定时器
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            // 关闭现有连接
            ws.close(1000, '手动重新连接');
        }
        // 立即尝试连接
        connect();
    }, [connect]);

    // 组件挂载时连接
    useEffect(() => {
        connect();

        // 组件卸载时清理
        return () => {
            const ws = wsRef.current;
            if (ws) {
                // 移除事件监听器
                ws.onopen = null;
                ws.onmessage = null;
                ws.onclose = null;
                ws.onerror = null;
                // 如果连接还开着，就关闭它
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                    ws.close(1000, 'websocket组件已卸载');
                }
                console.log("websocket组件已卸载")
            }
            clearTimers();
        };
    }, [connect]); // 依赖 connect 确保 URL 变化时能重新连接

    return {
        readyState,
        sendMessage,
        reconnect,
        disconnect,
    };
};

export default useWebSocket;
