import {GithubOutlined} from '@ant-design/icons';
import {DefaultFooter} from '@ant-design/pro-components';
import {useIntl} from '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
    const intl = useIntl();
    const defaultMessage = intl.formatMessage({
        id: 'app.copyright.produced',
        defaultMessage: 'TwelveT',
    });

    const currentYear = new Date().getFullYear();

    return (
        <DefaultFooter
            style={{
                background: 'none',
            }}
            copyright={`${currentYear} ${defaultMessage}`}
            links={[
                {
                    key: 'TwelveT',
                    title: 'TwelveT',
                    href: 'https://twelvet.cn',
                    blankTarget: true,
                },
                {
                    key: 'Github',
                    title: <GithubOutlined/>,
                    href: 'https://github.com/twelvet-projects/twelvet',
                    blankTarget: true,
                },
                {
                    key: '开发文档',
                    title: '开发文档',
                    href: 'https://twelvet.cn/docs',
                    blankTarget: true,
                },
            ]}
        />
    );
};

export default Footer;
