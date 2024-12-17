import {GithubOutlined, HomeOutlined} from '@ant-design/icons'
import {Button, Card, Col, Divider, Row, Tag} from 'antd'
import React from 'react'
import styles from './styles.less'

/**
 * 消息面板
 */
const Panel: React.FC = () => {
    return (
        <Card title="公告">
            <div>
                领取阿里云通用云产品1888优惠券：
                ☛☛
                <a href="https://promotion.aliyun.com/ntms/yunparter/invite.html?userCode=jcjwnfv3" target='_blank'
                   rel="noreferrer">
                    阿里云推广大使
                </a>
                <Divider type='vertical'/>
                <a href="https://www.aliyun.com/1111/new?userCode=jcjwnfv3" target='_blank' rel="noreferrer">
                    服务器秒杀
                </a>
                ☚☚
            </div>
            <Divider/>
            <div>
                腾讯云服务器秒杀区：
                ☛☛
                <a href="https://curl.qcloud.com/cAvXfLWI" target='_blank' rel="noreferrer">
                    新用户优惠券
                </a>
                <Divider type='vertical'/>
                <a href="https://curl.qcloud.com/VrLWYkZI" target='_blank' rel="noreferrer">
                    服务器秒杀
                </a>
                ☚☚
            </div>
            <Divider/>
            <h1>
                TwelveT 微服务
                <Divider type="vertical"/>
                <a target='_blank' href="https://github.com/twelvet-projects/twelvet" rel="noreferrer">
                    <Tag icon={<GithubOutlined/>} color='success'>
                        免费开源
                    </Tag>
                </a>
            </h1>

            <Row gutter={[70, 30]}>
                <Col md={{span: 16}} sm={{span: 24}} xs={{span: 24}}>
                    <p>一款基于Spring Cloud Alibaba的权限管理系统，集成市面上流行库，可以作用为快速开发的一个框架使用。</p>

                    <p>
                        一套以微服务架构的脚手架,使用Spring Cloud Alibaba系列进行架构,学习并了解它将能快速掌握微服务核心基础。
                        此项目是为了减少业务代码的重复轮子,它具有一个系统该有的通用性核心业务代码,无论是微服务还是单体,都是通用的业务
                        但更多的,是为了学习微服务的理念以及开发 您可以使用它进行网站管理后台，网站会员中心，CMS，CRM，OA等待系统的开发,
                        当然,不仅仅是一些小系统,我们可以生产更多的服务模块,不断完善项目。
                    </p>

                    <p>
                        系统初心是为了能够更快地完成业务的需求，带来更好的体验、更多的时间。它将会用于孵化一些实用的功能点。
                        我们希望它们是轻量级，可移植性高的功能插件。
                    </p>
                </Col>

                <Col md={{span: 8}} sm={{span: 24}} xs={{span: 24}}>
                    <h2>技术选型</h2>
                    <Row>
                        <Col md={{span: 16}} sm={{span: 24}} xs={{span: 24}}>
                            <h3>后端技术</h3>
                            <ul style={{padding: 0}}>
                                <li>Spring Boot</li>
                                <li>Spring Authorization Server</li>
                                <li>Spring Cloud Alibaba</li>
                                <li>Nacos</li>
                                <li>RocketMQ</li>
                                <li>...</li>
                            </ul>
                        </Col>

                        <Col md={{span: 8}} sm={{span: 24}} xs={{span: 24}}>
                            <h3>前端技术</h3>
                            <ul style={{padding: 0}}>
                                <li>React</li>
                                <li>Umi</li>
                                <li>Antd</li>
                                <li>Axios</li>
                                <li>...</li>
                            </ul>
                        </Col>
                    </Row>

                    <Row>
                        <Col className={styles.topSpace} xxl={{span: 12}} xl={{span: 24}} xs={{span: 24}}>
                            <a target='_blank' href="https://github.com/twelvet-projects/twelvet" rel="noreferrer">
                                <Button type='primary'>
                                    <GithubOutlined/>
                                    GitHub
                                </Button>
                            </a>
                        </Col>
                        <Col className={styles.topSpace} xxl={{span: 12}} xl={{span: 24}} xs={{span: 24}}>
                            <a target='_blank' href="https://twelvet.cn/" rel="noreferrer">
                                <Button type='default'>
                                    <HomeOutlined/>
                                    官方网站
                                </Button>
                            </a>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>
    )
}

export default Panel
