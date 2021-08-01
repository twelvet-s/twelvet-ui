import { Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { useModel, SelectLang } from 'umi';
import Avatar from './AvatarDropdown';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
    const { initialState } = useModel('@@initialState');

    if (!initialState || !initialState.settings) {
        return null;
    }

    const { navTheme, layout } = initialState.settings;
    let className = styles.right;

    if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
        className = `${styles.right}  ${styles.dark}`;
    }
    return (
        <Space className={className}>
            <HeaderSearch
                className={`${styles.action} ${styles.search}`}
                placeholder="站内搜索"
                defaultValue="umi ui"
                options={[
                    {
                        label: <a href="//www.twelvet.cn" target='_blank'>TwelveT</a>,
                        value: 'TwelveT',
                    },
                ]}
            // onSearch={value => {
            //   console.log('input', value);
            // }}
            />
            <span
                title='Swagger聚合文档'
                className={styles.action}
                onClick={() => {
                    window.open('/api/doc.html');
                }}
            >
                <QuestionCircleOutlined />
            </span>
            <Avatar />
            <SelectLang className={styles.action} />
        </Space>
    );
};
export default GlobalHeaderRight;
