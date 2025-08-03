import React from 'react';
import {Handle, Position, NodeProps} from '@xyflow/react';
import {NodeData, NODE_COLORS, HandleType} from './types';
import {PlusOutlined} from '@ant-design/icons';
import './CustomNode.less';

/**
 * 自定义节点组件
 */
const CustomNode: React.FC<NodeProps<NodeData>> = ({data, selected}) => {
    const {label, icon, color, description, type, onToolClick} = data;
    const nodeColor = NODE_COLORS[color] || '#1890ff';

    // 处理工具按钮点击
    const handleToolClick = (e: React.MouseEvent, handleType: HandleType) => {
        e.stopPropagation(); // 防止触发节点选择
        if (onToolClick) {
            onToolClick(e, handleType);
        }
    };

    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`}>
            {/* 输入连接点和工具按钮 */}
            <div className="handle-container left">
                <Handle
                    type="target"
                    position={Position.Left}
                    className="custom-handle input-handle"
                    style={{background: nodeColor}}
                    onClick={(e) => handleToolClick(e, HandleType.INPUT)}
                >
                    <div className="handle-plus-icon">
                        <PlusOutlined />
                    </div>
                </Handle>
            </div>

            {/* 节点内容 */}
            <div className="node-content">
                <div
                    className="node-icon"
                    style={{backgroundColor: nodeColor}}
                >
                    {icon}
                </div>
                <div className="node-label">{label}</div>
                {description && (
                    <div className="node-description" title={description}>
                        {description.length > 30 ? `${description.substring(0, 30)}...` : description}
                    </div>
                )}
            </div>

            {/* 输出连接点和工具按钮 */}
            <div className="handle-container right">
                <Handle
                    type="source"
                    position={Position.Right}
                    className="custom-handle output-handle"
                    style={{background: nodeColor}}
                    onClick={(e) => handleToolClick(e, HandleType.OUTPUT)}
                >
                    <div className="handle-plus-icon">
                        <PlusOutlined />
                    </div>
                </Handle>
            </div>
        </div>
    );
};

export default CustomNode;
