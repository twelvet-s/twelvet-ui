import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Col, Flex, Input, Row, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { listKnowledgeQueryDoc, sendMessage } from './service';
import Markdown from 'react-markdown';
import {
    CodeOutlined,
    CopyOutlined,
    HistoryOutlined,
    OpenAIOutlined,
    SendOutlined,
    UserOutlined,
} from '@ant-design/icons';
import styles from './styles.less';
import moment from 'moment';

/**
 * AI助手模块
 */
const AIChat: React.FC = () => {
    // 聊天内容框
    const chatListCtnRef = useRef<HTMLDivElement | null>(null);

    // 是否携带上下文
    const [carryContextFlag, setCarryContextFlag] = useState<boolean>(true);

    // 是否处于处理数据中
    const [processingDataFlag, setProcessingDataFlag] = useState<boolean>(false);

    // 输入内容，准备发送sse内容
    const [content, setContent] = useState<string>('');

    const [knowledgeData, setKnowledgeData] = useState<AIChat.knowledgeDataType>({});

    // 当前使用的知识库
    const [knowledgeId, setKnowledgeId] = useState<number>();

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
        const knowledgeDataList = [];
        const chatDataListTemp: AIChat.knowledgeDataType = {};
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
        setKnowledgeId(knowledgeDataList[0].knowledgeId);
        // 设置初始化聊天信息
        setKnowledgeData(chatDataListTemp);
        setKnowledgeList(knowledgeDataList);
    };

    /**
     * 初始化数据
     */
    useEffect(() => {
        initData().then();
    }, []);

    /**
     * 需要时刻保持在底部
     */
    useEffect(() => {
        // 移动到底部
        if (chatListCtnRef!.current!.scrollTop !== chatListCtnRef!.current!.scrollHeight) {
            chatListCtnRef!.current!.scrollTop = chatListCtnRef!.current!.scrollHeight;
        }
    }, [knowledgeData]);

    /**
     * 发起SSE请求
     */
    const doSse = async () => {
        if (knowledgeId === undefined) {
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
            const newChatDataList = newData[knowledgeId].chatDataList;

            newData[knowledgeId].chatDataList = [...newChatDataList, userChat, aiChat];
            return newData;
        });

        const sendData = {
            knowledgeId: knowledgeId,
            content: content,
            // 是否携带上下文
            carryContextFlag,
        };
        // 清空输入
        setContent('');

        await sendMessage(
            sendData,
            (value) => {
                setKnowledgeData((prevData) => {
                    const newData = { ...prevData };
                    const newChatDataList = [...newData[knowledgeId].chatDataList];

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
                    const newChatDataList = [...newData[knowledgeId].chatDataList];

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
        setKnowledgeId(knowledgeId);
    };

    return (
        <PageContainer>
            <Card>
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
                                        knowledgeId === knowledgeItem.knowledgeId ? styles.knowledgeItemActive : ''
                                    }`}
                                    key={index}
                                >
                                    <OpenAIOutlined className={styles.knowledgeItemIcon} />
                                    <div className={styles.knowledgeItemInfo}>
                                        <p>
                                            {knowledgeItem.knowledgeName}
                                        </p>
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
                                        {knowledgeId !== undefined &&
                                            knowledgeData[knowledgeId].chatDataList.map(
                                                (chatData, index) => (
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
                                                ),
                                            )}
                                    </div>
                                </div>

                                {/*全局工具框*/}
                                <Flex gap="small" className={styles.chatToolCtn}>
                                    <HistoryOutlined
                                        onClick={() => {
                                            if (!carryContextFlag) {
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
                                            setCarryContextFlag((prevData) => !prevData);
                                        }}
                                        className={`${styles.chatTool} ${
                                            carryContextFlag ? styles.enableTool : ''
                                        }`}
                                        title={
                                            carryContextFlag ? '取消关联上下文' : '启用关联上下文'
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
            </Card>
        </PageContainer>
    );
};

export default AIChat;
