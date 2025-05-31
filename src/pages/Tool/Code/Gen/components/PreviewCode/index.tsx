import React, { useState, useEffect, ReactElement, useRef } from 'react';
import { Button, Col, Modal, Row, Tree, message } from 'antd';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import { getInfo } from './service';
import { system } from '@/utils/twelvet';
import { CopyOutlined, DownOutlined, FileTextOutlined } from '@ant-design/icons';

type treeType = {
    title: string;
    code?: string;
    key: string;
    codePath?: string;
    fileName?: string;
    children: treeType[];
    icon?: ReactElement;
};

/**
 * 字典模块数据管理
 */
const PreviewCode: React.FC<{
    info: {
        tableId: number;
        visible: boolean;
    };
    onClose: () => void;
}> = (props) => {
    const { info, onClose } = props;

    const [codeData, setCodeData] = useState<treeType[]>([]);

    const [aceValue, setAceValue] = useState<string>('');

    const editorRef = useRef<any>();

    const handleCopyClick = () => {
        // 获取编辑器的内容
        const content = editorRef.current?.editor.getValue();
        // 将内容复制到剪切板
        navigator.clipboard.writeText(content).then(
            () => {
                message.success('Success to Copy');
            },
            (err) => {
                message.error(`Failed to Copy：${err}`);
            },
        );
    };

    /**
     * 获取信息
     * @returns
     */
    const refGetInfo = async (tableId: number) => {
        try {
            const { data } = await getInfo(tableId);

            const result: treeType[] = [];

            data.forEach((item: { code: string; codePath: string }) => {
                const pathParts = item.codePath.replace(/\\/g, '/').replace(/\/+/g, '/').split('/');
                let currentLevel = result;
                for (let i = 0; i < pathParts.length - 1; i++) {
                    if (!currentLevel.some((child) => child.title === pathParts[i])) {
                        currentLevel.push({
                            title: pathParts[i],
                            key: `${i}-${Math.random().toString(36).substring(2, 8)}`,
                            children: [],
                        });
                    }

                    currentLevel = currentLevel.find(
                        (child) => child.title === pathParts[i],
                    )!.children;
                }
                if (!aceValue) {
                    setAceValue(item.code);
                }
                currentLevel.push({
                    title: pathParts[pathParts.length - 1],
                    key: `${pathParts.length - 1}-${Math.random().toString(36).substring(2, 8)}`,
                    icon: <FileTextOutlined />,
                    children: [],
                    code: item.code,
                });
            });

            setCodeData(result);
        } catch (e) {
            system.error(e);
        }
    };

    /**
     * 初始化数据信息
     */
    useEffect(() => {
        if (info.tableId !== 0) {
            refGetInfo(info.tableId);
        }
    }, [info.tableId]);

    return (
        <Modal
            title={`代码预览`}
            width={'90%'}
            open={info.visible}
            onCancel={() => {
                setAceValue('');
                onClose();
            }}
            footer={null}
        >
            <Row>
                <Col sm={8} xs={24}>
                    <Tree
                        showIcon
                        defaultSelectedKeys={['0-0-0']}
                        switcherIcon={<DownOutlined />}
                        treeData={codeData}
                        defaultExpandAll={true}
                        onSelect={(_, e) => {
                            if (e.node.code) {
                                setAceValue(e.node.code);
                            }
                        }}
                    />
                </Col>

                <Col sm={16} xs={24}>
                    <div
                        style={{
                            position: 'relative',
                        }}
                    >
                        <AceEditor
                            ref={editorRef}
                            mode={'java'}
                            theme={'monokai'}
                            name="templateEditor"
                            width={'100%'}
                            height={'600px'}
                            fontSize={16}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            value={aceValue}
                            // 是否只读
                            readOnly={true}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 2,
                            }}
                        />
                        <Button
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 35,
                            }}
                            onClick={handleCopyClick}
                        >
                            <CopyOutlined />
                        </Button>
                    </div>
                </Col>
            </Row>
        </Modal>
    );
};

export default PreviewCode;
