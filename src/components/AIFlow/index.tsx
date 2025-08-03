import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    ReactFlowProvider
} from '@xyflow/react';
import ToolPanel from './components/ToolPanel';
import CustomNode from './components/Nodes/CustomNode';
import { CustomNode as CustomNodeType, CustomEdge, DragData } from './components/Nodes/types';
import '@xyflow/react/dist/style.css';
import styles from './styles.less';
import {ToolCategory} from "@/components/AIFlow/components/ToolPanel/data";
import {message} from "antd";
import { ToolOutlined } from '@ant-design/icons';

// 节点类型配置
const nodeTypes = {
    customNode: CustomNode,
};

// 初始节点和边
const initialNodes: CustomNodeType[] = [];
const initialEdges: CustomEdge[] = [];

/**
 * AI工作流
 * @constructor
 */
const AIFlow : React.FC = () => {
    // 控制工具面板显示状态
    const [showToolPanel, setShowToolPanel] = useState<boolean>(false);
    const toolPanelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // 节点和边的状态管理
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const customCategories: ToolCategory[] = [
        {
            id: 'ai',
            name: '大模型',
            tools: [
                {
                    id: 'ai-model',
                    name: '大模型',
                    icon: '🤖',
                    color: 'ai-model',
                    description: '配置和使用各种AI大模型，如GPT、Claude等，用于文本生成、对话和分析任务',
                    onClick: () => {
                        message.success('点击了大模型工具');
                    },
                },
            ],
        },
        {
            id: 'workflow',
            name: '工作流',
            tools: [
                {
                    id: 'workflow',
                    name: '工作流',
                    icon: '⚡',
                    color: 'workflow',
                    description: '创建和管理自动化工作流程，连接多个节点实现复杂的业务逻辑处理',
                    onClick: () => {
                        message.success('点击了工作流工具');
                    },
                },
                {
                    id: 'plugin',
                    name: '插件',
                    icon: '🧩',
                    color: 'workflow',
                    description: '扩展系统功能的插件模块，可以集成第三方服务和自定义功能',
                    onClick: () => {
                        message.success('点击了插件工具');
                    },
                },
            ],
        },
        {
            id: 'business',
            name: '业务逻辑',
            tools: [
                {
                    id: 'code',
                    name: '代码',
                    icon: '</>',
                    color: 'code',
                    description: '执行自定义代码逻辑，支持多种编程语言，用于复杂的数据处理和业务计算',
                    onClick: () => {
                        message.success('点击了代码工具');
                    },
                },
                {
                    id: 'intent',
                    name: '意图识别',
                    icon: '🎯',
                    color: 'business',
                    description: '智能识别用户输入的意图和目的，用于对话系统和智能路由',
                    onClick: () => {
                        message.success('点击了意图识别工具');
                    },
                },
                {
                    id: 'selector',
                    name: '选择器',
                    icon: 'IF',
                    color: 'selector',
                    description: '根据条件进行分支选择，实现if-else逻辑，控制工作流的执行路径',
                    onClick: () => {
                        message.success('点击了选择器工具');
                    },
                },
                {
                    id: 'loop',
                    name: '循环',
                    icon: '🔄',
                    color: 'loop',
                    description: '重复执行指定的操作，支持条件循环和计数循环，用于批量处理数据',
                    onClick: () => {
                        message.success('点击了循环工具');
                    },
                },
            ],
        },
        {
            id: 'io',
            name: '输入&输出',
            tools: [
                {
                    id: 'input',
                    name: '输入',
                    icon: '📥',
                    color: 'input',
                    description: '接收外部数据输入，支持文本、文件、API等多种输入方式',
                    onClick: () => {
                        message.success('点击了输入工具');
                    },
                },
                {
                    id: 'output',
                    name: '输出',
                    icon: '📤',
                    color: 'output',
                    description: '输出处理结果，支持多种格式和目标，如文件、数据库、API等',
                    onClick: () => {
                        message.success('点击了输出工具');
                    },
                },
            ],
        },
        {
            id: 'database',
            name: '数据库',
            tools: [
                {
                    id: 'data-query',
                    name: '查询数据',
                    icon: '🔍',
                    color: 'database',
                    description: '从数据库中查询和检索数据，支持SQL和NoSQL数据库',
                    onClick: () => {
                        message.success('点击了查询数据工具');
                    },
                },
                {
                    id: 'data-add',
                    name: '新增数据',
                    icon: '➕',
                    color: 'database',
                    description: '向数据库中插入新的数据记录，支持批量插入操作',
                    onClick: () => {
                        message.success('点击了新增数据工具');
                    },
                },
                {
                    id: 'data-update',
                    name: '更新数据',
                    icon: '✏️',
                    color: 'database',
                    description: '修改数据库中的现有数据，支持条件更新和批量更新',
                    onClick: () => {
                        message.success('点击了更新数据工具');
                    },
                },
            ],
        },
    ];

    // 处理点击外部区域关闭面板
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showToolPanel &&
                toolPanelRef.current &&
                triggerRef.current &&
                !toolPanelRef.current.contains(event.target as Node) &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setShowToolPanel(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showToolPanel]);

    // 切换工具面板显示状态
    const toggleToolPanel = () => {
        setShowToolPanel(!showToolPanel);
    };

    // 处理连接创建
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // 处理节点创建（来自点击或拖拽）
    const handleNodeCreate = useCallback((nodeData: any, position?: { x: number; y: number }) => {
        console.log('handleNodeCreate 被调用:', nodeData, position);

        let finalPosition = position;

        // 如果没有指定位置，使用随机位置
        if (!finalPosition) {
            finalPosition = {
                x: Math.random() * 400 + 100,
                y: Math.random() * 300 + 100
            };
        }

        const newNode: CustomNodeType = {
            ...nodeData,
            position: finalPosition,
        };

        console.log('创建的新节点:', newNode);
        setNodes((nds) => {
            const updatedNodes = nds.concat(newNode);
            console.log('更新后的节点列表:', updatedNodes);
            return updatedNodes;
        });
        message.success(`已添加 ${nodeData.data.label} 节点`);
    }, [setNodes]);

    // 处理拖拽结束（放置到画布）
    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            const data = event.dataTransfer.getData('application/reactflow');

            // 检查是否是有效的拖拽数据
            if (typeof data === 'undefined' || !data || !reactFlowBounds) {
                return;
            }

            let dragData: DragData;
            try {
                dragData = JSON.parse(data);
            } catch (error) {
                console.error('Invalid drag data:', error);
                return;
            }

            // 计算节点在画布中的位置
            const position = reactFlowInstance?.screenToFlowPosition({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            if (!position) return;

            // 创建节点数据
            const nodeData = {
                id: `${dragData.nodeType}-${Date.now()}`,
                type: 'customNode',
                data: {
                    id: dragData.nodeType,
                    label: dragData.label,
                    icon: dragData.icon,
                    color: dragData.color,
                    description: dragData.description,
                    type: dragData.nodeType,
                },
            };

            handleNodeCreate(nodeData, position);
        },
        [reactFlowInstance, handleNodeCreate]
    );

    // 处理拖拽悬停
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <ReactFlowProvider>
            <div className={styles.ctn}>
                <div className={styles.reactflowWrapper} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={{
                        animated: true,
                        style: { strokeWidth: 2 },
                    }}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <Background />
                    <Controls />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.type === 'customNode') return '#1890ff';
                            return '#eee';
                        }}
                        nodeColor={(n) => {
                            if (n.type === 'customNode') return '#fff';
                            return '#fff';
                        }}
                    />
                </ReactFlow>
            </div>

            {/* 工具面板触发器 */}
            <div
                ref={triggerRef}
                className={`${styles.toolTrigger} ${showToolPanel ? styles.active : ''}`}
                onClick={toggleToolPanel}
                title="工具面板"
            >
                <ToolOutlined />
                <span>工具</span>
            </div>

            {/* 工具面板 */}
            {showToolPanel && (
                <div
                    ref={toolPanelRef}
                    className={styles.toolPanelContainer}
                >
                    <ToolPanel
                        categories={customCategories}
                        onToolClick={(tool) => {
                            message.info(`${tool.name}: ${tool.description || '已添加到画布'}`);
                            // 点击工具后可以选择是否关闭面板
                            // setShowToolPanel(false);
                        }}
                        onNodeCreate={handleNodeCreate}
                    />
                </div>
            )}
            </div>
        </ReactFlowProvider>
    );
};

export default AIFlow;
