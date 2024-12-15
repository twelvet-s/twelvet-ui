import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Col, Flex, Input, List, Row, message } from 'antd';
import React, { useRef, useState } from 'react';
import { sendMessage } from './service';
import Markdown from 'react-markdown';
import { CopyOutlined, OpenAIOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import styles from './styles.less';
import moment from 'moment';

/**
 * AI助手模块
 */
const AIChat: React.FC = () => {
    // 聊天内容框
    const chatListCtnRef = useRef<HTMLDivElement | null>(null);

    // 是否处于处理数据中
    const [processingData, setProcessingData] = useState<boolean>(false);

    // 输入内容，准备发送sse内容
    const [content, setContent] = useState<string>('');

    // 聊天列表数据
    const [chatDataList, setChatDataList] = useState<
        {
            role: string;
            content?: string;
            sendTime?: string;
        }[]
    >([]);

    /**
     * 发起SSE请求
     */
    const doSse = async () => {
        // 数据处理中，跳出
        if (processingData) {
            return;
        }

        // 如果处于处理数据中，或发送内容为空忽略
        if (content.trim().length === 0) {
            message.warning('问题不能为空');
            return;
        }

        // 数据处理中
        setProcessingData(!processingData);

        // 用户输入
        const userChat = {
            role: 'USER',
            content,
            sendTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        };

        // AI回复（插入等待，有回复替换）
        const aiChat = {
            role: 'AI',
        };

        setChatDataList((chatDataList) => [...chatDataList, userChat, aiChat]);

        const sendData = {
            modelId: 1,
            content: content,
        };
        // 清空输入
        setContent('');

        await sendMessage(
            sendData,
            (value) => {
                setChatDataList((prevData) => {
                    const newData = [...prevData];
                    const aiContent = newData[newData.length - 1];
                    // 插入数据
                    if (aiContent.content !== undefined) {
                        aiContent.content += value.content;
                    } else {
                        aiContent.sendTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        aiContent.content = value.content;
                    }
                    newData[newData.length - 1] = aiContent;
                    return newData;
                });

                // 移动到底部
                if (chatListCtnRef!.current!.scrollTop !== chatListCtnRef!.current!.scrollHeight) {
                    chatListCtnRef!.current!.scrollTop = chatListCtnRef!.current!.scrollHeight;
                }
            },
            () => {
                // 关闭处理数据中
                setProcessingData((prevData) => !prevData);
            },
        );
    };

    return (
        <PageContainer>
            <Card>
                <Row className={styles.ctn}>
                    <Col span={3} className={styles.autoHeight}>
                        <List
                            className={styles.model}
                            itemLayout="horizontal"
                            dataSource={[
                                {
                                    title: 'Ant Design Title 1',
                                },
                                {
                                    title: 'Ant Design Title 2',
                                },
                                {
                                    title: 'Ant Design Title 3',
                                },
                            ]}
                            renderItem={(item) => <List.Item>{item.title}</List.Item>}
                        />
                    </Col>
                    <Col span={21} className={styles.autoHeight}>
                        <Flex gap={'small'} vertical={true} className={styles.autoHeight}>
                            <Flex vertical={true} className={styles.autoHeight}>
                                <div ref={chatListCtnRef} className={styles.chatListCtn}>
                                    <List
                                        className={styles.model}
                                        itemLayout="horizontal"
                                        split={false}
                                        dataSource={chatDataList}
                                        renderItem={(item) => {
                                            return (
                                                <>
                                                    <div
                                                        className={`
                                                            ${styles.chatInfoCtn}
                                                            ${
                                                                item.role === 'USER'
                                                                    ? styles.chatInfoCtnLeft
                                                                    : styles.chatInfoCtnRight
                                                            }
                                                    `}
                                                    >
                                                        {item.role === 'USER' ? (
                                                            <UserOutlined
                                                                className={styles.chatIcon}
                                                            />
                                                        ) : (
                                                            <OpenAIOutlined
                                                                className={styles.chatIcon}
                                                            />
                                                        )}
                                                        <div className={styles.chatInfo}>
                                                            <div className={styles.chatInfoTime}>
                                                                {item.sendTime}
                                                            </div>
                                                            <div className={styles.chatInfoDes}>
                                                                {item.content ? (
                                                                    <Markdown>
                                                                        {item.content}
                                                                    </Markdown>
                                                                ) : (
                                                                    <span
                                                                        className={
                                                                            styles.chatWaitCursor
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className={styles.chatInfoTool}>
                                                            <CopyOutlined className={styles.chatInfoToolCopy} />
                                                        </div>

                                                    </div>
                                                </>
                                            );
                                        }}
                                    />
                                </div>

                                <Flex
                                    gap="small"
                                    justify={'justify'}
                                    align={'center'}
                                    className={styles.chatCtn}
                                >
                                    <Input.TextArea
                                        autoSize={{
                                            minRows: 1,
                                            maxRows: 50,
                                        }}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="输入提问内容"
                                        onKeyDown={(e) => {
                                            if (e.shiftKey) {
                                                // 如果按下shift键将不走发送逻辑，允许回车输入
                                                return;
                                            }

                                            // 回车发送
                                            if (e.key === 'Enter') {
                                                // 阻止默认的换行行为
                                                e.preventDefault();
                                                doSse();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        onClick={doSse}
                                        disabled={processingData}
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
