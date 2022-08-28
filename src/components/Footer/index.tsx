import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';

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
            href: 'https://www.twelvet.cn',
            blankTarget: true,
        },
        {
            key: 'Github',
            title: <GithubOutlined />,
            href: 'https://gitee.com/twelvet/twelvet',
            blankTarget: true,
        },
        {
            key: '开发文档',
            title: '开发文档',
            href: 'https://www.twelvet.cn/docs',
            blankTarget: true,
        },
    ]}
    />
  );
};

export default Footer;
