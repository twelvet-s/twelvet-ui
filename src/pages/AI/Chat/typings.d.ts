declare namespace AIChat {
    /**
     * 聊天消息配置
     */
    type ChatOptionsType = {
        // 使用的知识库
        knowledgeId?: number;
        // 聊天类型
        chatType: 'TEXT' | 'IMAGES';
        // 是否关联上下文
        carryContextFlag: boolean;
        // 是否开启联网
        internetFlag: boolean;
        // 是否自动语音播报
        voicePlayFlag: boolean;
    };

    /**
     * 知识库数据
     */
    type KnowledgeDataType = {
        [key: number]: {
            chatDataList: {
                // 消息唯一ID
                msgId?: string;
                // 消息归属
                role: string;
                // 消息内容
                content?: string;
                // 发送时间
                sendTime?: string;
                // 是否处理完成
                okFlag: boolean;
                // 是否正在进行语音播报
                voicePlay: 'wait' | 'transition' | 'playing';
            }[];
        };
    };
}
