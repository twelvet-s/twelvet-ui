import React, { useEffect } from 'react';
import { message, Spin } from 'antd';
import { useParams, useSearchParams } from '@@/exports';
import { history, useIntl, useModel } from '@umijs/max';
import { oauth2Login } from '../../Login/service';
import { setAuthority } from '@/utils/twelvet';
import { flushSync } from 'react-dom';

/**
 * 第三方登录
 * @constructor
 */
const OAuth2: React.FC = () => {
    // Query参数
    const [queryParams] = useSearchParams();

    // 路径参数
    const pathParams = useParams();

    const { initialState, setInitialState } = useModel('@@initialState');

    const intl = useIntl();

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

    /**
     * 进行登录
     */
    const login = async () => {
        const code = queryParams.get('code');
        const state = queryParams.get('state');
        const oauth2 = pathParams['oauth2'];

        const data = await oauth2Login({
           code,
           state,
           grant_type: oauth2
       })

        if (data.code === 200) {

            setAuthority(data);

            // 进行获取账号信息
            await fetchUserInfo();

            const defaultloginSuccessMessage = intl.formatMessage({
                id: 'pages.login.success',
                defaultMessage: '登录成功！',
            });


            message.success(defaultloginSuccessMessage);

            /** 此方法会跳转到 redirect 参数所在的位置 */
            const urlParams = new URL(window.location.href).searchParams;
            history.push(urlParams.get('redirect') || '/');
            return;
        }

        message.error(data.msg);
        history.push('/login');
    };

    useEffect(() => {
        login().then();
    });

    return <Spin style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} size="large"  />;
};

export default OAuth2;
