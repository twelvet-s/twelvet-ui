import {useEffect} from 'react'
import * as echarts from 'echarts'
import styles from './styles.less'
import React from 'react'
import {Card} from 'antd'

/**
 * 扇形图
 */
const BarChart: React.FC = () => {

    let barChart: HTMLDivElement;

    const config: Record<string, any> = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
            left: 'center',
            bottom: '10',
            data: ['Industries', 'Technology', 'Forex', 'Gold', 'Forecasts']
        },
        series: [
            {
                name: 'WEEKLY WRITE ARTICLES',
                type: 'pie',
                roseType: 'radius',
                radius: [15, 95],
                center: ['50%', '38%'],
                data: [
                    {value: 200, name: 'Industries'},
                    {value: 240, name: 'Technology'},
                    {value: 149, name: 'Forex'},
                    {value: 60, name: 'Gold'},
                    {value: 70, name: 'Forecasts'}
                ],
                animationEasing: 'cubicInOut',
                animationDuration: 2600
            }
        ]

    }

    // 第一次渲染时执行
    useEffect(() => {
        // 获取echarts实例
        let instance: any = echarts.init(barChart)
        // 开启自适应
        window.addEventListener('resize', instance.resize())
        // 设置参数
        instance.setOption(config)
        // if (instance) {
        //     setTimeout(() => {
        //         instance.resize()
        //     }, 200)
        // }
        if (instance === undefined) {
            instance = echarts.init(barChart);
        } else {
            instance.resize()
        }

    }, [])

    return (
        <Card title="数据分析">
            <div
                ref={(ref: HTMLDivElement) => barChart = ref}
                className={styles.barChart}
            >
            </div>
        </Card>

    )

}

export default BarChart
