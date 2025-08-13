import {PageContainer} from '@ant-design/pro-components';
import {Button, Card, Col, Flex, Input, message, Row, Skeleton, Spin} from 'antd';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {listKnowledgeQueryDoc, pageQueryDoc, sendMessage} from './service';
import Markdown from 'react-markdown';
import {
    CodeOutlined,
    CopyOutlined,
    GlobalOutlined,
    HistoryOutlined,
    LoadingOutlined,
    MutedFilled,
    OpenAIOutlined,
    PauseOutlined,
    SendOutlined,
    UserOutlined,
} from '@ant-design/icons';
import styles from './styles.less';
import moment from 'moment';
import {useWebSocket} from "@/hooks";

/**
 * AI助手模块
 */
const AIChat: React.FC = () => {

    // 聊天内容框
    const chatListCtnRef = useRef<HTMLDivElement | null>(null);

    /**
     * 是否全局加载中
     */
    const [loading, setLoading] = useState<boolean>(true);

    // 聊天选择参数
    const [chatOptions, setChatOptions] = useState<AIChat.ChatOptionsType>({
        knowledgeId: undefined,
        chatType: 'TEXT',
        carryContextFlag: false,
        internetFlag: false,
        voicePlayFlag: false,
    });

    // 是否处于处理数据中
    const [processingDataFlag, setProcessingDataFlag] = useState<boolean>(false);

    // 当前请求的控制器，用于停止输出
    const [currentController, setCurrentController] = useState<AbortController | null>(null);

    // 是否已经开始接收响应（用于控制是否允许停止输出）
    const [hasReceivedResponse, setHasReceivedResponse] = useState<boolean>(false);

    // 输入内容，准备发送sse内容
    const [content, setContent] = useState<string>('');

    // 对应知识库消息列表
    const [knowledgeData, setKnowledgeData] = useState<AIChat.KnowledgeDataType>({});

    // 当前使用的知识库
    //const [knowledgeId, setKnowledgeId] = useState<number>();

    // 知识库列表
    const [knowledgeList, setKnowledgeList] = useState<
        {
            knowledgeId: number;
            knowledgeName: string;
        }[]
    >([]);

    // 分页信息状态 - 为每个知识库维护分页信息
    const [paginationInfo, setPaginationInfo] = useState<{
        [knowledgeId: number]: {
            current: number;
            hasMore: boolean;
            loading: boolean;
        };
    }>({});

    // 防抖定时器
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 储存每一个div控制，用于获取value
    const chatDataRefs = useRef<(HTMLDivElement | null)[]>([]);

    // 音频播放控制相关的引用
    const audioControlRefs = useRef<{
        [messageIndex: number]: {
            audioContext?: AudioContext;
            source?: AudioBufferSourceNode;
            intervalId?: NodeJS.Timeout;
        };
    }>({});

    // 正在播放的聊天索引
    const [playIndex, setPlayIndex] = useState<number>();

    /**
     * 初始化数据
     */
    const initData = async () => {
        // 获取所有知识库
        const {code, msg, data} = await listKnowledgeQueryDoc({});
        if (code !== 200) {
            return message.error(msg);
        }
        if (data.length === 0) {
            return message.warning('知识库为空，请先进行创建再来对话吧~');
        }

        const knowledgeDataList: {
            knowledgeId: number;
            knowledgeName: string;
        }[] = [];
        const chatDataListTemp: AIChat.KnowledgeDataType = {};
        for (let knowledge of data) {
            knowledgeDataList.push({
                knowledgeId: knowledge.knowledgeId,
                knowledgeName: knowledge.knowledgeName,
            });

            // 初始化数据
            chatDataListTemp[knowledge.knowledgeId] = {
                chatDataList: [],
            };
        }
        // 默认使用第一个知识库
        setChatOptions((prevData) => {
            const newData = {...prevData};
            newData.knowledgeId = knowledgeDataList[0]?.knowledgeId;
            return newData;
        });

        // 设置初始化聊天信息
        setKnowledgeData(chatDataListTemp);
        setKnowledgeList(knowledgeDataList);

        // 初始化消息计数器
        if (knowledgeDataList.length > 0) {
            const firstKnowledgeId = knowledgeDataList[0].knowledgeId;
            messageCountRef.current = chatDataListTemp[firstKnowledgeId]?.chatDataList.length || 0;
        }

        // 初始化分页信息
        const paginationTemp: {
            [knowledgeId: number]: {
                current: number;
                hasMore: boolean;
                loading: boolean;
            };
        } = {};
        for (let knowledge of data) {
            paginationTemp[knowledge.knowledgeId] = {
                current: 1,
                hasMore: true,
                loading: false,
            };
        }
        setPaginationInfo(paginationTemp);
    };

    /**
     * 播放语音
     */
    const playBinaryVoice = useCallback((index: number, audio: string) => {
        // 设置为正在播放中
        setKnowledgeData((prevData) => {
            const newData = {...prevData};
            const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

            const aiContent = newChatDataList[index];
            aiContent.voicePlay = 'playing';
            newChatDataList[index] = aiContent;

            return newData;
        });

        // 解码Base64字符串为二进制数据
        const binaryString = atob(audio); // atob() 用于解码Base64
        const byteArray = new Uint8Array(binaryString.length);

        // 将二进制字符串转换为字节数组
        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }

        // 将字节数组转换为ArrayBuffer
        const arrayBuffer = byteArray.buffer;

        // 如果是音频数据，可以通过AudioContext来播放
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 解码音频数据并播放
        audioContext.decodeAudioData(
            arrayBuffer,
            (audioBuffer) => {
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);

                // 定时检查音频播放的时间
                const intervalId = setInterval(() => {
                    const currentTime = audioContext.currentTime;

                    // 检查当前时间是否跨越了下一个字/词的时间段
                    // if (currentIndex < content.length && (currentTime * 1000) >= textData[currentIndex].beginTime) {
                    //
                    //     // 显示当前字并添加高亮
                    //     const word = textData[currentIndex].text;
                    //     textDisplay.innerHTML += `<span class="highlight">${word}</span>`;
                    //     currentIndex++;
                    // }

                    // 如果音频播放完毕，清除定时器和引用
                    if (currentTime >= audioBuffer.duration) {
                        clearInterval(intervalId);

                        // 清除音频控制引用
                        delete audioControlRefs.current[index];

                        // 重置状态为等待
                        setKnowledgeData((prevData) => {
                            const newData = {...prevData};
                            const newChatDataList = [
                                ...newData[chatOptions!.knowledgeId].chatDataList,
                            ];

                            const aiContent = newChatDataList[index];
                            aiContent.voicePlay = 'wait';
                            newChatDataList[index] = aiContent;

                            return newData;
                        });
                    }
                }, 100); // 每100毫秒检查一次

                // 存储音频控制引用，用于停止播放
                audioControlRefs.current[index] = {
                    audioContext,
                    source,
                    intervalId,
                };

                // 开始播放音频
                source.start(0);

                // 监听音频结束事件
                source.onended = () => {
                    // 清除音频控制引用
                    delete audioControlRefs.current[index];

                    // 重置状态为等待
                    setKnowledgeData((prevData) => {
                        const newData = {...prevData};
                        const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

                        const aiContent = newChatDataList[index];
                        aiContent.voicePlay = 'wait';
                        newChatDataList[index] = aiContent;

                        return newData;
                    });
                };
            },
            (error) => {
                console.error('解码音频失败', error);
                // 解码失败时重置状态
                setKnowledgeData((prevData) => {
                    const newData = {...prevData};
                    const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

                    const aiContent = newChatDataList[index];
                    aiContent.voicePlay = 'wait';
                    newChatDataList[index] = aiContent;

                    return newData;
                });
            },
        );
    }, [chatOptions])

    /**
     * 链接websocket用于处理长时间的信息
     */
    const websocket = useWebSocket(`/ai/ws`, {
        onMessage: event => {
            try {
                const {audio} = JSON.parse(event.data);
                playBinaryVoice(playIndex, audio)
            } catch (e) {
                console.error('WebSocket Failed to parse message:', event.data);
            }
        }
    });

    /**
     * 加载历史消息
     */
    const loadHistoryMessages = useCallback(
        async (knowledgeId: number) => {
            const currentPagination = paginationInfo[knowledgeId];
            if (!currentPagination || currentPagination.loading || !currentPagination.hasMore) {
                return;
            }

            // 设置加载状态
            setPaginationInfo((prev) => ({
                ...prev,
                [knowledgeId]: {
                    ...prev[knowledgeId],
                    loading: true,
                },
            }));

            try {
                const {code, msg, data} = await pageQueryDoc({
                    knowledgeId,
                    current: currentPagination.current,
                    pageSize: 10, // 每次加载10条历史消息
                });

                if (code !== 200) {
                    message.error(msg);
                    return;
                }

                const historyMessages = data.records || [];
                const pageSize = 10;
                const hasMore = historyMessages.length === pageSize; // 如果返回的数据少于pageSize，说明没有更多数据了

                // 如果没有历史消息，提示用户
                if (historyMessages.length === 0 && currentPagination.current === 1) {
                    message.info('暂无历史消息');
                    setPaginationInfo((prev) => ({
                        ...prev,
                        [knowledgeId]: {
                            ...prev[knowledgeId],
                            hasMore: false,
                            loading: false,
                        },
                    }));
                    return;
                }

                // 转换历史消息格式
                const formattedMessages = historyMessages
                    .map((record: any) => {
                        // 尝试多个可能的内容字段
                        const content =
                            record.content || record.remark || record.message || record.text || '';

                        // 尝试多个可能的用户类型字段
                        const userType =
                            record.createByType || record.userType || record.role || '';
                        const role = userType === 'USER' || userType === 'user' ? 'USER' : 'AI';

                        // 尝试多个可能的时间字段
                        const sendTime = record.createTime || record.sendTime || record.time || '';

                        return {
                            msgId: record.msgId || record.id || '',
                            role,
                            content,
                            sendTime,
                            okFlag: true,
                            voicePlay: 'wait' as const,
                        };
                    })
                    .filter((msg) => msg.content.trim() !== ''); // 过滤掉空内容的消息

                // 获取容器引用
                const container = chatListCtnRef.current;

                // 将历史消息插入到现有消息列表的开头
                setKnowledgeData((prevData) => {
                    const newData = {...prevData};
                    const currentMessages = newData[knowledgeId].chatDataList;
                    newData[knowledgeId].chatDataList = [...formattedMessages, ...currentMessages];
                    return newData;
                });

                // 在下一个渲染周期中，将滚动位置设置到新加载的历史消息的合适位置
                setTimeout(() => {
                    if (container && formattedMessages.length > 0) {
                        try {
                            // 方法1: 尝试使用DOM元素的实际位置
                            const targetMessageIndex = Math.max(0, formattedMessages.length - 3); // 显示倒数第3条新消息
                            const targetElement = container.querySelector(
                                `#message-${targetMessageIndex}`,
                            );

                            if (targetElement) {
                                // 使用实际DOM元素位置
                                targetElement.scrollIntoView({
                                    behavior: 'auto',
                                    block: 'start',
                                });
                            } else {
                                // 备用方法: 使用估算高度
                                const estimatedMessageHeight = 120;
                                const visibleMessages = Math.min(3, formattedMessages.length);
                                const scrollToPosition = Math.max(
                                    0,
                                    (formattedMessages.length - visibleMessages) *
                                    estimatedMessageHeight,
                                );
                                container.scrollTop = scrollToPosition;
                            }
                        } catch (error) {
                            console.error('滚动定位失败:', error);
                        }
                    }
                }, 200); // 延长时间确保DOM完全更新

                // 更新分页信息
                setPaginationInfo((prev) => ({
                    ...prev,
                    [knowledgeId]: {
                        current: prev[knowledgeId].current + 1,
                        hasMore,
                        loading: false,
                    },
                }));
            } catch (error) {
                console.error('加载历史消息失败:', error);
                message.error('加载历史消息失败');

                // 重置加载状态
                setPaginationInfo((prev) => ({
                    ...prev,
                    [knowledgeId]: {
                        ...prev[knowledgeId],
                        loading: false,
                    },
                }));
            }
        },
        [paginationInfo],
    );

    /**
     * 处理鼠标滚轮事件
     */
    const handleWheel = useCallback(
        (event: WheelEvent) => {
            if (!chatListCtnRef.current || chatOptions.knowledgeId === undefined) {
                return;
            }

            const container = chatListCtnRef.current;
            const scrollTop = container.scrollTop;
            const deltaY = event.deltaY;
            const currentPagination = paginationInfo[chatOptions.knowledgeId];

            // 只有向上滚动（deltaY < 0）时才处理
            if (deltaY < 0) {
                // 如果滚动到顶部（scrollTop <= 10）
                if (scrollTop <= 10) {
                    // 如果没有更多数据，不做任何操作（UI会显示提示）
                    if (currentPagination && !currentPagination.hasMore) {
                        return;
                    }

                    // 如果正在加载中，不重复请求
                    if (currentPagination && currentPagination.loading) {
                        return;
                    }

                    // 清除之前的定时器
                    if (scrollTimeoutRef.current) {
                        clearTimeout(scrollTimeoutRef.current);
                    }

                    // 防抖处理，避免频繁请求
                    scrollTimeoutRef.current = setTimeout(() => {
                        loadHistoryMessages(chatOptions.knowledgeId!);
                    }, 150);
                }
            }
        },
        [chatOptions.knowledgeId, loadHistoryMessages, paginationInfo],
    );

    // 用于跟踪消息数量变化的引用
    const messageCountRef = useRef<number>(0);

    /**
     * 初始化数据
     */
    useEffect(() => {
        initData().then(() => {
            // 取消全局加载中
            setLoading(false);
        });
    }, []);

    /**
     * 需要时刻保持在底部（仅在新消息时）
     */
    useEffect(() => {
        if (!loading && chatOptions.knowledgeId !== undefined) {
            const currentMessages = knowledgeData[chatOptions.knowledgeId]?.chatDataList || [];
            const currentMessageCount = currentMessages.length;

            // 只有在消息数量增加时才自动滚动到底部
            if (currentMessageCount > messageCountRef.current) {
                messageCountRef.current = currentMessageCount;

                // 延迟滚动，确保DOM更新完成
                setTimeout(() => {
                    if (chatListCtnRef.current) {
                        chatListCtnRef.current.scrollTop = chatListCtnRef.current.scrollHeight;
                    }
                }, 100);
            } else {
                // 更新消息数量引用，但不滚动
                messageCountRef.current = currentMessageCount;
            }
        }
    }, [knowledgeData, loading, chatOptions.knowledgeId]);

    /**
     * 添加鼠标滚轮事件监听
     */
    useEffect(() => {
        const container = chatListCtnRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, {passive: false});
            return () => {
                container.removeEventListener('wheel', handleWheel);
                // 清理定时器
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }
            };
        }
    }, [handleWheel]);

    /**
     * 组件卸载时清理所有音频播放和停止当前请求
     */
    useEffect(() => {
        return () => {
            // 停止所有正在播放的音频（不更新状态，因为组件即将卸载）
            Object.keys(audioControlRefs.current).forEach((indexStr) => {
                const index = parseInt(indexStr);
                stopTTSContent(index, false);
            });

            // 停止当前请求
            if (currentController) {
                currentController.abort();
            }
        };
    }, [currentController]);

    /**
     * 停止输出
     */
    const stopOutput = () => {
        if (currentController && hasReceivedResponse) {
            currentController.abort();
            setCurrentController(null);
            setProcessingDataFlag(false);
            setHasReceivedResponse(false);
            message.info('已停止输出');
        }
    };

    /**
     * 发起SSE请求
     */
    const doSse = async () => {
        if (chatOptions.knowledgeId === undefined) {
            message.error('请选择一个知识库进行提问');
            return;
        }

        // 数据处理中，跳出
        if (processingDataFlag) {
            return;
        }

        // 如果处于处理数据中，或发送内容为空忽略
        if (content.trim().length === 0) {
            message.warning('问题不能为空');
            return;
        }

        // 数据处理中
        setProcessingDataFlag(!processingDataFlag);

        // 重置响应状态
        setHasReceivedResponse(false);

        // 停止所有正在播放的语音
        stopAllTTSContent();

        // 用户输入
        const userChat = {
            role: 'USER',
            content,
            sendTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            okFlag: true,
        };

        // AI回复（插入等待，有回复替换）
        const aiChat = {
            role: 'AI',
            okFlag: false,
        };

        // 重新赋值数据
        setKnowledgeData((prevData) => {
            const newData = {...prevData};
            const newChatDataList = newData[chatOptions!.knowledgeId].chatDataList;

            newData[chatOptions!.knowledgeId].chatDataList = [...newChatDataList, userChat, aiChat];
            return newData;
        });

        const sendData = {
            knowledgeId: chatOptions.knowledgeId,
            chatType: chatOptions.chatType,
            content: content,
            // 是否携带上下文
            carryContextFlag: chatOptions.carryContextFlag,
            internetFlag: chatOptions.internetFlag,
        };
        // 清空输入
        setContent('');

        const controller = await sendMessage(
            sendData,
            (value) => {
                // 标记已经开始接收响应
                setHasReceivedResponse(true);

                // 无论是否开启语音播报，都需要显示文字内容
                setKnowledgeData((prevData) => {
                    const newData = {...prevData};
                    const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

                    const aiContent = newChatDataList[newChatDataList.length - 1];
                    // 插入数据
                    if (aiContent.content !== undefined) {
                        aiContent.content += value.content;
                    } else {
                        aiContent.msgId = value.msgId;
                        aiContent.sendTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        aiContent.content = value.content;
                    }
                    newChatDataList[newChatDataList.length - 1] = aiContent;
                    return newData;
                });
            },
            () => {
                // 完成输出显示工具
                setKnowledgeData((prevData) => {
                    const newData = {...prevData};
                    const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

                    const aiContent = newChatDataList[newChatDataList.length - 1];
                    aiContent.okFlag = true;
                    aiContent.voicePlay = 'wait';
                    newChatDataList[newChatDataList.length - 1] = aiContent;

                    return newData;
                });

                // 如果开启了自动语音播报，则自动调用语音播放
                if (chatOptions.voicePlayFlag) {
                    // 延迟一小段时间确保状态更新和DOM渲染完成，然后自动播放语音
                    setTimeout(() => {
                        // 重新获取最新的消息列表长度，确定最新AI消息的索引
                        setKnowledgeData((currentData) => {
                            const currentKnowledgeData = currentData[chatOptions.knowledgeId!];
                            const messageIndex = currentKnowledgeData.chatDataList.length - 1;

                            // 确保是AI消息且内容存在才进行语音播放
                            const lastMessage = currentKnowledgeData.chatDataList[messageIndex];
                            if (
                                lastMessage &&
                                lastMessage.role === 'AI' &&
                                lastMessage.content &&
                                lastMessage.okFlag
                            ) {
                                tTSContent(messageIndex);
                            }

                            return currentData; // 不修改状态，只是为了获取最新数据
                        });
                    }, 200);
                }

                // 清除控制器引用并关闭处理数据中
                setCurrentController(null);
                setProcessingDataFlag(false);
                setHasReceivedResponse(false);
            },
            () => {
                // 发生错误关闭处理中状态
                setCurrentController(null);
                setProcessingDataFlag(false);
                setHasReceivedResponse(false);
            },
        );

        // 保存控制器引用，用于停止输出
        setCurrentController(controller);
    };

    /**
     * 停止TTS语音播报
     * @param index 消息索引
     * @param updateState 是否更新状态，默认为true
     */
    const stopTTSContent = (index: number, updateState: boolean = true) => {
        const audioControl = audioControlRefs.current[index];
        if (audioControl) {
            // 停止音频播放
            if (audioControl.source) {
                try {
                    audioControl.source.stop();
                } catch (error) {
                    // 如果已经停止，忽略错误
                    console.log('Audio source already stopped');
                }
            }

            // 关闭音频上下文
            if (audioControl.audioContext) {
                try {
                    audioControl.audioContext.close();
                } catch (error) {
                    console.log('AudioContext already closed');
                }
            }

            // 清除定时器
            if (audioControl.intervalId) {
                clearInterval(audioControl.intervalId);
            }

            // 清除引用
            delete audioControlRefs.current[index];
        }

        // 重置语音播放状态为等待（如果需要更新状态）
        if (updateState) {
            setKnowledgeData((prevData) => {
                const newData = {...prevData};
                const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

                const aiContent = newChatDataList[index];
                if (aiContent) {
                    aiContent.voicePlay = 'wait';
                    newChatDataList[index] = aiContent;
                }

                return newData;
            });
        }
    };

    /**
     * 停止所有正在播放的语音
     */
    const stopAllTTSContent = () => {
        // 批量停止所有音频，但不立即更新状态
        const playingIndexes = Object.keys(audioControlRefs.current).map((indexStr) =>
            parseInt(indexStr),
        );

        playingIndexes.forEach((index) => {
            stopTTSContent(index, false); // 不更新状态
        });

        // 批量更新所有相关消息的状态
        if (playingIndexes.length > 0) {
            setKnowledgeData((prevData) => {
                const newData = {...prevData};
                const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

                playingIndexes.forEach((index) => {
                    const aiContent = newChatDataList[index];
                    if (aiContent) {
                        aiContent.voicePlay = 'wait';
                        newChatDataList[index] = aiContent;
                    }
                });

                return newData;
            });
        }
    };

    /**
     * TTS文字转语音播报
     */
    const tTSContent = async (index: number) => {
        // 检查当前消息的播放状态
        const currentMessage = knowledgeData[chatOptions.knowledgeId!]?.chatDataList[index];

        // 播放前重新设置正在播放的index
        setPlayIndex(() => index)

        // 如果点击的是当前正在播放的消息，则停止播放
        if (currentMessage?.voicePlay === 'playing') {
            stopTTSContent(index);
            return;
        }

        // 停止所有正在播放的语音
        stopAllTTSContent();

        // 开始播放前需要加入转换中状态
        setKnowledgeData((prevData) => {
            const newData = {...prevData};
            const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

            const aiContent = newChatDataList[index];
            aiContent.voicePlay = 'transition';
            newChatDataList[index] = aiContent;

            return newData;
        });

        const content = chatDataRefs.current[index]!.innerText;

        websocket.sendMessage({
            type: "ai",
            tts: {
                content: content,
            }
        })
    };

    /**
     * 复制内容
     */
    const copyContent = (copyData: any) => {
        let copyText;

        if (typeof copyData === `string`) {
            copyText = copyData;
        } else {
            // 获取html中的所有文字
            copyText = chatDataRefs.current[copyData]!.innerText;
        }

        navigator.clipboard
            .writeText(copyText)
            .then(() => {
                message.success('复制成功').then();
            })
            .catch((err) => {
                console.error('复制失败：', err);
                message.error('复制失败').then();
            });
    };

    /**
     * 切换知识库
     * @param knowledgeId 知识库ID
     */
    const changeknowledge = (knowledgeId: number) => {
        // 清除之前的定时器
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
        }

        // 停止所有正在播放的语音
        stopAllTTSContent();

        setChatOptions((prevData) => {
            const newData = {...prevData};
            newData.knowledgeId = knowledgeId;
            return newData;
        });

        // 重置消息计数器
        const newKnowledgeMessages = knowledgeData[knowledgeId]?.chatDataList || [];
        messageCountRef.current = newKnowledgeMessages.length;

        // 重置当前知识库的分页信息
        setPaginationInfo((prev) => ({
            ...prev,
            [knowledgeId]: {
                current: 1,
                hasMore: true,
                loading: false,
            },
        }));
    };

    return (
        <PageContainer>
            <Card>
                {loading ? (
                    <Skeleton active/>
                ) : (
                    <Row className={styles.ctn}>
                        <Col
                            xs={{span: 0}}
                            sm={{span: 0}}
                            md={{span: 0}}
                            lg={{span: 0}}
                            xxl={{span: 3}}
                            className={styles.autoHeight}
                        >
                            <ul className={styles.knowledgeCtn}>
                                {knowledgeList.map((knowledgeItem, index) => (
                                    <li
                                        onClick={() => changeknowledge(knowledgeItem.knowledgeId)}
                                        className={`${styles.knowledgeItem} ${
                                            chatOptions!.knowledgeId === knowledgeItem.knowledgeId
                                                ? styles.knowledgeItemActive
                                                : ''
                                        }`}
                                        key={index}
                                    >
                                        <OpenAIOutlined className={styles.knowledgeItemIcon}/>
                                        <div className={styles.knowledgeItemInfo}>
                                            <p>{knowledgeItem.knowledgeName}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Col>
                        <Col
                            xs={{span: 24}}
                            sm={{span: 24}}
                            md={{span: 24}}
                            lg={{span: 24}}
                            xxl={{span: 21}}
                            className={styles.autoHeight}
                        >
                            <Flex gap={'small'} vertical={true} className={styles.autoHeight}>
                                <Flex vertical={true} className={styles.autoHeight}>
                                    <div ref={chatListCtnRef} className={styles.chatListCtn}>
                                        <div className={styles.maxCtn}>
                                            {/* 历史消息加载指示器 */}
                                            {chatOptions!.knowledgeId !== undefined &&
                                                paginationInfo[chatOptions!.knowledgeId]
                                                    ?.loading && (
                                                    <Spin
                                                        size="small"
                                                        tip="加载历史消息中..."
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            padding: '10px',
                                                        }}
                                                    />
                                                )}

                                            {/* 顶部提示 - 没有更多历史消息 */}
                                            {chatOptions!.knowledgeId !== undefined &&
                                                !paginationInfo[chatOptions!.knowledgeId]
                                                    ?.loading &&
                                                !paginationInfo[chatOptions!.knowledgeId]
                                                    ?.hasMore &&
                                                knowledgeData[chatOptions!.knowledgeId]
                                                    ?.chatDataList.length > 0 && (
                                                    <div className={styles.noMoreMessagesCtn}>
                                                        <span>
                                                            已经到达顶部，没有更多历史消息了
                                                        </span>
                                                    </div>
                                                )}

                                            {chatOptions!.knowledgeId !== undefined &&
                                                knowledgeData[
                                                    chatOptions!.knowledgeId
                                                    ].chatDataList.map((chatData, index) => (
                                                    <>
                                                        <div
                                                            key={
                                                                chatData.msgId ||
                                                                `${chatData.role}-${index}-${chatData.sendTime}`
                                                            }
                                                            id={`message-${index}`}
                                                            className={`
                                                            ${styles.chatInfoCtn}
                                                            ${
                                                                chatData.role === 'USER'
                                                                    ? styles.chatInfoCtnLeft
                                                                    : styles.chatInfoCtnRight
                                                            }
                                                    `}
                                                        >
                                                            {chatData.role === 'USER' ? (
                                                                <UserOutlined
                                                                    className={styles.chatIcon}
                                                                />
                                                            ) : (
                                                                <OpenAIOutlined
                                                                    className={styles.chatIcon}
                                                                />
                                                            )}
                                                            <div className={styles.chatInfo}>
                                                                <div
                                                                    className={styles.chatInfoTime}
                                                                >
                                                                    {chatData.sendTime}
                                                                </div>
                                                                <div
                                                                    ref={(el) =>
                                                                        (chatDataRefs.current[
                                                                            index
                                                                            ] = el)
                                                                    }
                                                                    className={styles.chatInfoDes}
                                                                >
                                                                    {chatData.content ? (
                                                                        <Markdown>
                                                                            {chatData.content}
                                                                        </Markdown>
                                                                    ) : (
                                                                        <span
                                                                            className={
                                                                                styles.chatWaitCursor
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                                {chatData.okFlag &&
                                                                    chatData.role === 'AI' && (
                                                                        <div
                                                                            className={
                                                                                styles.chatInfoToolCtn
                                                                            }
                                                                        >
                                                                            {chatData.voicePlay ===
                                                                            'wait' ? (
                                                                                <MutedFilled
                                                                                    onClick={() => {
                                                                                        tTSContent(
                                                                                            index,
                                                                                        );
                                                                                    }}
                                                                                    className={
                                                                                        styles.chatInfoTool
                                                                                    }
                                                                                    title={
                                                                                        '语音播报'
                                                                                    }
                                                                                />
                                                                            ) : chatData.voicePlay ===
                                                                            'transition' ? (
                                                                                <LoadingOutlined
                                                                                    className={
                                                                                        styles.chatInfoTool
                                                                                    }
                                                                                />
                                                                            ) : (
                                                                                <PauseOutlined
                                                                                    onClick={() => {
                                                                                        stopTTSContent(
                                                                                            index,
                                                                                        );
                                                                                    }}
                                                                                    className={
                                                                                        styles.chatInfoTool
                                                                                    }
                                                                                    title={
                                                                                        '停止播放'
                                                                                    }
                                                                                />
                                                                            )}

                                                                            <CopyOutlined
                                                                                onClick={() =>
                                                                                    copyContent(
                                                                                        index,
                                                                                    )
                                                                                }
                                                                                className={
                                                                                    styles.chatInfoTool
                                                                                }
                                                                                title={'复制文本'}
                                                                            />
                                                                            <CodeOutlined
                                                                                onClick={() =>
                                                                                    copyContent(
                                                                                        chatData!
                                                                                            .content,
                                                                                    )
                                                                                }
                                                                                className={
                                                                                    styles.chatInfoTool
                                                                                }
                                                                                title={'复制md'}
                                                                            />
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </>
                                                ))}
                                        </div>
                                    </div>

                                    {/*全局工具框*/}
                                    <Flex gap="small" className={styles.chatToolCtn}>
                                        <GlobalOutlined
                                            onClick={() => {
                                                if (!chatOptions.internetFlag) {
                                                    message.success('已开启联网搜索').then();
                                                } else {
                                                    message.success('已关闭联网搜索').then();
                                                }
                                                setChatOptions((prevData) => {
                                                    const newData = {...prevData};
                                                    newData.internetFlag = !newData.internetFlag;
                                                    return newData;
                                                });
                                            }}
                                            className={`${styles.chatTool} ${
                                                chatOptions.internetFlag ? styles.enableTool : ''
                                            }`}
                                            title={'开启联网'}
                                        />
                                        <HistoryOutlined
                                            onClick={() => {
                                                if (!chatOptions.carryContextFlag) {
                                                    message
                                                        .success(
                                                            '当前模式下，发送消息会携带之前的聊天记录',
                                                        )
                                                        .then();
                                                } else {
                                                    message
                                                        .success(
                                                            '当前模式下，发送消息不会携带之前的聊天记录',
                                                        )
                                                        .then();
                                                }
                                                setChatOptions((prevData) => {
                                                    const newData = {...prevData};
                                                    newData.carryContextFlag =
                                                        !newData.carryContextFlag;
                                                    return newData;
                                                });
                                            }}
                                            className={`${styles.chatTool} ${
                                                chatOptions.carryContextFlag
                                                    ? styles.enableTool
                                                    : ''
                                            }`}
                                            title={
                                                chatOptions.carryContextFlag
                                                    ? '取消关联上下文'
                                                    : '启用关联上下文'
                                            }
                                        />
                                        <MutedFilled
                                            onClick={() => {
                                                if (!chatOptions.voicePlayFlag) {
                                                    message.success('已开启自动语音播报').then();
                                                } else {
                                                    message.success('已关闭自动语音播报').then();
                                                }
                                                setChatOptions((prevData) => {
                                                    const newData = {...prevData};
                                                    newData.voicePlayFlag = !newData.voicePlayFlag;
                                                    return newData;
                                                });
                                            }}
                                            className={`${styles.chatTool} ${
                                                chatOptions.voicePlayFlag ? styles.enableTool : ''
                                            }`}
                                            title={
                                                chatOptions.voicePlayFlag
                                                    ? '关闭自动语音播报'
                                                    : '开启自动语音播报'
                                            }
                                        />
                                    </Flex>
                                    {/*发送内容框*/}
                                    <Flex
                                        gap="small"
                                        justify={'justify'}
                                        align={'center'}
                                        className={styles.chatCtn}
                                    >
                                        <Input.TextArea
                                            autoSize={{
                                                minRows: 1,
                                                maxRows: 5,
                                            }}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="输入提问内容，Enter回车发送，Shift+Enter回车换行"
                                            onKeyDown={(e) => {
                                                if (e.shiftKey) {
                                                    // 如果按下shift键将不走发送逻辑，允许回车输入
                                                    return;
                                                }

                                                // 回车发送
                                                if (e.key === 'Enter') {
                                                    // 阻止默认的换行行为
                                                    e.preventDefault();
                                                    doSse().then();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={processingDataFlag && hasReceivedResponse ? stopOutput : doSse}
                                            disabled={processingDataFlag && !hasReceivedResponse}
                                            danger={processingDataFlag && hasReceivedResponse}
                                            title={
                                                processingDataFlag && hasReceivedResponse
                                                    ? "停止输出"
                                                    : processingDataFlag
                                                        ? "等待响应中..."
                                                        : "发送提问"
                                            }
                                        >
                                            {processingDataFlag && hasReceivedResponse ? (
                                                <PauseOutlined/>
                                            ) : processingDataFlag ? (
                                                <LoadingOutlined/>
                                            ) : (
                                                <SendOutlined rotate={-45}/>
                                            )}
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Col>
                    </Row>
                )}
            </Card>
        </PageContainer>
    );
};

export default AIChat;
