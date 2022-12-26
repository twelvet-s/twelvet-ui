import { Collapse } from 'antd';
import styles from './styles.less';

/**
 * TwelveT发展史组件
 */
const History = () => {
  return (
    <Collapse defaultActiveKey={10} className={styles.historyOl}>
      <Collapse.Panel header="v3.0.0 - 2023-1-22" key={10}>
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
          <li>升级Nacos到最新版2.1.1</li>
          <li>升级pom依赖</li>
          <li>其他细节优化</li>
        </ol>
      </Collapse.Panel>
      <Collapse.Panel header="v2.6.0 - 2022-7-28" key={9}>
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
      </Collapse.Panel>
      <Collapse.Panel header="v2.5.0 - 2022-3-31" key={8}>
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
      </Collapse.Panel>
      <Collapse.Panel header="v2.0.0 - 2021-10-01" key={7}>
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
      </Collapse.Panel>
      <Collapse.Panel header="v1.3.0 - 2021-08-13" key={6}>
        <ol>
          <li>前端UI升级至antdV5</li>
          <li>更改request使用</li>
          <li>采用静态路由</li>
          <li>提升pro体验</li>
          <li>修复table卡顿BUG</li>
          <li>新增redis监控面板</li>
          <li>修复已知BUG</li>
        </ol>
      </Collapse.Panel>
      <Collapse.Panel header="v1.2.0 - 2021-06-23" key={5}>
        <ol>
          <li>新增菜单导航栏</li>
          <li>修复阿里ICON无法显示BUG</li>
          <li>新增Dockerfile打包参数</li>
          <li>新增操作日志记录</li>
          <li>修改文件上传适配器</li>
          <li>加入使用文档</li>
          <li>修复已知BUG</li>
        </ol>
      </Collapse.Panel>
      <Collapse.Panel header="v1.1.0 - 2021-04-07" key={4}>
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
      </Collapse.Panel>
      <Collapse.Panel header="v1.0.2 - 2021-03-06" key={3}>
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
      </Collapse.Panel>
      <Collapse.Panel header="v1.0.1 - 2021-02-11" key={2}>
        <ol>
          <li>TwelveT正式对外发布</li>
        </ol>
      </Collapse.Panel>
      <Collapse.Panel header="v1.0.0 - 2019-10-27" key={1}>
        <ol>
          <li>TwelveT正式建立</li>
        </ol>
      </Collapse.Panel>
    </Collapse>
  );
};

export default History;
