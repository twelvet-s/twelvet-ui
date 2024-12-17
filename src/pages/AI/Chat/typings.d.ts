declare namespace AIChat {

    /**
     *
     */
    type modelDataType = {
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
            }[];
        };
    };
}
