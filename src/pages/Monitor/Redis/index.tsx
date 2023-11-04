import React, { useEffect, useState } from 'react'

import { query } from './service'
import { Card, Col, Row } from 'antd'
import CommandStatsChart from './components/CommandStatsChart'
import { PageContainer, ProDescriptions } from '@ant-design/pro-components'
import RAMChart from './components/RAMChart'
import KeyChart from './components/KeyChart'

const MonitorRedis: React.FC = () => {

    const [redisData, setRedisData] = useState<any>()

    /**
     * 设置数据
     */
    const getInfo = async () => {
        const { data } = await query()
        setRedisData(data)
    }

    // 第一次渲染时执行
    useEffect(() => {
        getInfo()
        // const timer = setInterval(() => {
        //     getInfo()
        // }, 3000)

        // return () => {
        //     clearInterval(timer)
        // }
    }, [])

    return (
        <PageContainer>
            <Row gutter={[20, 20]}>

                <Col md={{ span: 16 }} xs={{ span: 24 }}>
                    <Card title="基本信息">
                        <ProDescriptions
                            column={2}
                            bordered={true}
                        >

                            <ProDescriptions.Item label="Redis版本">
                                {redisData?.info.redis_version}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="运行模式">
                                {redisData?.info.redis_mode === "standalone" ? "单机" : "集群"}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="端口">
                                {redisData?.info.tcp_port}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="客户端数">
                                {redisData?.info.connected_clients}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="运行时间(天)">
                                {redisData?.info.uptime_in_days}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="实用内存">
                                {redisData?.info.used_memory_human}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="实用CPU">
                                {parseFloat(redisData?.info.used_cpu_user_children).toFixed(2)}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="内存配置">
                                {redisData?.info.maxmemory_human}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="AOF是否开启">
                                {redisData?.info.aof_enabled === "0" ? "否" : "是"}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="RDB是否成功">
                                {redisData?.info.rdb_last_bgsave_status}
                            </ProDescriptions.Item>

                            <ProDescriptions.Item label="网络入口/出口">
                                {redisData?.info.instantaneous_input_kbps}kps/{redisData?.info.instantaneous_output_kbps}kps
                            </ProDescriptions.Item>

                        </ProDescriptions>
                    </Card>
                </Col>

                <Col md={{ span: 8 }} xs={{ span: 24 }}>
                    <CommandStatsChart commandStats={redisData?.commandStats} />
                </Col>

                <Col md={{ span: 12 }} xs={{ span: 24 }}>
                    {redisData?.info.usedmemory}
                    <RAMChart
                        usedmemory={parseFloat(redisData?.info.used_memory_human)}
                        usedMemoryPeakHuman={parseFloat(redisData?.used_memory_peak_human)}
                        time={redisData?.time}
                    />
                </Col>

                <Col md={{ span: 12 }} xs={{ span: 24 }}>
                    <KeyChart
                        dbSize={redisData?.dbSize}
                        time={redisData?.time}
                    />
                </Col>
            </Row>
        </PageContainer>
    )

}

export default MonitorRedis
