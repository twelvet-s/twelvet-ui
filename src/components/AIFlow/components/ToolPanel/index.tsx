import React, {useState, useEffect, useMemo} from 'react';
import {Input, Tooltip} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {ToolPanelProps, ToolCategory, ToolItem} from './data';
import './styles.less';

// 默认工具数据
const defaultCategories: ToolCategory[] = [
    {
        id: 'ai',
        name: '大模型',
        tools: [
            {id: 'ai-model', name: '大模型', icon: '🤖', color: 'ai-model'},
        ],
    },
];

/**
 * 工具面板组件
 */
const ToolPanel: React.FC<ToolPanelProps> = ({
                                                 categories = defaultCategories,
                                                 onToolClick,
                                                 onNodeCreate,
                                                 searchPlaceholder = '搜索节点、插件、工作流',
                                                 showSearch = true,
                                                 className = '',
                                                 style = {},
                                             }) => {
    const [searchValue, setSearchValue] = useState<string>('');

    // 过滤工具数据
    const filteredCategories = useMemo(() => {
        if (!searchValue.trim()) {
            return categories;
        }

        const filtered: ToolCategory[] = [];
        categories.forEach((category) => {
            const filteredTools = category.tools.filter((tool) =>
                tool.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                (tool.description && tool.description.toLowerCase().includes(searchValue.toLowerCase()))
            );

            if (filteredTools.length > 0) {
                filtered.push({
                    ...category,
                    tools: filteredTools,
                });
            }
        });

        return filtered;
    }, [categories, searchValue]);

    // 创建节点数据
    const createNodeData = (tool: ToolItem) => {
        const nodeData = {
            id: `${tool.id}-${Date.now()}`,
            type: 'customNode',
            position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 }, // 随机位置
            data: {
                id: tool.id,
                label: tool.name,
                icon: tool.icon,
                color: tool.color,
                description: tool.description,
                type: tool.id,
            },
        };
        console.log('创建节点数据:', nodeData);
        return nodeData;
    };

    // 处理工具点击
    const handleToolClick = (tool: ToolItem) => {
        console.log('工具被点击:', tool.name);

        // 执行工具自定义的点击事件
        if (tool.onClick) {
            tool.onClick();
        }

        // 执行外部传入的点击回调
        if (onToolClick) {
            onToolClick(tool);
        }

        // 创建节点
        if (onNodeCreate) {
            const nodeData = createNodeData(tool);
            console.log('调用 onNodeCreate:', nodeData);
            onNodeCreate(nodeData);
        } else {
            console.log('onNodeCreate 回调未定义');
        }
    };

    // 处理拖拽开始
    const handleDragStart = (event: React.DragEvent, tool: ToolItem) => {
        const dragData = {
            nodeType: tool.id,
            label: tool.name,
            icon: tool.icon,
            color: tool.color,
            description: tool.description,
        };

        event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
        event.dataTransfer.effectAllowed = 'move';

        // 阻止点击事件冒泡
        event.stopPropagation();
    };

    // 渲染工具项
    const renderToolItem = (tool: ToolItem) => (
        <Tooltip
            key={tool.id}
            title={
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{tool.name}</div>
                    <div>{tool.description || '点击使用或拖拽到画布创建节点'}</div>
                </div>
            }
            placement="top"
            mouseEnterDelay={0.3}
            mouseLeaveDelay={0.1}
            overlayStyle={{
                maxWidth: '320px',
                fontSize: '13px',
                lineHeight: '1.4'
            }}
            overlayInnerStyle={{
                padding: '8px 12px',
                borderRadius: '6px'
            }}
        >
            <div
                className="tool-item"
                draggable
                onDragStart={(event) => handleDragStart(event, tool)}
                onClick={(event) => {
                    // 防止拖拽时触发点击
                    if (!event.defaultPrevented) {
                        handleToolClick(tool);
                    }
                }}
            >
                <div className={`tool-icon ${tool.color}`}>
                    {tool.icon}
                </div>
                <div className="tool-name">{tool.name}</div>
            </div>
        </Tooltip>
    );

    // 渲染分类
    const renderCategory = (category: ToolCategory) => (
        <div key={category.id} className="category-section">
            <div className="category-title">{category.name}</div>
            <div className="tools-grid">
                {category.tools.map(renderToolItem)}
            </div>
        </div>
    );

    return (
        <div className={`tool-panel ${className}`} style={style}>
            {showSearch && (
                <div className="search-container">
                    <Input
                        className="search-input"
                        placeholder={searchPlaceholder}
                        prefix={<SearchOutlined/>}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        allowClear
                    />
                </div>
            )}

            <div className="categories-container">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map(renderCategory)
                ) : (
                    <div className="no-results">
                        没有找到匹配的工具
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolPanel;
