import React from 'react';
import {Handle, Position, NodeProps} from '@xyflow/react';
import {NodeData, NODE_COLORS, HandleType} from './types';
import {PlusOutlined, CheckCircleOutlined} from '@ant-design/icons';
import './CustomNode.less';

/**
 * 结束节点组件
 * 只有左边的输入handle，用于工作流的结束点
 */
const EndNode: React.FC<NodeProps<NodeData>> = ({data, selected}) => {
    const {label, icon, color, description, onToolClick} = data;
    const nodeColor = NODE_COLORS[color] || NODE_COLORS['end'];

    // 处理工具按钮点击 - 只支持输入handle
    const handleToolClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // 防止触发节点选择
        if (onToolClick) {
            onToolClick(e, HandleType.INPUT);
        }
    };

    return (
        <div className={`custom-node end-node ${selected ? 'selected' : ''}`}>
            {/* 只有输入连接点和工具按钮 */}
            <div className="handle-container left">
                <Handle
                    type="target"
                    position={Position.Left}
                    className="custom-handle input-handle end-handle"
                    style={{background: nodeColor}}
                    onClick={handleToolClick}
                >
                    <div className="handle-plus-icon">
                        <PlusOutlined />
                    </div>
                </Handle>
            </div>

            {/* 节点内容 */}
            <div className="node-content">
                <div
                    className="node-icon end-icon"
                    style={{backgroundColor: nodeColor}}
                >
                    <CheckCircleOutlined style={{fontSize: '16px', color: 'white'}} />
                </div>
                <div className="node-label">{label || '结束'}</div>
                {description && (
                    <div className="node-description" title={description}>
                        {description.length > 30 ? `${description.substring(0, 30)}...` : description}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EndNode;
