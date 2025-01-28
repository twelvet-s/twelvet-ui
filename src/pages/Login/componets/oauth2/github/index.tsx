import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { getAuthorize } from '@/pages/Login/componets/oauth2/service';
import { message } from 'antd';

const useStyles = createStyles(({ token }) => {
    return {
        action: {
            marginLeft: '8px',
            color: 'rgba(0, 0, 0, 0.2)',
            fontSize: '24px',
            verticalAlign: 'middle',
            cursor: 'pointer',
            transition: 'color 0.3s',
            '&:hover': {
                color: token.colorPrimaryActive,
            },
        },
    };
});

const OAuth2LoginGitHub: React.FC = () => {
    const { styles } = useStyles();

    /**
     * 获取授权登录地址
     */
    const doGetGitHubAuthorize = async () => {
        const { code, msg, data } = await getAuthorize('github');
        if (code !== 200) {
            message.error(msg);
            return;
        }
        // 跳转进行登录
        window.location.href = data;
    };

    return (
        <GithubOutlined
            title={"GitHub登录"}
            key="GithubOutlined"
            className={styles.action}
            onClick={doGetGitHubAuthorize}
        />
    );
};

export default OAuth2LoginGitHub;
