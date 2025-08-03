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
 * 层次化布局算法
 * 基于节点的连接关系进行分层排列
 */
function hierarchicalLayout(nodes: CustomNodeType[], edges: CustomEdge[], options: LayoutOptions): CustomNodeType[] {
    if (nodes.length === 0) return nodes;

    console.log('开始层次布局，节点数量:', nodes.length, '边数量:', edges.length, '选项:', options);

    // 构建邻接表
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // 初始化
    nodes.forEach(node => {
        adjacencyList.set(node.id, []);
        inDegree.set(node.id, 0);
    });

    // 构建图
    edges.forEach(edge => {
        const source = edge.source;
        const target = edge.target;

        if (adjacencyList.has(source) && inDegree.has(target)) {
            adjacencyList.get(source)!.push(target);
            inDegree.set(target, (inDegree.get(target) || 0) + 1);
        }
    });

    // 拓扑排序分层
    const levels: string[][] = [];
    const queue: string[] = [];
    const visited = new Set<string>();

    // 找到所有入度为0的节点作为第一层
    nodes.forEach(node => {
        if (inDegree.get(node.id) === 0) {
            queue.push(node.id);
        }
    });

    // 如果没有入度为0的节点，选择第一个节点作为起始点
    if (queue.length === 0 && nodes.length > 0) {
        queue.push(nodes[0].id);
    }

    // 分层处理
    while (queue.length > 0) {
        const currentLevel: string[] = [];
        const nextQueue: string[] = [];

        // 处理当前层的所有节点
        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            if (!visited.has(nodeId)) {
                visited.add(nodeId);
                currentLevel.push(nodeId);

                // 将子节点加入下一层队列
                const children = adjacencyList.get(nodeId) || [];
                children.forEach(childId => {
                    if (!visited.has(childId)) {
                        nextQueue.push(childId);
                    }
                });
            }
        }

        if (currentLevel.length > 0) {
            levels.push(currentLevel);
        }

        // 准备处理下一层
        queue.push(...nextQueue);
    }

    // 处理未访问的孤立节点
    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            levels.push([node.id]);
        }
    });

    console.log('分层结果:', levels);

    // 计算新位置
    const newNodes = nodes.map(node => ({ ...node }));
    const nodeMap = new Map(newNodes.map(node => [node.id, node]));

    // 计算整个布局的尺寸，用于居中
    const totalLevels = levels.length;
    const maxNodesInLevel = Math.max(...levels.map(level => level.length));

    levels.forEach((level, levelIndex) => {
        level.forEach((nodeId, nodeIndex) => {
            const node = nodeMap.get(nodeId);
            if (node) {
                if (options.direction === 'TB' || options.direction === 'BT') {
                    // 垂直布局
                    const totalWidth = (level.length - 1) * options.nodeSpacing;
                    const startX = -totalWidth / 2;

                    node.position = {
                        x: startX + nodeIndex * options.nodeSpacing,
                        y: options.direction === 'TB'
                            ? levelIndex * options.levelSpacing
                            : -levelIndex * options.levelSpacing
                    };
                } else {
                    // 水平布局（从左到右）
                    const totalHeight = (level.length - 1) * options.nodeSpacing;
                    const startY = -totalHeight / 2;

                    // 计算X位置，从左边开始，但整体居中
                    const totalLayoutWidth = (totalLevels - 1) * options.levelSpacing;
                    const layoutStartX = -totalLayoutWidth / 2;

                    node.position = {
                        x: layoutStartX + levelIndex * options.levelSpacing,
                        y: startY + nodeIndex * options.nodeSpacing
                    };
                }
            }
        });
    });

    console.log('位置计算完成:', newNodes.map(n => ({ id: n.id, position: n.position })));
    return newNodes;
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
 * 居中布局 - 将所有节点移动到画布中心
 */
export function centerLayout(nodes: CustomNodeType[]): CustomNodeType[] {
    if (nodes.length === 0) return nodes;

    // 计算所有节点的边界框
    const positions = nodes.map(n => n.position);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));

    console.log('居中前边界框:', { minX, maxX, minY, maxY });

    // 计算布局的中心点
    const layoutCenterX = (minX + maxX) / 2;
    const layoutCenterY = (minY + maxY) / 2;

    console.log('布局中心点:', { layoutCenterX, layoutCenterY });

    // 将布局中心移动到坐标原点(0, 0)
    const centeredNodes = nodes.map(node => ({
        ...node,
        position: {
            x: node.position.x - layoutCenterX,
            y: node.position.y - layoutCenterY
        }
    }));

    console.log('居中后节点位置:', centeredNodes.map(n => ({ id: n.id, position: n.position })));
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
