# ToolPanel 工具面板组件

一个功能丰富的工具面板组件，支持分类展示、搜索过滤、自定义工具等功能。

## 功能特性

- 🔍 **搜索功能**: 支持按工具名称和描述搜索
- 📂 **分类展示**: 按类别组织工具，清晰易用
- 🎨 **自定义样式**: 支持自定义图标、颜色和样式
- 📱 **响应式设计**: 适配不同屏幕尺寸
- ⚡ **高性能**: 使用 useMemo 优化搜索性能
- 🛠️ **可扩展**: 支持自定义工具分类和点击事件

## 基本使用

```tsx
import React from 'react';
import { ToolPanel } from '@/components/TwelveT';

const MyComponent = () => {
  const handleToolClick = (tool) => {
    console.log('点击了工具:', tool);
  };

  return (
    <ToolPanel onToolClick={handleToolClick} />
  );
};
```

## 自定义工具分类

```tsx
import React from 'react';
import { ToolPanel, ToolCategory } from '@/components/TwelveT';

const customCategories: ToolCategory[] = [
  {
    id: 'my-tools',
    name: '我的工具',
    tools: [
      {
        id: 'tool-1',
        name: '工具1',
        icon: '🛠️',
        color: 'business',
        description: '这是工具1的描述',
        onClick: () => alert('点击了工具1'),
      },
    ],
  },
];

const MyComponent = () => {
  return (
    <ToolPanel 
      categories={customCategories}
      searchPlaceholder="搜索我的工具..."
    />
  );
};
```

## API

### ToolPanelProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| categories | ToolCategory[] | defaultCategories | 工具分类数据 |
| onToolClick | (tool: ToolItem) => void | - | 工具点击回调 |
| searchPlaceholder | string | '搜索节点、插件、工作流' | 搜索框占位符 |
| showSearch | boolean | true | 是否显示搜索框 |
| className | string | '' | 自定义类名 |
| style | React.CSSProperties | {} | 自定义样式 |

### ToolCategory

| 属性 | 类型 | 说明 |
|------|------|------|
| id | string | 分类唯一标识 |
| name | string | 分类名称 |
| tools | ToolItem[] | 工具列表 |

### ToolItem

| 属性 | 类型 | 说明 |
|------|------|------|
| id | string | 工具唯一标识 |
| name | string | 工具名称 |
| icon | string | 工具图标（支持 emoji 或文本） |
| color | string | 工具颜色类名 |
| description | string | 工具描述（可选） |
| onClick | () => void | 点击回调（可选） |

## 预定义颜色类

- `ai-model`: 黑色 (#000)
- `workflow`: 绿色 (#52c41a)
- `business`: 蓝色 (#1890ff)
- `code`: 青色 (#13c2c2)
- `input`: 紫色 (#722ed1)
- `output`: 紫色 (#722ed1)
- `database`: 橙色 (#fa8c16)
- `knowledge`: 橙色 (#fa8c16)

## 样式自定义

组件使用 Less 编写样式，可以通过覆盖 CSS 类来自定义样式：

```less
.tool-panel {
  // 自定义面板样式
  
  .tool-item {
    // 自定义工具项样式
    
    &:hover {
      // 自定义悬停效果
    }
  }
  
  .tool-icon {
    // 自定义图标样式
    
    &.my-custom-color {
      background-color: #your-color;
    }
  }
}
```

## 注意事项

1. 确保每个工具的 `id` 在同一分类中是唯一的
2. 图标建议使用 emoji 或简短文本，以保持视觉一致性
3. 工具描述会在鼠标悬停时显示为 tooltip
4. 组件支持键盘导航和无障碍访问
