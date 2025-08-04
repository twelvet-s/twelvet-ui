import {CustomNode as CustomNodeType, CustomEdge} from '../components/Nodes/types';

export enum LayoutType {
    HIERARCHICAL = 'hierarchical',
    GRID = 'grid',
    FORCE = 'force',
    CIRCULAR = 'circular'
}

interface LayoutOptions {
    nodeSpacing: number;
    levelSpacing: number;
    direction: 'TB' | 'LR' | 'BT' | 'RL';
}

const DEFAULT_OPTIONS: LayoutOptions = {
    nodeSpacing: 220, // 增加默认节点间距
    levelSpacing: 320, // 增加默认层级间距
    direction: 'TB'
};

/**
 * 层次化布局算法（优化版）
 * 基于节点的连接关系进行分层排列，支持循环依赖检测和智能分层
 */
function hierarchicalLayout(nodes: CustomNodeType[], edges: CustomEdge[], options: LayoutOptions): CustomNodeType[] {
    if (nodes.length === 0) return nodes;

    console.log('开始优化层次布局，节点数量:', nodes.length, '边数量:', edges.length, '选项:', options);

    // 构建邻接表和反向邻接表
    const adjacencyList = new Map<string, string[]>();
    const reverseAdjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();

    // 初始化
    nodes.forEach(node => {
        adjacencyList.set(node.id, []);
        reverseAdjacencyList.set(node.id, []);
        inDegree.set(node.id, 0);
        outDegree.set(node.id, 0);
    });

    // 构建图
    edges.forEach(edge => {
        const source = edge.source;
        const target = edge.target;

        if (adjacencyList.has(source) && inDegree.has(target)) {
            adjacencyList.get(source)!.push(target);
            reverseAdjacencyList.get(target)!.push(source);
            inDegree.set(target, (inDegree.get(target) || 0) + 1);
            outDegree.set(source, (outDegree.get(source) || 0) + 1);
        }
    });

    // 检测强连通分量（处理循环依赖）
    const stronglyConnectedComponents = findStronglyConnectedComponents(nodes, adjacencyList);
    console.log('强连通分量:', stronglyConnectedComponents);

    // 改进的拓扑排序分层
    const levels: string[][] = [];
    const visited = new Set<string>();
    const processing = new Set<string>();

    // 找到所有可能的起始节点（入度为0或在强连通分量中的代表节点）
    const startNodes: string[] = [];

    // 优先选择入度为0的节点
    nodes.forEach(node => {
        if (inDegree.get(node.id) === 0) {
            startNodes.push(node.id);
        }
    });

    // 如果没有入度为0的节点，从每个强连通分量中选择一个代表节点
    if (startNodes.length === 0) {
        stronglyConnectedComponents.forEach(component => {
            if (component.length > 0) {
                // 选择出度最大的节点作为代表
                const representative = component.reduce((max, nodeId) =>
                    (outDegree.get(nodeId) || 0) > (outDegree.get(max) || 0) ? nodeId : max
                );
                startNodes.push(representative);
            }
        });
    }

    // 如果仍然没有起始节点，选择第一个节点
    if (startNodes.length === 0 && nodes.length > 0) {
        startNodes.push(nodes[0].id);
    }

    // 使用BFS进行分层，但避免无限循环
    let currentLevel = [...startNodes];
    let maxLevels = nodes.length + 1; // 防止无限循环
    let levelCount = 0;

    while (currentLevel.length > 0 && levelCount < maxLevels) {
        const validCurrentLevel = currentLevel.filter(nodeId => !visited.has(nodeId));

        if (validCurrentLevel.length === 0) break;

        levels.push([...validCurrentLevel]);
        validCurrentLevel.forEach(nodeId => visited.add(nodeId));

        // 准备下一层
        const nextLevel = new Set<string>();
        validCurrentLevel.forEach(nodeId => {
            const children = adjacencyList.get(nodeId) || [];
            children.forEach(childId => {
                if (!visited.has(childId) && !processing.has(childId)) {
                    nextLevel.add(childId);
                }
            });
        });

        currentLevel = Array.from(nextLevel);
        levelCount++;
    }

    // 处理未访问的孤立节点和剩余节点
    const unvisitedNodes = nodes.filter(node => !visited.has(node.id));
    if (unvisitedNodes.length > 0) {
        // 将孤立节点按照一定规则分组
        const isolatedGroups = groupIsolatedNodes(unvisitedNodes, options.nodeSpacing);
        isolatedGroups.forEach(group => {
            levels.push(group.map(node => node.id));
        });
    }

    console.log('优化分层结果:', levels);

    // 计算新位置（改进的位置计算）
    const newNodes = nodes.map(node => ({ ...node }));
    const nodeMap = new Map(newNodes.map(node => [node.id, node]));

    // 智能调整间距
    const adjustedOptions = adjustSpacingForNodeCount(options, nodes.length, levels);

    levels.forEach((level, levelIndex) => {
        // 对每层内的节点进行排序，优化视觉效果
        const sortedLevel = sortNodesInLevel(level, nodeMap, adjacencyList, reverseAdjacencyList);

        sortedLevel.forEach((nodeId, nodeIndex) => {
            const node = nodeMap.get(nodeId);
            if (node) {
                if (adjustedOptions.direction === 'TB' || adjustedOptions.direction === 'BT') {
                    // 垂直布局
                    const totalWidth = Math.max(0, (sortedLevel.length - 1) * adjustedOptions.nodeSpacing);
                    const startX = -totalWidth / 2;

                    node.position = {
                        x: startX + nodeIndex * adjustedOptions.nodeSpacing,
                        y: adjustedOptions.direction === 'TB'
                            ? levelIndex * adjustedOptions.levelSpacing
                            : -levelIndex * adjustedOptions.levelSpacing
                    };
                } else {
                    // 水平布局（从左到右）
                    const totalHeight = Math.max(0, (sortedLevel.length - 1) * adjustedOptions.nodeSpacing);
                    const startY = -totalHeight / 2;

                    // 计算X位置，从左边开始，但整体居中
                    const totalLayoutWidth = Math.max(0, (levels.length - 1) * adjustedOptions.levelSpacing);
                    const layoutStartX = -totalLayoutWidth / 2;

                    node.position = {
                        x: layoutStartX + levelIndex * adjustedOptions.levelSpacing,
                        y: startY + nodeIndex * adjustedOptions.nodeSpacing
                    };
                }
            }
        });
    });

    console.log('优化位置计算完成:', newNodes.map(n => ({ id: n.id, position: n.position })));
    return newNodes;
}

/**
 * 查找强连通分量（Tarjan算法简化版）
 */
function findStronglyConnectedComponents(nodes: CustomNodeType[], adjacencyList: Map<string, string[]>): string[][] {
    const visited = new Set<string>();
    const stack: string[] = [];
    const components: string[][] = [];

    function dfs(nodeId: string, component: string[]) {
        if (visited.has(nodeId)) return;

        visited.add(nodeId);
        component.push(nodeId);

        const neighbors = adjacencyList.get(nodeId) || [];
        neighbors.forEach(neighborId => {
            if (!visited.has(neighborId)) {
                dfs(neighborId, component);
            }
        });
    }

    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            const component: string[] = [];
            dfs(node.id, component);
            if (component.length > 0) {
                components.push(component);
            }
        }
    });

    return components;
}

/**
 * 将孤立节点分组
 */
function groupIsolatedNodes(nodes: CustomNodeType[], nodeSpacing: number): CustomNodeType[][] {
    if (nodes.length === 0) return [];

    // 简单策略：每组最多5个节点
    const maxNodesPerGroup = Math.min(5, Math.ceil(Math.sqrt(nodes.length)));
    const groups: CustomNodeType[][] = [];

    for (let i = 0; i < nodes.length; i += maxNodesPerGroup) {
        groups.push(nodes.slice(i, i + maxNodesPerGroup));
    }

    return groups;
}

/**
 * 根据节点数量智能调整间距
 */
function adjustSpacingForNodeCount(options: LayoutOptions, nodeCount: number, levels: string[][]): LayoutOptions {
    const maxNodesInLevel = Math.max(...levels.map(level => level.length));

    // 根据节点数量动态调整间距
    let nodeSpacingMultiplier = 1;
    let levelSpacingMultiplier = 1;

    if (nodeCount > 20) {
        nodeSpacingMultiplier = 0.8; // 节点多时，减少间距
        levelSpacingMultiplier = 0.9;
    } else if (nodeCount < 5) {
        nodeSpacingMultiplier = 1.2; // 节点少时，增加间距
        levelSpacingMultiplier = 1.1;
    }

    // 如果某层节点太多，减少该方向的间距
    if (maxNodesInLevel > 8) {
        nodeSpacingMultiplier *= 0.7;
    }

    return {
        ...options,
        nodeSpacing: Math.max(150, options.nodeSpacing * nodeSpacingMultiplier),
        levelSpacing: Math.max(200, options.levelSpacing * levelSpacingMultiplier)
    };
}

/**
 * 对层内节点进行排序以优化视觉效果
 */
function sortNodesInLevel(
    level: string[],
    nodeMap: Map<string, CustomNodeType>,
    adjacencyList: Map<string, string[]>,
    reverseAdjacencyList: Map<string, string[]>
): string[] {
    if (level.length <= 1) return level;

    // 计算每个节点的"重要性"分数
    const nodeScores = new Map<string, number>();

    level.forEach(nodeId => {
        const outConnections = (adjacencyList.get(nodeId) || []).length;
        const inConnections = (reverseAdjacencyList.get(nodeId) || []).length;

        // 重要性 = 出度 * 2 + 入度（出度权重更高）
        const score = outConnections * 2 + inConnections;
        nodeScores.set(nodeId, score);
    });

    // 按重要性排序，重要的节点放在中间
    const sortedByScore = level.sort((a, b) => (nodeScores.get(b) || 0) - (nodeScores.get(a) || 0));

    // 重新排列：重要的节点放中间，次要的放两边
    const result: string[] = [];
    const center = Math.floor(sortedByScore.length / 2);

    sortedByScore.forEach((nodeId, index) => {
        if (index % 2 === 0) {
            // 偶数索引的节点放在中心右侧
            const position = center + Math.floor(index / 2);
            if (position < result.length) {
                result.splice(position, 0, nodeId);
            } else {
                result.push(nodeId);
            }
        } else {
            // 奇数索引的节点放在中心左侧
            const position = center - Math.floor(index / 2) - 1;
            if (position >= 0) {
                result.splice(position, 0, nodeId);
            } else {
                result.unshift(nodeId);
            }
        }
    });

    return result.length === level.length ? result : level; // 安全检查
}

/**
 * 网格布局算法
 */
function gridLayout(nodes: CustomNodeType[], options: LayoutOptions): CustomNodeType[] {
    if (nodes.length === 0) return nodes;

    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);

    return nodes.map((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        return {
            ...node,
            position: {
                x: col * options.nodeSpacing,
                y: row * options.nodeSpacing
            }
        };
    });
}

/**
 * 圆形布局算法
 */
function circularLayout(nodes: CustomNodeType[], options: LayoutOptions): CustomNodeType[] {
    if (nodes.length === 0) return nodes;
    if (nodes.length === 1) {
        return [{
            ...nodes[0],
            position: { x: 0, y: 0 }
        }];
    }

    const radius = Math.max(200, nodes.length * 30);
    const angleStep = (2 * Math.PI) / nodes.length;

    return nodes.map((node, index) => {
        const angle = index * angleStep;
        return {
            ...node,
            position: {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            }
        };
    });
}

/**
 * 力导向布局算法（简化版）
 */
function forceLayout(nodes: CustomNodeType[], edges: CustomEdge[], options: LayoutOptions): CustomNodeType[] {
    if (nodes.length === 0) return nodes;

    const newNodes = nodes.map(node => ({ ...node }));
    const iterations = 50;
    const repulsionStrength = 1000;
    const attractionStrength = 0.1;
    const damping = 0.9;

    // 初始化速度
    const velocities = new Map<string, {x: number, y: number}>();
    newNodes.forEach(node => {
        velocities.set(node.id, {x: 0, y: 0});
    });

    for (let iter = 0; iter < iterations; iter++) {
        // 计算斥力
        for (let i = 0; i < newNodes.length; i++) {
            for (let j = i + 1; j < newNodes.length; j++) {
                const node1 = newNodes[i];
                const node2 = newNodes[j];

                const dx = node1.position.x - node2.position.x;
                const dy = node1.position.y - node2.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                const force = repulsionStrength / (distance * distance);
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                const vel1 = velocities.get(node1.id)!;
                const vel2 = velocities.get(node2.id)!;

                vel1.x += fx;
                vel1.y += fy;
                vel2.x -= fx;
                vel2.y -= fy;
            }
        }

        // 计算引力（基于边连接）
        edges.forEach(edge => {
            const sourceNode = newNodes.find(n => n.id === edge.source);
            const targetNode = newNodes.find(n => n.id === edge.target);

            if (sourceNode && targetNode) {
                const dx = targetNode.position.x - sourceNode.position.x;
                const dy = targetNode.position.y - sourceNode.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                const force = attractionStrength * distance;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                const sourceVel = velocities.get(sourceNode.id)!;
                const targetVel = velocities.get(targetNode.id)!;

                sourceVel.x += fx;
                sourceVel.y += fy;
                targetVel.x -= fx;
                targetVel.y -= fy;
            }
        });

        // 更新位置
        newNodes.forEach(node => {
            const vel = velocities.get(node.id)!;
            node.position.x += vel.x;
            node.position.y += vel.y;

            // 应用阻尼
            vel.x *= damping;
            vel.y *= damping;
        });
    }

    return newNodes;
}

/**
 * 自动布局主函数
 */
export function autoLayout(
    nodes: CustomNodeType[],
    edges: CustomEdge[],
    layoutType: LayoutType = LayoutType.HIERARCHICAL,
    customOptions?: Partial<LayoutOptions>
): CustomNodeType[] {
    const options = { ...DEFAULT_OPTIONS, ...customOptions };

    switch (layoutType) {
        case LayoutType.HIERARCHICAL:
            return hierarchicalLayout(nodes, edges, options);
        case LayoutType.GRID:
            return gridLayout(nodes, options);
        case LayoutType.CIRCULAR:
            return circularLayout(nodes, options);
        case LayoutType.FORCE:
            return forceLayout(nodes, edges, options);
        default:
            return hierarchicalLayout(nodes, edges, options);
    }
}

/**
 * 智能居中布局 - 将所有节点移动到画布中心，考虑节点实际尺寸
 */
export function centerLayout(nodes: CustomNodeType[], viewportSize?: { width: number; height: number }): CustomNodeType[] {
    if (nodes.length === 0) return nodes;

    // 假设节点的标准尺寸（可以根据实际情况调整）
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 100;

    // 计算所有节点的实际边界框（考虑节点尺寸）
    const positions = nodes.map(n => n.position);
    const minX = Math.min(...positions.map(p => p.x)) - NODE_WIDTH / 2;
    const maxX = Math.max(...positions.map(p => p.x)) + NODE_WIDTH / 2;
    const minY = Math.min(...positions.map(p => p.y)) - NODE_HEIGHT / 2;
    const maxY = Math.max(...positions.map(p => p.y)) + NODE_HEIGHT / 2;

    console.log('居中前实际边界框:', { minX, maxX, minY, maxY });

    // 计算布局的实际尺寸
    const layoutWidth = maxX - minX;
    const layoutHeight = maxY - minY;
    const layoutCenterX = (minX + maxX) / 2;
    const layoutCenterY = (minY + maxY) / 2;

    console.log('布局信息:', {
        layoutWidth,
        layoutHeight,
        layoutCenterX,
        layoutCenterY,
        nodeCount: nodes.length
    });

    // 如果提供了视口尺寸，计算最佳居中位置
    let targetCenterX = 0;
    let targetCenterY = 0;

    if (viewportSize) {
        // 考虑视口尺寸的智能居中
        targetCenterX = 0; // 相对于视口中心
        targetCenterY = 0;

        // 如果布局太大，可能需要调整目标位置
        const padding = 100; // 边距
        if (layoutWidth > viewportSize.width - padding * 2) {
            // 布局宽度超出视口，保持水平居中
            targetCenterX = 0;
        }
        if (layoutHeight > viewportSize.height - padding * 2) {
            // 布局高度超出视口，保持垂直居中
            targetCenterY = 0;
        }
    }

    // 计算偏移量
    const offsetX = targetCenterX - layoutCenterX;
    const offsetY = targetCenterY - layoutCenterY;

    // 应用居中变换
    const centeredNodes = nodes.map(node => ({
        ...node,
        position: {
            x: node.position.x + offsetX,
            y: node.position.y + offsetY
        }
    }));

    console.log('居中后节点位置:', centeredNodes.map(n => ({ id: n.id, position: n.position })));

    // 验证居中效果
    const newPositions = centeredNodes.map(n => n.position);
    const newMinX = Math.min(...newPositions.map(p => p.x)) - NODE_WIDTH / 2;
    const newMaxX = Math.max(...newPositions.map(p => p.x)) + NODE_WIDTH / 2;
    const newMinY = Math.min(...newPositions.map(p => p.y)) - NODE_HEIGHT / 2;
    const newMaxY = Math.max(...newPositions.map(p => p.y)) + NODE_HEIGHT / 2;
    const newCenterX = (newMinX + newMaxX) / 2;
    const newCenterY = (newMinY + newMaxY) / 2;

    console.log('居中验证:', {
        newCenterX,
        newCenterY,
        targetCenterX,
        targetCenterY,
        centeringError: Math.sqrt(Math.pow(newCenterX - targetCenterX, 2) + Math.pow(newCenterY - targetCenterY, 2))
    });

    return centeredNodes;
}

/**
 * 自动缩放画布以适应所有节点
 * @param reactFlowInstance ReactFlow实例
 * @param options 缩放选项
 */
export function autoFitView(
    reactFlowInstance: any,
    options?: {
        padding?: number;
        duration?: number;
        minZoom?: number;
        maxZoom?: number;
    }
) {
    if (!reactFlowInstance) {
        console.warn('ReactFlow实例不存在，无法执行自动缩放');
        return Promise.resolve(false);
    }

    const defaultOptions = {
        padding: 50, // 默认边距50px
        duration: 800, // 动画持续时间800ms
        minZoom: 0.1, // 最小缩放比例
        maxZoom: 2, // 最大缩放比例
        ...options
    };

    console.log('开始自动缩放画布，选项:', defaultOptions);

    // 调用ReactFlow的fitView方法
    return reactFlowInstance.fitView({
        padding: defaultOptions.padding,
        duration: defaultOptions.duration,
        minZoom: defaultOptions.minZoom,
        maxZoom: defaultOptions.maxZoom,
        includeHiddenNodes: false, // 不包含隐藏节点
        ease: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // 缓动函数
        interpolate: 'smooth' as const // 平滑插值
    });
}

/**
 * 计算最佳缩放比例
 * @param nodes 节点数组
 * @param containerSize 容器尺寸
 * @param padding 边距
 */
export function calculateOptimalZoom(
    nodes: CustomNodeType[],
    containerSize: { width: number; height: number },
    padding: number = 100
): number {
    if (nodes.length === 0) return 1;

    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 100;

    // 计算布局边界
    const positions = nodes.map(n => n.position);
    const minX = Math.min(...positions.map(p => p.x)) - NODE_WIDTH / 2;
    const maxX = Math.max(...positions.map(p => p.x)) + NODE_WIDTH / 2;
    const minY = Math.min(...positions.map(p => p.y)) - NODE_HEIGHT / 2;
    const maxY = Math.max(...positions.map(p => p.y)) + NODE_HEIGHT / 2;

    const layoutWidth = maxX - minX;
    const layoutHeight = maxY - minY;

    // 计算可用空间（减去边距）
    const availableWidth = containerSize.width - padding * 2;
    const availableHeight = containerSize.height - padding * 2;

    // 计算两个方向的缩放比例
    const scaleX = availableWidth / layoutWidth;
    const scaleY = availableHeight / layoutHeight;

    // 选择较小的缩放比例，确保完全适应
    let optimalZoom = Math.min(scaleX, scaleY);

    // 限制缩放范围
    optimalZoom = Math.max(0.1, Math.min(2.0, optimalZoom));

    // 根据节点数量进行微调
    if (nodes.length > 20) {
        optimalZoom *= 0.9; // 节点多时稍微缩小
    } else if (nodes.length < 5) {
        optimalZoom = Math.min(1.2, optimalZoom * 1.1); // 节点少时稍微放大，但不超过120%
    }

    console.log('最佳缩放计算:', {
        layoutWidth,
        layoutHeight,
        availableWidth,
        availableHeight,
        scaleX,
        scaleY,
        optimalZoom,
        nodeCount: nodes.length
    });

    return optimalZoom;
}

/**
 * 智能缩放和居中 - 自动计算最佳缩放比例并居中显示
 * @param reactFlowInstance ReactFlow实例
 * @param nodes 节点数组
 * @param options 选项
 */
export function smartFitView(
    reactFlowInstance: any,
    nodes: CustomNodeType[],
    options?: {
        duration?: number;
        padding?: number;
        minZoom?: number;
        maxZoom?: number;
    }
): Promise<boolean> {
    if (!reactFlowInstance || nodes.length === 0) {
        console.warn('ReactFlow实例不存在或没有节点，无法执行智能缩放');
        return Promise.resolve(false);
    }

    const defaultOptions = {
        duration: 1200, // 较长的动画时间，让用户看到整个过程
        padding: 80, // 边距
        minZoom: 0.2, // 最小缩放20%
        maxZoom: 1.5, // 最大缩放150%
        ...options
    };

    try {
        // 获取容器尺寸
        const container = reactFlowInstance.getContainer?.();
        const containerWidth = container?.clientWidth || 800;
        const containerHeight = container?.clientHeight || 600;

        // 计算最佳缩放比例
        const optimalZoom = calculateOptimalZoom(
            nodes,
            { width: containerWidth, height: containerHeight },
            defaultOptions.padding
        );

        // 限制在指定范围内
        const finalZoom = Math.max(defaultOptions.minZoom, Math.min(defaultOptions.maxZoom, optimalZoom));

        console.log(`智能缩放: 最佳比例 ${(optimalZoom * 100).toFixed(1)}%, 最终比例 ${(finalZoom * 100).toFixed(1)}%`);

        // 使用ReactFlow的fitView方法，它会自动居中并缩放
        return reactFlowInstance.fitView({
            padding: defaultOptions.padding,
            duration: defaultOptions.duration,
            minZoom: finalZoom * 0.9, // 稍微放宽下限
            maxZoom: finalZoom * 1.1, // 稍微放宽上限
            includeHiddenNodes: false,
        });

    } catch (error) {
        console.error('智能缩放出错:', error);
        return Promise.resolve(false);
    }
}

/**
 * 设置画布缩放到指定比例（优化版）
 * @param reactFlowInstance ReactFlow实例
 * @param zoomLevel 缩放比例 (例如: 0.5 表示50%)
 * @param options 缩放选项
 */
export function setZoomLevel(
    reactFlowInstance: any,
    zoomLevel: number,
    options?: {
        duration?: number;
        center?: boolean;
    }
): Promise<boolean> {
    if (!reactFlowInstance) {
        console.warn('ReactFlow实例不存在，无法执行缩放');
        return Promise.resolve(false);
    }

    const defaultOptions = {
        duration: 800,
        center: true,
        ...options
    };

    console.log(`设置画布缩放到 ${(zoomLevel * 100).toFixed(1)}%，选项:`, defaultOptions);

    try {
        if (defaultOptions.center) {
            // 获取所有节点
            const nodes = reactFlowInstance.getNodes();
            if (nodes.length > 0) {
                // 使用智能缩放，但强制使用指定的缩放比例
                const container = reactFlowInstance.getContainer?.();
                const containerWidth = container?.clientWidth || 800;
                const containerHeight = container?.clientHeight || 600;

                // 计算节点边界
                const NODE_WIDTH = 200;
                const NODE_HEIGHT = 100;
                const positions = nodes.map((n: any) => n.position);
                const minX = Math.min(...positions.map((p: any) => p.x)) - NODE_WIDTH / 2;
                const maxX = Math.max(...positions.map((p: any) => p.x)) + NODE_WIDTH / 2;
                const minY = Math.min(...positions.map((p: any) => p.y)) - NODE_HEIGHT / 2;
                const maxY = Math.max(...positions.map((p: any) => p.y)) + NODE_HEIGHT / 2;

                const layoutCenterX = (minX + maxX) / 2;
                const layoutCenterY = (minY + maxY) / 2;

                // 计算居中位置
                const x = containerWidth / 2 - layoutCenterX * zoomLevel;
                const y = containerHeight / 2 - layoutCenterY * zoomLevel;

                // 设置视图位置和缩放
                return reactFlowInstance.setViewport(
                    { x, y, zoom: zoomLevel },
                    { duration: defaultOptions.duration }
                );
            }
        }

        // 如果不需要居中或没有节点，直接设置缩放
        const currentViewport = reactFlowInstance.getViewport();
        return reactFlowInstance.setViewport(
            { ...currentViewport, zoom: zoomLevel },
            { duration: defaultOptions.duration }
        );
    } catch (error) {
        console.error('设置画布缩放出错:', error);
        return Promise.resolve(false);
    }
}
