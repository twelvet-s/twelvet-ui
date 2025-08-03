import React from 'react';
import {Handle, Position, NodeProps} from '@xyflow/react';
import {NodeData, NODE_COLORS} from './types';
import './CustomNode.less';

/**
 * 自定义节点组件
 */
const CustomNode: React.FC<NodeProps<NodeData>> = ({data, selected}) => {
    const {label, icon, color, description, type} = data;
    const nodeColor = NODE_COLORS[color] || '#1890ff';

    return (
        <div className={`custom-node ${selected ? 'selected' : ''}`}>
            {/* 输入连接点 */}
            <Handle
                type="target"
                position={Position.Left}
                className="custom-handle input-handle"
                style={{background: nodeColor}}
            />

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

            {/* 输出连接点 */}
            <Handle
                type="source"
                position={Position.Right}
                className="custom-handle output-handle"
                style={{background: nodeColor}}
            />
        </div>
    );
};

export default CustomNode;
