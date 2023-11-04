import { useEffect, useState } from 'react';
import * as echarts from 'echarts'
import styles from './styles.less';
import React from 'react';
import { Card } from 'antd';


/**
 * 折线图
 */
const LineChart: React.FC<{ usedmemory: number, usedMemoryPeakHuman: number, time: string }> = props => {

    // 图表参数
    const { usedmemory } = props

    const config: Record<string, any> = {
        series: [
            {
                type: 'gauge',
                axisLine: {
                    lineStyle: {
                        width: 30,
                        color: [
                            [0.3, '#67e0e3'],
                            [0.7, '#37a2da'],
                            [1, '#fd666d']
                        ]
                    }
                },
                pointer: {
                    itemStyle: {
                        color: 'auto'
                    }
                },
                axisTick: {
                    distance: -30,
                    length: 8,
                    lineStyle: {
                        color: '#fff',
                        width: 2
                    }
                },
                splitLine: {
                    distance: -30,
                    length: 30,
                    lineStyle: {
                        color: '#fff',
                        width: 4
                    }
                },
                axisLabel: {
                    color: 'inherit',
                    distance: 40,
                    fontSize: 15
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value} M',
                    color: 'inherit'
                },
                data: [

                ]
            }
        ]

    }

    // 设置echarts属性
    const setEcharts = (instance: any | undefined = undefined) => {
        if (!usedmemory) {
            return
        }

        const ctr = instance || lineChart

        // 分配内存
        config.series[0].data = [{
            value: usedmemory,
            name: '内存消耗'
        }]

        // 设置数据
        ctr.setOption(config)
        ctr.hideLoading()

    }

    let lineChartRef: HTMLDivElement;
    const [lineChart, setLineChart] = useState()

    // 第一次渲染时执行
    useEffect(() => {
        // 获取echarts实例
        const instance: any = echarts.init(lineChartRef)
        instance.showLoading()
        // 设置参数
        setEcharts(instance)
        // 开启自适应
        window.addEventListener('resize', instance.resize)

        // 设置到state
        setLineChart(instance)

    }, [])

    // 依赖props更新
    useEffect(() => {
        if (!lineChart) {
            return
        }
        setEcharts()

    }, [props])

    return (
        <Card title="内存使用">
            <div
                ref={(ref: HTMLDivElement) => {
                    lineChartRef = ref
                }}
                className={styles.lineChart}
            />
        </Card>
    )

}

export default LineChart
