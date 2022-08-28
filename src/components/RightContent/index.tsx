import { QuestionCircleOutlined } from '@ant-design/icons';
import { SelectLang, useModel } from '@umijs/max';
import { Space } from 'antd';
import React from 'react';
import HeaderSearch from '../HeaderSearch';
import Avatar from './AvatarDropdown';
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
            label: <a href="https://www.twelvet.cn/" target={'_blank'} rel="noreferrer">twelvet</a>,
            value: 'twelvet',
          },
        ]}
      // onSearch={value => {
      //   console.log('input', value);
      // }}
      />
      <span
        className={styles.action}
        onClick={() => {
          window.open('http://cloud.twelvet.cn/api/doc.html');
        }}
      >
        <QuestionCircleOutlined />
      </span>
      <Avatar menu />
      <SelectLang className={styles.action} />
    </Space>
  );
};
export default GlobalHeaderRight;
