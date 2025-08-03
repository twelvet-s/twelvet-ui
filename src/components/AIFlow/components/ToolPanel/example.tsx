import React from 'react';
import { message } from 'antd';
import ToolPanel from './index';
import { ToolItem, ToolCategory } from './data';

/**
 * 工具面板使用示例
 */
const ToolPanelExample: React.FC = () => {
  // 自定义工具分类（可选）
  const customCategories: ToolCategory[] = [
    {
      id: 'custom',
      name: '自定义工具',
      tools: [
        {
          id: 'custom-tool-1',
          name: '自定义工具1',
          icon: '🛠️',
          color: 'business',
          description: '这是一个自定义工具示例',
          onClick: () => {
            message.success('点击了自定义工具1');
          },
        },
        {
          id: 'custom-tool-2',
          name: '自定义工具2',
          icon: '⚙️',
          color: 'workflow',
          description: '这是另一个自定义工具示例',
        },
      ],
    },
  ];

  // 处理工具点击事件
  const handleToolClick = (tool: ToolItem) => {
    console.log('点击了工具:', tool);
    message.info(`点击了工具: ${tool.name}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>工具面板示例</h2>

      <div style={{ marginBottom: '40px' }}>
        <h3>默认工具面板</h3>
        <div style={{ width: '600px', height: '500px', overflow: 'auto' }}>
          <ToolPanel onToolClick={handleToolClick} />
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3>自定义工具面板</h3>
        <div style={{ width: '400px', height: '300px', overflow: 'auto' }}>
          <ToolPanel
            categories={customCategories}
            onToolClick={handleToolClick}
            searchPlaceholder="搜索自定义工具..."
          />
        </div>
      </div>

      <div>
        <h3>无搜索框的工具面板</h3>
        <div style={{ width: '500px', height: '400px', overflow: 'auto' }}>
          <ToolPanel
            showSearch={false}
            onToolClick={handleToolClick}
          />
        </div>
      </div>
    </div>
  );
};

export default ToolPanelExample;
