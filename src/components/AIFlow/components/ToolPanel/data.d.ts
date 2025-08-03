import React from "react";

export interface ToolItem {
    id: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
    onClick?: () => void;
}

export interface ToolCategory {
    id: string;
    name: string;
    tools: ToolItem[];
}

export interface ToolPanelProps {
    categories?: ToolCategory[];
    onToolClick?: (tool: ToolItem) => void;
    searchPlaceholder?: string;
    showSearch?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export interface ToolPanelState {
    searchValue: string;
    filteredCategories: ToolCategory[];
}
