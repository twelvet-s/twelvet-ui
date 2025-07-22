import { Collapse, CollapseProps } from 'antd';
import styles from './styles.less';

/**
 * TwelveT发展史组件
 */
const History = () => {
    const items: CollapseProps['items'] = [
        {
            key: 14,
            label: 'v4.0.0 - 2025-10-01',
            children: (
                <ol>
                    <li>Spring Cloud v2025.0.0</li>
                    <li>支持 Nacos V3.0.0</li>
                    <li>支持 跨库数据权限控制注解</li>
                    <li>大模型视觉分析</li>
                    <li>RAG知识库（LLM、TTS、STT）</li>
                    <li>支持第三方GitHub直接授权登录</li>
                    <li>优化相关逻辑</li>
                    <li>修正已知BUG</li>
                </ol>
            ),
        },
        {
            key: 13,
            label: 'v3.3.0 - 2024-04-31',
            children: (
                <ol>
                    <li>静态/动态化国际化I18n</li>
                    <li>Spring Cloud Alibaba 2023</li>
                    <li>修正已知BUG</li>
                </ol>
            ),
        },
        {
            key: 12,
            label: 'v3.2.0 - 2023-11-23',
            children: (
                <ol>
                    <li>进入JDK 17 历程，兼容JDK 21</li>
                    <li>支持多元化数据库兼容</li>
                    <li>代码生成器动态化</li>
                    <li>加入动态切换数据源</li>
                    <li>优化Redis监控</li>
                </ol>
            ),
        },
        {
            key: 11,
            label: 'v3.0.5 - 2023-7-31',
            children: (
                <ol>
                    <li>即将全面切换JDK 17，预备JDK 21虚拟线程</li>
                    <li>Spring Cloud Alibaba 兼容 Spring Boot3 Releases</li>
                    <li>采用spring-boot-starter-oauth2-authorization-server实现权限</li>
                    <li>JDK 8将停止更新进入维护阶段</li>
                    <li>修复代码生成器，兼容Antd Pro</li>
                    <li>修复已知BUG</li>
                </ol>
            ),
        },
        {
            key: 10,
            label: 'v3.0.0 - 2023-1-22',
            children: (
                <ol>
                    <li>升级Spring Boot3</li>
                    <li>升级JDK最低要求17</li>
                    <li>全新UI Antd Pro V6</li>
                    <li>Nacos2.2.x</li>
                    <li>Spring Cloud Alibaba 2022</li>
                    <li>新增令牌管理</li>
                    <li>全新UI，Antd-Pro V6</li>
                    <li>Umi4</li>
                    <li>修正所有ts警告，全面拥抱ts</li>
                    <li>优化前端登录逻辑兼容</li>
                    <li>升级Nacos到最新版2.2.1</li>
                    <li>升级pom依赖</li>
                    <li>其他细节优化</li>
                </ol>
            ),
        },
        {
            key: 9,
            label: 'v2.6.0 - 2022-7-28',
            children: (
                <ol>
                    <li>替换OAuth2最新依赖OAuth2 Authorization Server</li>
                    <li>升级Srping Boot2.7，做好jdk17大版本升级</li>
                    <li>优化前端登录逻辑兼容</li>
                    <li>新增Nacos源码启动服务，避免需要自行下载</li>
                    <li>OSS接入七牛云储存</li>
                    <li>升级Nacos到最新版2.1.0</li>
                    <li>升级Spring Cloud到最新版2021.0.3</li>
                    <li>网关增加日志Debug</li>
                    <li>其他细节优化</li>
                </ol>
            ),
        },
        {
            key: 8,
            label: 'v2.5.0 - 2022-3-31',
            children: (
                <ol>
                    <li>优化docker-compose一件启动体验</li>
                    <li>新增docker一件启动脚本</li>
                    <li>新增MQ服务</li>
                    <li>新增Netty服务</li>
                    <li>修复首页X轴超出BUG</li>
                    <li>升级nacos到最新版2.0.4</li>
                    <li>升级spring-cloud到最新版2021.0.0</li>
                    <li>升级spring-boot到最新版本2.6.6</li>
                    <li>修改获取缓存信息方式</li>
                    <li>新增分布式锁注解</li>
                    <li>其他细节优化</li>
                </ol>
            ),
        },
        {
            key: 7,
            label: 'v2.0.0 - 2021-10-01',
            children: (
                <ol>
                    <li>jenkins一件打包发布</li>
                    <li>docker-compose启动</li>
                    <li>nacos多环境配置</li>
                    <li>操作日志、访问日志进行权限控制</li>
                    <li>修复request获取失败抛出导致的直接退出</li>
                    <li>支持多企业创建</li>
                    <li>修复部门选择BUG</li>
                    <li>修复已知BUG</li>
                </ol>
            ),
        },
        {
            key: 6,
            label: 'v1.3.0 - 2021-08-13',
            children: (
                <ol>
                    <li>前端UI升级至antdV5</li>
                    <li>更改request使用</li>
                    <li>采用静态路由</li>
                    <li>提升pro体验</li>
                    <li>修复table卡顿BUG</li>
                    <li>新增redis监控面板</li>
                    <li>修复已知BUG</li>
                </ol>
            ),
        },
        {
            key: 5,
            label: 'v1.2.0 - 2021-06-23',
            children: (
                <ol>
                    <li>新增菜单导航栏</li>
                    <li>修复阿里ICON无法显示BUG</li>
                    <li>新增Dockerfile打包参数</li>
                    <li>新增操作日志记录</li>
                    <li>修改文件上传适配器</li>
                    <li>加入使用文档</li>
                    <li>修复已知BUG</li>
                </ol>
            ),
        },
        {
            key: 4,
            label: 'v1.1.0 - 2021-04-07',
            children: (
                <ol>
                    <li>新增代码生成器</li>
                    <li>修复多文件上传无文件时出现的错误响应</li>
                    <li>新增数据字典单选/复选框组件</li>
                    <li>修复服务调用无法获取到客户端IP</li>
                    <li>修复多文件上传出现的404 BUG</li>
                    <li>修改makeTree函数</li>
                    <li>修复部分BUG</li>
                    <li>修改nacos配置参数</li>
                    <li>增加分布式事务</li>
                </ol>
            ),
        },
        {
            key: 3,
            label: 'v1.0.2 - 2021-03-06',
            children: (
                <ol>
                    <li>加入TwelveT icon</li>
                    <li>修复全局layouts驼峰导致的打包敏感BUG</li>
                    <li>优化代码出现的警告,React key优化</li>
                    <li>优化TreeSelect组件出现的value值导致的警告</li>
                    <li>修复多文件上传出现的404 BUG</li>
                    <li>删除无用代码</li>
                    <li>UI优化</li>
                    <li>离线icon支持</li>
                    <li>更新SQL</li>
                </ol>
            ),
        },
        {
            key: 2,
            label: 'v1.0.1 - 2021-02-11',
            children: (
                <ol>
                    <li>TwelveT正式对外发布</li>
                </ol>
            ),
        },
        {
            key: 1,
            label: 'v1.0.0 - 2019-10-27',
            children: (
                <ol>
                    <li>TwelveT正式建立</li>
                </ol>
            ),
        },
    ];

    return <Collapse items={items} defaultActiveKey={[14]} className={styles.historyOl} />;
};

export default History;
