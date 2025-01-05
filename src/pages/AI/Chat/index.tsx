import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Col, Flex, Input, message, Row, Skeleton, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { listKnowledgeQueryDoc, sendMessage, tts } from './service';
import Markdown from 'react-markdown';
import {
    CodeOutlined,
    CopyOutlined,
    GlobalOutlined,
    HistoryOutlined,
    MutedFilled,
    OpenAIOutlined,
    SendOutlined,
    UserOutlined,
} from '@ant-design/icons';
import styles from './styles.less';
import moment from 'moment';
import { cutParagraphByPunctuation } from '@/utils/twelvet';

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
        carryContextFlag: true,
        internetFlag: false,
    });

    // 是否处于处理数据中
    const [processingDataFlag, setProcessingDataFlag] = useState<boolean>(false);

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

    // 储存每一个div控制，用于获取value
    const chatDataRefs = useRef<(HTMLDivElement | null)[]>([]);

    /**
     * 初始化数据
     */
    const initData = async () => {
        // 获取所有知识库
        const { code, msg, data } = await listKnowledgeQueryDoc({});
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
            const newData = { ...prevData };
            newData.knowledgeId = knowledgeDataList[0]?.knowledgeId;
            return newData;
        });

        // 设置初始化聊天信息
        setKnowledgeData(chatDataListTemp);
        setKnowledgeList(knowledgeDataList);
    };

    /**
     * 初始化数据
     */
    useEffect(() => {
        initData().then(() => {
            // 取消全局加载中
            setLoading(false)
        });
    }, []);

    /**
     * 需要时刻保持在底部
     */
    useEffect(() => {
        // 移动到底部
        if (!loading) {
            if (chatListCtnRef!.current!.scrollTop !== chatListCtnRef!.current!.scrollHeight) {
                chatListCtnRef!.current!.scrollTop = chatListCtnRef!.current!.scrollHeight;
            }
        }
    }, [knowledgeData]);

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
            const newData = { ...prevData };
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

        await sendMessage(
            sendData,
            (value) => {
                setKnowledgeData((prevData) => {
                    const newData = { ...prevData };
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
                    const newData = { ...prevData };
                    const newChatDataList = [...newData[chatOptions!.knowledgeId].chatDataList];

                    const aiContent = newChatDataList[newChatDataList.length - 1];
                    aiContent.okFlag = true;
                    newChatDataList[newChatDataList.length - 1] = aiContent;

                    return newData;
                });

                // 关闭处理数据中
                setProcessingDataFlag((prevData) => !prevData);
            },
        );
    };

    /**
     * TTS文字转语音播报
     */
    const tTSContent = async (index: number) => {
        const content = chatDataRefs.current[index]!.innerText;

        const { code, msg, data } = await tts({
            content,
        });

        if (code !== 200) {
            message.error(msg);
            return;
        }

        // Base64字符串
        const base64Data = data.audio;

        // 解码Base64字符串为二进制数据
        const binaryString = atob(base64Data); // atob() 用于解码Base64
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

                // 开始播放音频
                source.start(0);

                //let currentIndex = 0;

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

                    // 如果音频播放完毕，清除定时器
                    if (currentTime >= audioBuffer.duration) {
                        clearInterval(intervalId);
                    }
                }, 100); // 每100毫秒检查一次
            },
            (error) => {
                console.error('解码音频失败', error);
            },
        );
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
        setChatOptions((prevData) => {
            const newData = { ...prevData };
            newData.knowledgeId = knowledgeId;
            return newData;
        });
    };

    return (
        <PageContainer>
            <Card>
                {loading ? (
                    <Skeleton active />
                ) : (
                    <Row className={styles.ctn}>
                        <Col
                            xs={{ span: 0 }}
                            sm={{ span: 0 }}
                            md={{ span: 0 }}
                            lg={{ span: 0 }}
                            xxl={{ span: 3 }}
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
                                        <OpenAIOutlined className={styles.knowledgeItemIcon} />
                                        <div className={styles.knowledgeItemInfo}>
                                            <p>{knowledgeItem.knowledgeName}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Col>
                        <Col
                            xs={{ span: 24 }}
                            sm={{ span: 24 }}
                            md={{ span: 24 }}
                            lg={{ span: 24 }}
                            xxl={{ span: 21 }}
                            className={styles.autoHeight}
                        >
                            <Flex gap={'small'} vertical={true} className={styles.autoHeight}>
                                <Flex vertical={true} className={styles.autoHeight}>
                                    <div ref={chatListCtnRef} className={styles.chatListCtn}>
                                        <div className={styles.maxCtn}>
                                            {chatOptions!.knowledgeId !== undefined &&
                                                knowledgeData[
                                                    chatOptions!.knowledgeId
                                                ].chatDataList.map((chatData, index) => (
                                                    <>
                                                        <div
                                                            key={index}
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
                                                                            <MutedFilled
                                                                                onClick={() => {
                                                                                    tTSContent(
                                                                                        index,
                                                                                    );
                                                                                }}
                                                                                className={
                                                                                    styles.chatInfoTool
                                                                                }
                                                                                title={'语音播报'}
                                                                            />

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
                                                    const newData = { ...prevData };
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
                                                    const newData = { ...prevData };
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
                                            onClick={doSse}
                                            disabled={processingDataFlag}
                                        >
                                            <SendOutlined rotate={-45} />
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
