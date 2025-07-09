import React, { useEffect, useState } from 'react';
import { message, Switch } from 'antd';
import { system } from '@/utils/twelvet';
import { changeStatus } from '../service';

/**
 * 状态组件操作
 * @param props row 参数
 */
const StatusSwitch: React.FC<{
    row: Record<string, any>;
}> = (props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [checked, setChecked] = useState<boolean>(props.row.defaultFlag);

    useEffect(() => {
        setChecked(props.row.defaultFlag);
    }, [props.row.defaultFlag]);

    const toggle = async () => {
        try {
            setLoading(true);
            const params: { modelId: number; defaultFlag: boolean } = {
                modelId: 0,
                defaultFlag: false,
            };
            params.modelId = props.row.modelId;
            params.defaultFlag = !checked;
            const { code, msg } = await changeStatus(params);

            if (code !== 200) {
                return message.error(msg);
            }

            if (checked) {
                setChecked(false);
            } else {
                setChecked(true);
            }

            return message.success(msg);
        } catch (e) {
            system.log(e);
        } finally {
            setLoading(false);
        }
    };

    return <Switch loading={loading} onClick={toggle} checked={checked} />;
};

export default StatusSwitch;
