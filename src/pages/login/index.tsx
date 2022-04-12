import {
    GithubOutlined,
    LockOutlined,
    MobileOutlined,
    QqOutlined,
    UserOutlined,
    WechatFilled,
} from '@ant-design/icons';
import { Alert, Space, message, Tabs } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormCaptcha, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, useModel } from 'umi';

import { getFakeCaptcha } from '@/services/twelvet-ui-api/login';

import styles from './index.less';
import { login } from './service';
import { setAuthority } from '@/utils/twelvet';

const LoginMessage: React.FC<{
    content: string;
}> = ({ content }) => (
    <Alert
        style={{
            marginBottom: 24,
        }}
        message={content}
        type="error"
        showIcon
    />
);

const Login: React.FC = () => {
    const [submitting, setSubmitting] = useState(false);
    const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
    const [type, setType] = useState<string>('account');
    const { initialState, setInitialState } = useModel('@@initialState');

    const intl = useIntl();

    /**
     * 获取用户信息
     */
    const fetchUserInfo = async () => {
        const userInfo = await initialState?.fetchUserInfo?.();
        if (userInfo) {
            await setInitialState((s) => ({
                ...s,
                // 用户信息
                currentUser: {
                    user: userInfo.user,
                    menus: userInfo.menus,
                    permissions: userInfo.permissions,
                    roles: userInfo.roles
                }
            }));
        }
    };

    const handleSubmit = async (values: API.LoginParams) => {
        setSubmitting(true);
        try {
            // 登录
            const data = await login({ ...values, type });
            if (data.code === 200) {

                setAuthority(data);

                const defaultloginSuccessMessage = intl.formatMessage({
                    id: 'pages.login.success',
                    defaultMessage: '登录成功！',
                });


                message.success(defaultloginSuccessMessage);

                // 进行获取账号信息
                await fetchUserInfo();

                /** 此方法会跳转到 redirect 参数所在的位置 */
                if (!history) return;
                const { query } = history.location;
                const { redirect } = query as { redirect: string };
                history.push(redirect || '/');
                return;
            }

            message.error(data.msg);
            // 如果失败去设置用户错误信息
            setUserLoginState(data);
        } catch (error) {
            const defaultloginFailureMessage = intl.formatMessage({
                id: 'pages.login.failure',
                defaultMessage: '登录失败，请重试！',
            });

            message.error(defaultloginFailureMessage);
        }
        setSubmitting(false);
    };
    const { status, type: loginType } = userLoginState;

    return (
        <div className={styles.main}>
            <ProForm
                initialValues={{
                    // 是否选择自动登录
                    autoLogin: false,
                    // 默认账号密码
                    username: 'admin',
                    password: 123456
                }}
                submitter={{
                    searchConfig: {
                        submitText: intl.formatMessage({
                            id: 'pages.login.submit',
                            defaultMessage: '登录',
                        }),
                    },
                    render: (_, dom) => dom.pop(),
                    submitButtonProps: {
                        loading: submitting,
                        size: 'large',
                        style: {
                            width: '100%',
                        },
                    },
                }}
                onFinish={async (values) => {
                    handleSubmit(values as API.LoginParams);
                }}
            >
                <Tabs activeKey={type} onChange={setType}>
                    <Tabs.TabPane
                        key="account"
                        tab={intl.formatMessage({
                            id: 'pages.login.accountLogin.tab',
                            defaultMessage: '账户密码登录',
                        })}
                    />
                    <Tabs.TabPane
                        key="mobile"
                        tab={intl.formatMessage({
                            id: 'pages.login.phoneLogin.tab',
                            defaultMessage: '手机号登录',
                        })}
                    />
                </Tabs>

                {status == '400' && loginType === 'account' && (
                    <LoginMessage
                        content={intl.formatMessage({
                            id: 'pages.login.accountLogin.errorMessage',
                            defaultMessage: '账户或密码错误（admin/123456)',
                        })}
                    />
                )}
                {type === 'account' && (
                    <>
                        <ProFormText
                            name="username"
                            fieldProps={{
                                size: 'large',
                                prefix: <UserOutlined className={styles.prefixIcon} />,
                            }}
                            placeholder={intl.formatMessage({
                                id: 'pages.login.username.placeholder',
                                defaultMessage: '用户名: admin or user',
                            })}
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage
                                            id="pages.login.username.required"
                                            defaultMessage="请输入用户名!"
                                        />
                                    ),
                                },
                            ]}
                        />
                        <ProFormText.Password
                            name="password"
                            fieldProps={{
                                size: 'large',
                                prefix: <LockOutlined className={styles.prefixIcon} />,
                            }}
                            placeholder={intl.formatMessage({
                                id: 'pages.login.password.placeholder',
                                defaultMessage: '密码: ant.design',
                            })}
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage
                                            id="pages.login.password.required"
                                            defaultMessage="请输入密码！"
                                        />
                                    ),
                                },
                            ]}
                        />
                    </>
                )}

                {status === '400' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
                {type === 'mobile' && (
                    <>
                        <ProFormText
                            fieldProps={{
                                size: 'large',
                                prefix: <MobileOutlined className={styles.prefixIcon} />,
                            }}
                            name="mobile"
                            placeholder={intl.formatMessage({
                                id: 'pages.login.phoneNumber.placeholder',
                                defaultMessage: '手机号',
                            })}
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage
                                            id="pages.login.phoneNumber.required"
                                            defaultMessage="请输入手机号！"
                                        />
                                    ),
                                },
                                {
                                    pattern: /^1\d{10}$/,
                                    message: (
                                        <FormattedMessage
                                            id="pages.login.phoneNumber.invalid"
                                            defaultMessage="手机号格式错误！"
                                        />
                                    ),
                                },
                            ]}
                        />
                        <ProFormCaptcha
                            fieldProps={{
                                size: 'large',
                                prefix: <LockOutlined className={styles.prefixIcon} />,
                            }}
                            captchaProps={{
                                size: 'large',
                            }}
                            placeholder={intl.formatMessage({
                                id: 'pages.login.captcha.placeholder',
                                defaultMessage: '请输入验证码',
                            })}
                            captchaTextRender={(timing, count) => {
                                if (timing) {
                                    return `${count} ${intl.formatMessage({
                                        id: 'pages.getCaptchaSecondText',
                                        defaultMessage: '获取验证码',
                                    })}`;
                                }
                                return intl.formatMessage({
                                    id: 'pages.login.phoneLogin.getVerificationCode',
                                    defaultMessage: '获取验证码',
                                });
                            }}
                            name="captcha"
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage
                                            id="pages.login.captcha.required"
                                            defaultMessage="请输入验证码！"
                                        />
                                    ),
                                },
                            ]}
                            onGetCaptcha={async (phone) => {
                                const result = await getFakeCaptcha({
                                    phone,
                                });
                                if (result === false) {
                                    return;
                                }
                                message.success('获取验证码成功！验证码为：1234');
                            }}
                        />
                    </>
                )}
                <div
                    style={{
                        marginBottom: 24,
                    }}
                >
                    <ProFormCheckbox noStyle name="autoLogin">
                        <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
                    </ProFormCheckbox>
                    <a
                        style={{
                            float: 'right',
                        }}
                    >
                        <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
                    </a>
                </div>
            </ProForm>
            <Space className={styles.other}>
                <FormattedMessage id="pages.login.loginWith" defaultMessage="其他登录方式" />
                <GithubOutlined className={styles.icon} title='GitHub' />
                <WechatFilled className={styles.icon} title='WeChat' />
                <QqOutlined className={styles.icon} title='QQ' />
            </Space>
        </div>
    );
};

export default Login;
