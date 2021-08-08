import { useEffect, useState } from 'react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/theme/macarons';
import styles from './styles.less';
import React from 'react';
import { Card } from 'antd';


/**
 * 折线图
 */
const LineChart: React.FC<{ usedmemory: number, usedMemoryPeakHuman: number, time: string }> = props => {

    // 图表参数
    const { usedmemory, time, usedMemoryPeakHuman } = props

    const [timeData, setTimeData] = useState<string[]>([])
    const [usedmemoryData, setUsedmemoryData] = useState<number[]>([])
    const [usedMemoryPeakHumanData, setUsedMemoryPeakHumanData] = useState<number[]>([])

    const config: Record<string, any> = {
        xAxis: {
            data: [],
            boundaryGap: false,
            axisTick: {
                show: false
            }
        },
        grid: {
            left: 10,
            right: 10,
            bottom: 20,
            top: 30,
            containLabel: true
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            padding: [5, 10]
        },
        yAxis: {
            axisTick: {
                show: false
            }
        },
        legend: {
        },
        series: [{
            name: '分配内存',
            itemStyle: {
                normal: {
                    // 上方显示数值
                    show: true,
                    color: '#FF005A',
                    lineStyle: {
                        color: '#FF005A',
                        width: 2
                    }
                }
            },
            smooth: true,
            type: 'line',
            data: [],
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
        },
        // {
        //     name: '消耗峰值',
        //     itemStyle: {
        //         normal: {
        //             color: '#FF005A',
        //             lineStyle: {
        //                 color: '#FF005A',
        //                 width: 2
        //             }
        //         }
        //     },
        //     smooth: true,
        //     type: 'line',
        //     data: [],
        //     animationDuration: 2000,
        //     animationEasing: 'cubicInOut',
        // },
        ]

    }

    let lineChartRef: HTMLDivElement;
    const [lineChart, setLineChart] = useState()

    // 第一次渲染时执行
    useEffect(() => {
        // 获取echarts实例
        const instance: any = echarts.init(lineChartRef, "macarons")
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
        if (!lineChart) { return }
        setEcharts()

    }, [props])

    // 设置echarts属性
    const setEcharts = (instance: any | undefined = undefined) => {
        if (!usedmemory) {
            return
        }

        const ctr = instance || lineChart

        // 时间
        const timeTemp = [...timeData, time]
        config.xAxis.data.push(...timeTemp)
        setTimeData(timeTemp)

        // 分配内存
        const usedmemoryDataTemp = [...usedmemoryData, usedmemory]
        config.series[0].data.push(...usedmemoryDataTemp)
        setUsedmemoryData(usedmemoryDataTemp)


        
        // 消耗峰值
        // const usedMemoryPeakHumanDataTemp = [...usedMemoryPeakHumanData, usedMemoryPeakHuman]
        // console.log(usedMemoryPeakHumanDataTemp)
        // config.series[1].data.push(...usedMemoryPeakHumanDataTemp)
        // setUsedMemoryPeakHumanData(usedMemoryPeakHumanDataTemp)

        // 设置数据
        ctr.setOption(config)
        ctr.hideLoading()

    }

    return (
        <Card title="内存使用">
            <div
                ref={(ref: HTMLDivElement) => { lineChartRef = ref }}
                className={styles.lineChart}
            >
            </div>
        </Card>
    )

}

export default LineChart