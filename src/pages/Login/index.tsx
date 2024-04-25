import Footer from '@/components/Footer';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
    GithubOutlined,
    LockOutlined,
    MobileOutlined,
    UserOutlined,
    VerifiedOutlined,
    WechatOutlined,
} from '@ant-design/icons';
import {
    CaptFieldRef,
    LoginForm,
    ProFormCaptcha,
    ProFormCheckbox,
    ProFormText,
} from '@ant-design/pro-components';
import { FormattedMessage, history, SelectLang, useIntl, useModel, Helmet } from '@umijs/max';
import { Alert, message, Tabs } from 'antd';
import Settings from '../../../config/defaultSettings';
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { setAuthority } from '@/utils/twelvet';
import { login } from './service';
import { createStyles } from 'antd-style';

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
        lang: {
            width: 42,
            height: 42,
            lineHeight: '42px',
            position: 'fixed',
            right: 16,
            borderRadius: token.borderRadius,
            ':hover': {
                backgroundColor: token.colorBgTextHover,
            },
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'auto',
            backgroundImage:
                "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
            backgroundSize: '100% 100%',
        },
    };
});

const ActionIcons = () => {
    const { styles } = useStyles();

    return (
        <>
            <GithubOutlined key="GithubOutlined" className={styles.action} />
            <WechatOutlined key="WechatOutlined" className={styles.action} />
        </>
    );
};

const Lang = () => {
    const { styles } = useStyles();

    return (
        <div className={styles.lang} data-lang>
            {SelectLang && <SelectLang />}
        </div>
    );
};

const LoginMessage: React.FC<{
    content: string;
}> = ({ content }) => {
    return (
        <Alert
            style={{
                marginBottom: 24,
            }}
            message={content}
            type="error"
            showIcon
        />
    );
};

const Login: React.FC = () => {
    const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
    const [type, setType] = useState<string>('account');
    const { initialState, setInitialState } = useModel('@@initialState');
    const { styles } = useStyles();
    const intl = useIntl();
    const captchaRef = useRef<CaptFieldRef | null | undefined>();
    const [captchPhone, setCaptchPhone] = useState<string>('')

    const fetchUserInfo = async () => {
        const userInfo = await initialState?.fetchUserInfo?.();
        if (userInfo) {
            flushSync(() => {
                setInitialState((s) => ({
                    ...s,
                    // 用户信息
                    currentUser: {
                        user: userInfo.user,
                        menus: userInfo.menus,
                        permissions: userInfo.permissions,
                        roles: userInfo.roles
                    }
                }));
            })
        }
    };

    const handleSubmit = async (values: API.LoginParams) => {
        try {
            if (type === 'account') {
                values.grantType = 'password'
            } else {
                values.grantType = 'sms'
            }
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
                const urlParams = new URL(window.location.href).searchParams;
                history.push(urlParams.get('redirect') || '/');
                return;
            }

            message.error(data.msg);
            // 如果失败去设置用户错误信息
            setUserLoginState(data.msg);
        } catch (error) {
            const defaultloginFailureMessage = intl.formatMessage({
                id: 'pages.login.failure',
                defaultMessage: '登录失败，请重试！',
            });

            message.error(defaultloginFailureMessage);
        }
    };
    const { status, type: loginType } = userLoginState;

    return (
        <div className={styles.container}>
            <Helmet>
                <title>
                    {intl.formatMessage({
                        id: 'menu.login',
                        defaultMessage: '登录页',
                    })}
                    - {Settings.title}
                </title>
            </Helmet>
            <Lang />
            <div
                style={{
                    flex: '1',
                    padding: '32px 0',
                }}
            >
                <LoginForm
                    contentStyle={{
                        minWidth: 280,
                        maxWidth: '75vw',
                    }}
                    logo={<img alt="logo" src="/logo.svg" />}
                    title="TwelveT 微服务"
                    subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
                    initialValues={{
                        autoLogin: true,
                        // 默认账号密码
                        username: 'admin',
                        password: '123456'
                    }}
                    actions={[
                        <FormattedMessage
                            key="loginWith"
                            id="pages.login.loginWith"
                            defaultMessage="其他登录方式"
                        />,
                        <ActionIcons key="icons" />,
                    ]}
                    onFinish={async (values) => {
                        await handleSubmit(values as API.LoginParams);
                    }}
                >
                    <Tabs
                        activeKey={type}
                        onChange={setType}
                        centered
                        items={[
                            {
                                key: 'account',
                                label: intl.formatMessage({
                                    id: 'pages.login.accountLogin.tab',
                                    defaultMessage: '账户密码登录',
                                }),
                            },
                            {
                                key: 'mobile',
                                label: intl.formatMessage({
                                    id: 'pages.login.phoneLogin.tab',
                                    defaultMessage: '手机号登录',
                                }),
                            },
                        ]}
                    />

                    {status === 'error' && loginType === 'account' && (
                        <LoginMessage
                            content={intl.formatMessage({
                                id: 'pages.login.accountLogin.errorMessage',
                                defaultMessage: '账户或密码错误(admin/ant.design)',
                            })}
                        />
                    )}
                    {type === 'account' && (
                        <>
                            <ProFormText
                                name="username"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined />,
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'pages.login.username.placeholder',
                                    defaultMessage: '用户名',
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
                                    prefix: <LockOutlined />,
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'pages.login.password.placeholder',
                                    defaultMessage: '密码',
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

                    {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
                    {type === 'mobile' && (
                        <>
                            <ProFormText
                                fieldProps={{
                                    size: 'large',
                                    prefix: <MobileOutlined />,
                                }}
                                name="mobile"
                                placeholder={`${intl.formatMessage({
                                    id: 'pages.login.phoneNumber.placeholder',
                                    defaultMessage: '手机号',
                                })}(Test：15788888888)`}
                                onChange={(v: any) => {
                                    setCaptchPhone(v.target.value)
                                }}
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
                                        pattern: /^1[3-9]\d{9}$/,
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
                                fieldRef={captchaRef}
                                fieldProps={{
                                    size: 'large',
                                    prefix: <VerifiedOutlined />,
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
                                phoneName="phone"
                                name="code"
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
                                    {
                                        pattern: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{5})$/,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.phoneLogin.errorMessage"
                                                defaultMessage="验证码不正确"
                                            />
                                        ),
                                    },
                                ]}
                                onGetCaptcha={async (phone) => {
                                    const regex = /^1[3-9]\d{9}$/
                                    if(!regex.test(captchPhone)) {
                                        return new Promise((resolve, reject) => {
                                            reject();
                                        })
                                    }
                                    console.log(`手机号码${captchPhone}`)
                                    // const result = await getFakeCaptcha({
                                    //     phone: captchPhone,
                                    // })
                                    // if (!result) {
                                    //     return;
                                    // }
                                    message.success('获取验证码成功！验证码为：1234')
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
                </LoginForm>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
