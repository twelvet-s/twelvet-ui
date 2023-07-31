import React, {useEffect, useState} from 'react'

import {PageContainer} from '@ant-design/pro-components'
import {Card, Col, Row, Space, Tabs} from 'antd'
import {
    FieldTimeOutlined,
    ForkOutlined,
    MailOutlined,
    PhoneOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons'
import {getUserProfile, updateAvatar} from './service'
import UserInfo from './components/UserInfo'
import RestPassword from './components/RestPassword'
import './styles.less'
import Upload from '@/components/TwelveT/Upload'
import {flushSync} from 'react-dom'
import {getCurrentUser, getRouters} from '@/pages/Login/service'
import {useModel} from '@umijs/max'

/**
 * 个人资料设置
 */
const UserSettings: React.FC = () => {

    const {setInitialState} = useModel('@@initialState');

    // 用户信息
    const [userInfo, setUserInfo] = useState<{
        user: {
            nickName: string;
            username: string;
            phonenumber: string;
            email: string;
            createTime: string;
            sex: string;
            dept: {
                deptName: string
            };
            avatar: string
        }
        postGroup: string
        roleGroup: string
    }>({
        user: {
            nickName: '',
            username: '',
            phonenumber: '',
            email: '',
            createTime: '',
            sex: '',
            dept: {
                deptName: ''
            },
            avatar: '',
        },
        postGroup: '',
        roleGroup: ''
    });

    // 获取个人信息
    const getInfo = async () => {
        const {data} = await getUserProfile()

        setUserInfo({
            user: data.user,
            postGroup: data.postGroup,
            roleGroup: data.roleGroup
        })
    }

    useEffect(() => {
        getInfo()
    }, [])

    return (
        <PageContainer>
            <Row gutter={[20, 20]}>
                <Col xl={{span: 8}} xs={{span: 24}}>
                    <Card title="个人信息">
                        <div className="text-center">
                            <Upload
                                name='avatarFile'
                                // 开启图片剪裁
                                imgCrop={true}
                                title='用户头像'
                                maxCount={1}
                                action={updateAvatar}
                                images={[
                                    userInfo.user.avatar
                                ]}
                                // 重新渲染个人信息
                                success={async () => {
                                    const {user = {}, roles, permissions} = await getCurrentUser();
                                    const {data} = await getRouters()
                                    // 更新信息
                                    getInfo()
                                    const userInfo = {
                                        user,
                                        menus: data,
                                        roles,
                                        permissions
                                    }
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
                                }}
                            />
                        </div>

                        <ul className="list-group list-group-striped">
                            <li className="list-group-item">
                                <Space>
                                    <UserOutlined/>
                                    用户名称
                                </Space>

                                <div className="pull-right">{userInfo.user.username}</div>
                            </li>
                            <li className="list-group-item">
                                <Space>
                                    <PhoneOutlined/>
                                    手机号码
                                </Space>
                                <div className="pull-right">{userInfo.user.phonenumber}</div>
                            </li>
                            <li className="list-group-item">
                                <Space>
                                    <MailOutlined/>
                                    用户邮箱
                                </Space>
                                <div className="pull-right">{userInfo.user.email}</div>
                            </li>
                            <li className="list-group-item">
                                <Space>
                                    <ForkOutlined/>
                                    所属部门
                                </Space>
                                {
                                    userInfo.user.dept ? <div
                                        className="pull-right">{userInfo.user.dept.deptName} / {userInfo.postGroup}</div> : ''
                                }

                            </li>
                            <li className="list-group-item">
                                <Space>
                                    <TeamOutlined/>
                                    所属角色
                                </Space>
                                <div className="pull-right">{userInfo.roleGroup}</div>
                            </li>
                            <li className="list-group-item">
                                <Space>
                                    <FieldTimeOutlined/>
                                    创建时间
                                </Space>
                                <div className="pull-right">{userInfo.user.createTime}</div>
                            </li>
                        </ul>
                    </Card>
                </Col>

                <Col xl={{span: 16}} xs={{span: 24}}>
                    <Card title="基本资料">
                        <Tabs
                            defaultActiveKey={`basicInformation`}
                            items={[
                                {
                                    key: 'basicInformation',
                                    label: `基本信息`,
                                    children: (
                                        <UserInfo user={
                                            {
                                                username: userInfo.user.username,
                                                nickName: userInfo.user.nickName,
                                                sex: userInfo.user.sex,
                                            }
                                        }/>
                                    ),
                                },
                                {
                                    key: 'changePassword',
                                    label: `修改密码`,
                                    children: <RestPassword/>,
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </PageContainer>
    );
};

export default UserSettings
