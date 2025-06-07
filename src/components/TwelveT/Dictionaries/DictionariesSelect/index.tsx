import React, { useEffect, useState } from 'react';
import { message, Select } from 'antd';
import { getDictionariesType } from './service';
import { system } from '@/utils/twelvet';

/**
 * 字典模块数据管理类型选择器
 */
const DictionariesSelect: React.FC<{
    type: string;
    mode?: 'multiple' | 'tags' | undefined;
    onChange?: (value: any) => void;
}> = (props) => {
    const { Option } = Select;

    const [treeData, setTreeData] = useState<any>([]);

    const { type, mode } = props;

    const makeTree = async () => {
        try {
            const { code, msg, data } = await getDictionariesType(type);
            if (code !== 200) {
                return message.error(msg);
            }

            // 制作数据
            const tree: any = [];
            data.map((item: { dictCode: number; dictValue: string; dictLabel: string }) => {
                tree.push(
                    <Option key={item.dictCode} value={item.dictValue}>
                        {item.dictLabel}
                    </Option>,
                );
                return false;
            });

            setTreeData(tree);
        } catch (e) {
            system.error(e);
        }
    };

    useEffect(() => {
        makeTree();
    }, []);

    return (
        <Select {...props} mode={mode} placeholder="请选择" showSearch allowClear>
            {treeData}
        </Select>
    );
};

export default DictionariesSelect;
