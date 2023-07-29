import { useEffect } from 'react'
import * as echarts from 'echarts'
import styles from './styles.less'
import React from 'react'
import { Card } from 'antd'

/**
 * 扇形图
 */
const CommandStatsChart: React.FC<{ commandStats: {} | undefined }> = (props) => {

    let commandStatsChart: HTMLDivElement;

    const { commandStats } = props

    // 第一次渲染时执行
    useEffect(() => {
        // 获取echarts实例
        const instance: any = echarts.init(commandStatsChart)
        // 开启自适应
        window.addEventListener('resize', instance.resize)

        // 设置参数
        instance.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
                left: 'center',
                bottom: '10',
            },
            series: [
                {
                    name: '命令统计',
                    type: 'pie',
                    roseType: 'radius',
                    radius: [15, 95],
                    center: ['50%', '38%'],
                    data: commandStats,
                    animationEasing: 'cubicInOut',
                    animationDuration: 2600
                }
            ]
        })

        // 关闭监听
        return () => {
            window.removeEventListener('resize', instance.resize)
        }

    }, [commandStats])

    return (
        <Card title="命令统计">
            <div
                ref={(ref: HTMLDivElement) => commandStatsChart = ref}
                className={styles.commandStatsChart}
            />
        </Card>

    )

}

export default CommandStatsChart
