import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    addEdge,
    Background,
    Connection,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState
} from '@xyflow/react';
import ToolPanel from './components/ToolPanel';
import CustomNode from './components/Nodes/CustomNode';
import {CustomEdge, CustomNode as CustomNodeType, DragData} from './components/Nodes/types';
import '@xyflow/react/dist/style.css';
import styles from './styles.less';
import {ToolCategory} from "@/components/AIFlow/components/ToolPanel/data";
import {ToolOutlined} from '@ant-design/icons';

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
const AIFlow: React.FC = () => {
    // 控制工具面板显示状态
    const [showToolPanel, setShowToolPanel] = useState<boolean>(false);
    // 控制节点工具窗口显示状态
    const [showNodeToolPanel, setShowNodeToolPanel] = useState<boolean>(false);
    const [nodeToolPanelPosition, setNodeToolPanelPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
    const [nodeToolPanelSize, setNodeToolPanelSize] = useState<{width: number, height: number}>({width: 300, height: 400});
    const [currentNodeId, setCurrentNodeId] = useState<string>('');

    const toolPanelRef = useRef<HTMLDivElement>(null);
    const nodeToolPanelRef = useRef<HTMLDivElement>(null);
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
                    description: '配置和使用各种AI大模型，如GPT、Claude等，用于文本生成、对话和分析任务'
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
                    description: '创建和管理自动化工作流程，连接多个节点实现复杂的业务逻辑处理'
                },
                {
                    id: 'plugin',
                    name: '插件',
                    icon: '🧩',
                    color: 'workflow',
                    description: '扩展系统功能的插件模块，可以集成第三方服务和自定义功能'
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
                    description: '执行自定义代码逻辑，支持多种编程语言，用于复杂的数据处理和业务计算'
                },
                {
                    id: 'intent',
                    name: '意图识别',
                    icon: '🎯',
                    color: 'business',
                    description: '智能识别用户输入的意图和目的，用于对话系统和智能路由'
                },
                {
                    id: 'selector',
                    name: '选择器',
                    icon: 'IF',
                    color: 'selector',
                    description: '根据条件进行分支选择，实现if-else逻辑，控制工作流的执行路径'
                },
                {
                    id: 'loop',
                    name: '循环',
                    icon: '🔄',
                    color: 'loop',
                    description: '重复执行指定的操作，支持条件循环和计数循环，用于批量处理数据'
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
                    description: '接收外部数据输入，支持文本、文件、API等多种输入方式'
                },
                {
                    id: 'output',
                    name: '输出',
                    icon: '📤',
                    color: 'output',
                    description: '输出处理结果，支持多种格式和目标，如文件、数据库、API等'
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
                    description: '从数据库中查询和检索数据，支持SQL和NoSQL数据库'
                },
                {
                    id: 'data-add',
                    name: '新增数据',
                    icon: '➕',
                    color: 'database',
                    description: '向数据库中插入新的数据记录，支持批量插入操作'
                },
                {
                    id: 'data-update',
                    name: '更新数据',
                    icon: '✏️',
                    color: 'database',
                    description: '修改数据库中的现有数据，支持条件更新和批量更新'
                },
            ],
        },
    ];

    // 处理点击外部区域关闭面板
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;

            // 关闭主工具面板
            if (showToolPanel) {
                const isClickInsideMainPanel = toolPanelRef.current && toolPanelRef.current.contains(target);
                const isClickOnTrigger = triggerRef.current && triggerRef.current.contains(target);

                // 如果点击的不是面板内部，也不是触发按钮，则关闭面板
                if (!isClickInsideMainPanel && !isClickOnTrigger) {
                    setShowToolPanel(false);
                }
            }

            // 关闭节点工具面板
            if (showNodeToolPanel && nodeToolPanelRef.current) {
                // 检查点击的是否是工具面板内部
                const isClickInsidePanel = nodeToolPanelRef.current.contains(target);

                // 检查点击的是否是节点上的工具按钮
                const isClickOnToolButton = target.closest('.tool-link-button') !== null;

                // 如果点击的不是面板内部，也不是工具按钮，则关闭面板
                if (!isClickInsidePanel && !isClickOnToolButton) {
                    setShowNodeToolPanel(false);
                }
            }
        };

        // 处理 ESC 键关闭面板
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showNodeToolPanel) {
                    setShowNodeToolPanel(false);
                } else if (showToolPanel) {
                    setShowToolPanel(false);
                }
            }
        };

        // 使用 capture 阶段确保事件能被正确捕获
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showToolPanel, showNodeToolPanel]);

    // 切换工具面板显示状态
    const toggleToolPanel = () => {
        setShowToolPanel(!showToolPanel);
    };

    // 处理节点工具按钮点击
    const handleNodeToolClick = (nodeId: string, event: React.MouseEvent) => {
        // 计算工具面板位置，智能避免被浏览器边界遮挡
        const rect = reactFlowWrapper.current?.getBoundingClientRect();
        if (rect) {
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

            // 工具面板的预估尺寸（响应式）
            const panelWidth = rect.width < 768 ? 250 : 300;
            const panelHeight = rect.height < 600 ? 300 : 400;
            const margin = rect.width < 768 ? 10 : 20; // 距离边界的最小间距
            const nodeOffset = rect.width < 768 ? 30 : 50; // 距离节点的偏移距离

            // 保存面板尺寸
            setNodeToolPanelSize({ width: panelWidth, height: panelHeight });

            // 计算四个可能的位置：右侧、左侧、下方、上方
            const positions = [
                { x: clickX + nodeOffset, y: clickY - panelHeight / 2, priority: 1 }, // 右侧
                { x: clickX - panelWidth - nodeOffset, y: clickY - panelHeight / 2, priority: 2 }, // 左侧
                { x: clickX - panelWidth / 2, y: clickY + nodeOffset, priority: 3 }, // 下方
                { x: clickX - panelWidth / 2, y: clickY - panelHeight - nodeOffset, priority: 4 }, // 上方
            ];

            // 检查每个位置是否在边界内
            const validPositions = positions.filter(pos => {
                return pos.x >= margin &&
                       pos.x + panelWidth <= rect.width - margin &&
                       pos.y >= margin &&
                       pos.y + panelHeight <= rect.height - margin;
            });

            let finalPosition;
            if (validPositions.length > 0) {
                // 选择优先级最高的有效位置
                finalPosition = validPositions.sort((a, b) => a.priority - b.priority)[0];
            } else {
                // 如果没有完全有效的位置，选择最佳的折中位置
                finalPosition = {
                    x: Math.max(margin, Math.min(clickX - panelWidth / 2, rect.width - panelWidth - margin)),
                    y: Math.max(margin, Math.min(clickY - panelHeight / 2, rect.height - panelHeight - margin))
                };
            }

            setNodeToolPanelPosition({
                x: finalPosition.x,
                y: finalPosition.y
            });
        }

        setCurrentNodeId(nodeId);
        setShowNodeToolPanel(true);
        // 关闭主工具面板
        setShowToolPanel(false);
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
            data: {
                ...nodeData.data,
                onToolClick: (event: React.MouseEvent) => handleNodeToolClick(nodeData.id, event)
            }
        };

        console.log('创建的新节点:', newNode);
        setNodes((nds) => {
            const updatedNodes = nds.concat(newNode);
            console.log('更新后的节点列表:', updatedNodes);
            return updatedNodes;
        });

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
            const nodeId = `${dragData.nodeType}-${Date.now()}`;
            const nodeData = {
                id: nodeId,
                type: 'customNode',
                data: {
                    id: dragData.nodeType,
                    label: dragData.label,
                    icon: dragData.icon,
                    color: dragData.color,
                    description: dragData.description,
                    type: dragData.nodeType,
                    onToolClick: (event: React.MouseEvent) => handleNodeToolClick(nodeId, event)
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

    // 处理画布点击（关闭所有工具面板）
    const onPaneClick = useCallback(() => {
        if (showNodeToolPanel) {
            setShowNodeToolPanel(false);
        }
        if (showToolPanel) {
            setShowToolPanel(false);
        }
    }, [showNodeToolPanel, showToolPanel]);

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
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        defaultEdgeOptions={{
                            animated: true,
                            style: {strokeWidth: 2},
                        }}
                        attributionPosition="bottom-left"
                    >
                        <Background/>
                        <Controls/>
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
                    <ToolOutlined/>
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
                                // 点击工具后可以选择是否关闭面板
                                // setShowToolPanel(false);
                            }}
                            onNodeCreate={handleNodeCreate}
                        />
                    </div>
                )}

                {/* 节点工具面板 */}
                {showNodeToolPanel && (
                    <div
                        ref={nodeToolPanelRef}
                        className={styles.nodeToolPanelContainer}
                        style={{
                            left: nodeToolPanelPosition.x,
                            top: nodeToolPanelPosition.y,
                            width: nodeToolPanelSize.width,
                            maxHeight: nodeToolPanelSize.height,
                        }}
                    >
                        <ToolPanel
                            categories={customCategories}
                            onToolClick={(tool) => {
                                // 点击工具后关闭节点面板
                                setShowNodeToolPanel(false);
                            }}
                            onNodeCreate={(nodeData, position) => {
                                // 在节点附近创建新节点
                                const offset = 150; // 偏移距离
                                const newPosition = position || {
                                    x: nodeToolPanelPosition.x + offset,
                                    y: nodeToolPanelPosition.y
                                };
                                handleNodeCreate(nodeData, newPosition);
                                setShowNodeToolPanel(false);
                            }}
                        />
                    </div>
                )}
            </div>
        </ReactFlowProvider>
    );
};

export default AIFlow;
