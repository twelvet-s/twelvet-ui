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
import { message } from 'antd';
import ToolPanel from './components/ToolPanel';
import {CustomNode, StartNode, EndNode} from './components/Nodes';
import {CustomEdge, CustomNode as CustomNodeType, DragData, HandleType, NodeType} from './components/Nodes/types';
import '@xyflow/react/dist/style.css';
import styles from './styles.less';
import {ToolCategory} from "@/components/AIFlow/components/ToolPanel/data";
import {autoLayout, centerLayout, LayoutType, autoFitView, setZoomLevel, smartFitView, calculateOptimalZoom} from './utils/layoutUtils';

// 节点类型配置
const nodeTypes = {
    customNode: CustomNode,
    startNode: StartNode,
    endNode: EndNode,
};

// 创建初始节点的函数
const createInitialNodes = (): CustomNodeType[] => {
    const startNodeId = 'start-node-initial';
    const endNodeId = 'end-node-initial';

    return [
        {
            id: startNodeId,
            type: 'startNode',
            position: { x: 100, y: 200 },
            data: {
                id: NodeType.START,
                label: '开始',
                icon: '▶️',
                color: 'start',
                description: '工作流开始节点',
                type: NodeType.START,
                onToolClick: (event: React.MouseEvent, handleType?: HandleType) => {
                    // 这个回调会在组件初始化后被重新设置
                }
            },
            deletable: false, // 不可删除
        },
        {
            id: endNodeId,
            type: 'endNode',
            position: { x: 600, y: 200 },
            data: {
                id: NodeType.END,
                label: '结束',
                icon: '⏹️',
                color: 'end',
                description: '工作流结束节点',
                type: NodeType.END,
                onToolClick: (event: React.MouseEvent, handleType?: HandleType) => {
                    // 这个回调会在组件初始化后被重新设置
                }
            },
            deletable: false, // 不可删除
        }
    ];
};

// 初始节点和边
const initialNodes: CustomNodeType[] = createInitialNodes();
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
    const [currentHandleType, setCurrentHandleType] = useState<HandleType | null>(null);
    // 用于跟踪拖拽源节点信息
    const [dragSourceNode, setDragSourceNode] = useState<{nodeId: string, handleType: HandleType} | null>(null);


    const toolPanelRef = useRef<HTMLDivElement>(null);
    const nodeToolPanelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // 节点和边的状态管理
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // 更新初始节点的onToolClick回调
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === 'start-node-initial' || node.id === 'end-node-initial') {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            onToolClick: (event: React.MouseEvent, handleType?: HandleType) =>
                                handleNodeToolClick(node.id, event, handleType)
                        }
                    };
                }
                return node;
            })
        );
    }, []); // 只在组件挂载时执行一次

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
                    setDragSourceNode(null); // 清除拖拽源信息
                }
            }
        };

        // 处理 ESC 键关闭面板
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showNodeToolPanel) {
                    setShowNodeToolPanel(false);
                    setDragSourceNode(null); // 清除拖拽源信息
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

    // 智能布局整理 - 优化版
    const handleAutoLayout = useCallback(async () => {
        if (nodes.length === 0) return;

        console.log('开始智能布局整理，当前节点数量:', nodes.length);

        // 获取容器尺寸用于智能布局
        const container = reactFlowWrapper.current;
        const containerSize = container ? {
            width: container.clientWidth,
            height: container.clientHeight
        } : { width: 800, height: 600 };

        console.log('容器尺寸:', containerSize);

        // 使用优化的层次布局，方向设置为从左到右
        const layoutedNodes = autoLayout(nodes, edges, LayoutType.HIERARCHICAL, {
            nodeSpacing: 200, // 基础间距，会根据节点数量自动调整
            levelSpacing: 280, // 基础层级间距，会根据节点数量自动调整
            direction: 'LR' // 从左到右
        });

        console.log('布局完成，节点位置:', layoutedNodes.map(n => ({ id: n.id, position: n.position })));

        // 智能居中布局（考虑容器尺寸）
        const centeredNodes = centerLayout(layoutedNodes, containerSize);

        console.log('智能居中完成，最终位置:', centeredNodes.map(n => ({ id: n.id, position: n.position })));

        // 应用新位置（带动画效果）
        setNodes(centeredNodes);

        // 关闭工具面板
        setShowToolPanel(false);

        // 延迟执行智能缩放，确保节点位置更新完成
        setTimeout(async () => {
            try {
                console.log('开始智能缩放和居中...');

                // 使用智能缩放，自动计算最佳缩放比例
                const success = await smartFitView(reactFlowInstance, centeredNodes, {
                    duration: 1200, // 较长的动画时间，让用户看到整个过程
                    padding: 80, // 边距
                    minZoom: 0.2, // 最小缩放20%
                    maxZoom: 1.5 // 最大缩放150%
                });

                if (success) {
                    console.log('智能缩放和居中完成');
                } else {
                    console.warn('智能缩放失败，尝试备用方案');

                    // 备用方案：计算最佳缩放比例并手动设置
                    const optimalZoom = calculateOptimalZoom(centeredNodes, containerSize, 80);
                    const fallbackSuccess = await setZoomLevel(reactFlowInstance, optimalZoom, {
                        duration: 1000,
                        center: true
                    });

                    if (fallbackSuccess) {
                        console.log(`备用缩放完成，缩放比例: ${(optimalZoom * 100).toFixed(1)}%`);
                    } else {
                        console.error('备用缩放也失败了');
                    }
                }
            } catch (error) {
                console.error('智能缩放出错:', error);
            }
        }, 150); // 150ms延迟，确保节点位置更新完成
    }, [nodes, edges, setNodes, reactFlowInstance]);

    // 处理布局按钮点击
    const handleLayoutTriggerClick = useCallback(() => {
        if (nodes.length === 0) return;
        handleAutoLayout();
    }, [nodes.length, handleAutoLayout]);

    // 处理节点工具按钮点击
    const handleNodeToolClick = (nodeId: string, event: React.MouseEvent, handleType?: HandleType) => {
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
        setCurrentHandleType(handleType || null);
        // 设置拖拽源信息
        if (handleType) {
            setDragSourceNode({nodeId, handleType});
        }
        setShowNodeToolPanel(true);
        // 关闭主工具面板
        setShowToolPanel(false);
    };

    // 验证连接是否有效
    const isValidConnection = useCallback((connection: Connection) => {
        const { source, target } = connection;

        // 防止开始节点和结束节点直接连接
        if (source === 'start-node-initial' && target === 'end-node-initial') {
            return false;
        }

        // 防止结束节点和开始节点直接连接（反向）
        if (source === 'end-node-initial' && target === 'start-node-initial') {
            return false;
        }

        // 防止节点连接到自己
        if (source === target) {
            return false;
        }

        return true;
    }, []);

    // 处理连接创建
    const onConnect = useCallback(
        (params: Connection) => {
            if (isValidConnection(params)) {
                setEdges((eds) => addEdge(params, eds));
            }
        },
        [setEdges, isValidConnection]
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
                onToolClick: (event: React.MouseEvent, handleType?: HandleType) => handleNodeToolClick(nodeData.id, event, handleType)
            }
        };

        console.log('创建的新节点:', newNode);
        setNodes((nds) => {
            const updatedNodes = nds.concat(newNode);
            console.log('更新后的节点列表:', updatedNodes);
            return updatedNodes;
        });

    }, [setNodes]);

    // 查找最近的节点
    const findNearestNode = useCallback((position: { x: number; y: number }) => {
        if (nodes.length === 0) return null;

        let nearestNode = null;
        let minDistance = Infinity;

        nodes.forEach(node => {
            const distance = Math.sqrt(
                Math.pow(node.position.x - position.x, 2) +
                Math.pow(node.position.y - position.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestNode = node;
            }
        });

        // 只有距离在合理范围内才返回最近节点（比如300像素内）
        return minDistance < 300 ? nearestNode : null;
    }, [nodes]);

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

            // 查找最近的节点
            const nearestNode = findNearestNode(position);

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
                    onToolClick: (event: React.MouseEvent, handleType?: HandleType) => handleNodeToolClick(nodeId, event, handleType)
                },
            };

            // 创建新节点
            handleNodeCreate(nodeData, position);

            // 关闭节点工具面板（和点击逻辑一样）
            setShowNodeToolPanel(false);

            // 检查是否有拖拽源信息
            if (dragData.sourceNode && dragData.sourceNode.nodeId) {
                const sourceNodeId = dragData.sourceNode.nodeId;
                const handleType = dragData.sourceNode.handleType;

                let newEdge;
                if (handleType === 'output') {
                    // 从源节点的输出连接到新节点的输入
                    newEdge = {
                        id: `edge-${sourceNodeId}-${nodeId}`,
                        source: sourceNodeId,
                        target: nodeId,
                        animated: true,
                        style: { strokeWidth: 2 }
                    };
                } else if (handleType === 'input') {
                    // 从新节点的输出连接到源节点的输入
                    newEdge = {
                        id: `edge-${nodeId}-${sourceNodeId}`,
                        source: nodeId,
                        target: sourceNodeId,
                        animated: true,
                        style: { strokeWidth: 2 }
                    };
                }

                if (newEdge && isValidConnection(newEdge)) {
                    // 延迟添加边，确保新节点已经被添加到状态中
                    setTimeout(() => {
                        setEdges((eds) => eds.concat(newEdge));
                        // 清除拖拽源信息
                        setDragSourceNode(null);
                    }, 100);
                } else {
                    // 清除拖拽源信息，即使连接无效
                    setDragSourceNode(null);
                }
            } else if (nearestNode) {
                // 如果没有拖拽源信息，使用原来的逻辑（从最近节点的输出连接到新节点的输入）
                const newEdge = {
                    id: `edge-${nearestNode.id}-${nodeId}`,
                    source: nearestNode.id,
                    target: nodeId,
                    animated: true,
                    style: { strokeWidth: 2 }
                };

                // 验证连接是否有效
                if (isValidConnection(newEdge)) {
                    // 延迟添加边，确保新节点已经被添加到状态中
                    setTimeout(() => {
                        setEdges((eds) => eds.concat(newEdge));
                    }, 100);
                }
            }
        },
        [reactFlowInstance, handleNodeCreate, findNearestNode, setEdges]
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
            setDragSourceNode(null); // 清除拖拽源信息
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
                        isValidConnection={isValidConnection}
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
                <div className={styles.toolTriggerGroup}>
                    <div
                        ref={triggerRef}
                        className={`${styles.toolTrigger} ${showToolPanel ? styles.active : ''}`}
                        onClick={toggleToolPanel}
                        title="工具面板"
                    >
                        <span>+ 添加节点</span>
                    </div>

                    {/* 智能布局优化按钮 */}
                    <div
                        className={`${styles.layoutTrigger} ${nodes.length === 0 ? styles.disabled : ''}`}
                        onClick={handleLayoutTriggerClick}
                        title="智能整理布局（层次化排列，自动居中，智能缩放）"
                    >
                        <span>🎯 智能布局</span>
                    </div>
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
                            dragSourceInfo={dragSourceNode}
                            onToolClick={(tool) => {
                                // 点击工具后关闭节点面板
                                setShowNodeToolPanel(false);
                            }}
                            onNodeCreate={(nodeData, position) => {
                                // 获取当前节点信息
                                const currentNode = nodes.find(node => node.id === currentNodeId);
                                if (!currentNode) {
                                    handleNodeCreate(nodeData, position);
                                    setShowNodeToolPanel(false);
                                    return;
                                }

                                // 计算新节点位置
                                const offset = 380; // 偏移距离，大幅增加节点间距，避免重叠
                                let newPosition = position;

                                if (!newPosition) {
                                    // 根据Handle类型决定新节点位置
                                    if (currentHandleType === HandleType.OUTPUT) {
                                        // 右侧Handle，新节点放在右边
                                        newPosition = {
                                            x: currentNode.position.x + offset,
                                            y: currentNode.position.y
                                        };
                                    } else {
                                        // 左侧Handle，新节点放在左边
                                        newPosition = {
                                            x: currentNode.position.x - offset,
                                            y: currentNode.position.y
                                        };
                                    }
                                }

                                // 创建新节点
                                handleNodeCreate(nodeData, newPosition);

                                // 创建连接
                                if (currentHandleType === HandleType.OUTPUT) {
                                    // 从当前节点的输出连接到新节点的输入
                                    const newEdge = {
                                        id: `edge-${currentNodeId}-${nodeData.id}`,
                                        source: currentNodeId,
                                        target: nodeData.id,
                                        animated: true,
                                        style: { strokeWidth: 2 }
                                    };
                                    // 验证连接是否有效
                                    if (isValidConnection(newEdge)) {
                                        setEdges((eds) => eds.concat(newEdge));
                                    }
                                } else if (currentHandleType === HandleType.INPUT) {
                                    // 从新节点的输出连接到当前节点的输入
                                    const newEdge = {
                                        id: `edge-${nodeData.id}-${currentNodeId}`,
                                        source: nodeData.id,
                                        target: currentNodeId,
                                        animated: true,
                                        style: { strokeWidth: 2 }
                                    };
                                    // 验证连接是否有效
                                    if (isValidConnection(newEdge)) {
                                        setEdges((eds) => eds.concat(newEdge));
                                    }
                                }

                                setShowNodeToolPanel(false);
                                setDragSourceNode(null); // 清除拖拽源信息
                            }}
                        />
                    </div>
                )}
            </div>
        </ReactFlowProvider>
    );
};

export default AIFlow;
