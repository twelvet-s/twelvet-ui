import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';
import { useIntl } from '@umijs/max';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <DefaultFooter
            style={{
                background: 'none',
            }}
            copyright={`${currentYear} TwelveT`}
            links={[
                {
                    key: 'TwelveT',
                    title: 'TwelveT',
                    href: 'https://twelvet.cn',
                    blankTarget: true,
                },
                {
                    key: 'Github',
                    title: <GithubOutlined />,
                    href: 'https://github.com/twelvet-projects/twelvet',
                    blankTarget: true,
                },
                {
                    key: useIntl().formatMessage({ id: 'app.development.documentation' }),
                    title: useIntl().formatMessage({ id: 'app.development.documentation' }),
                    href: 'https://doc.twelvet.cn/',
                    blankTarget: true,
                },
            ]}
        />
    );
};

export default Footer;
