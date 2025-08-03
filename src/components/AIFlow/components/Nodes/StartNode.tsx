import React from 'react';
import {Handle, Position, NodeProps} from '@xyflow/react';
import {NodeData, NODE_COLORS, HandleType} from './types';
import {PlusOutlined, PlayCircleOutlined} from '@ant-design/icons';
import './CustomNode.less';

/**
 * 开始节点组件
 * 只有右边的输出handle，用于工作流的起始点
 */
const StartNode: React.FC<NodeProps<NodeData>> = ({data, selected}) => {
    const {label, icon, color, description, onToolClick} = data;
    const nodeColor = NODE_COLORS[color] || NODE_COLORS['start'];

    // 处理工具按钮点击 - 只支持输出handle
    const handleToolClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // 防止触发节点选择
        if (onToolClick) {
            onToolClick(e, HandleType.OUTPUT);
        }
    };

    return (
        <div className={`custom-node start-node ${selected ? 'selected' : ''}`}>
            {/* 节点内容 */}
            <div className="node-content">
                <div
                    className="node-icon start-icon"
                    style={{backgroundColor: nodeColor}}
                >
                    <PlayCircleOutlined style={{fontSize: '16px', color: 'white'}} />
                </div>
                <div className="node-label">{label || '开始'}</div>
                {description && (
                    <div className="node-description" title={description}>
                        {description.length > 30 ? `${description.substring(0, 30)}...` : description}
                    </div>
                )}
            </div>

            {/* 只有输出连接点和工具按钮 */}
            <div className="handle-container right">
                <Handle
                    type="source"
                    position={Position.Right}
                    className="custom-handle output-handle start-handle"
                    style={{background: nodeColor}}
                    onClick={handleToolClick}
                >
                    <div className="handle-plus-icon">
                        <PlusOutlined />
                    </div>
                </Handle>
            </div>
        </div>
    );
};

export default StartNode;
