import React, {useEffect} from 'react';
import AIFlow from '@/components/AIFlow';

/**
 * AI工作流
 * @constructor
 */
const Flow = () => {

    // 设置页面标题
    useEffect(() => {
        document.title = 'AI工作流 - TwelveT';
    }, []);

    return (
        <AIFlow/>
    );
};

export default Flow;
