import React, {useEffect, useState} from 'react'
import {message, Upload, Modal, Button} from 'antd'
import {system} from '@/utils/twelvet'
import {InboxOutlined} from '@ant-design/icons'
import styles from './index.less'
import type {RcFile} from 'antd/lib/upload'
import {uploadFile} from './service'

const ImportDFS: React.FC<{
    visible: boolean
    onCancel: () => void
    ok: () => void
}> = props => {

    const onCancel = props.onCancel

    const [files, setFiles] = useState<RcFile[]>([])

    const [visibleModal, setVisibleModal] = useState<boolean>(false)

    const [uploadLoading, setUploadLoading] = useState<boolean>(false)

    const {Dragger} = Upload

    useEffect(() => {
        setVisibleModal(props.visible)
    }, [props.visible])

    /**
     * 上传数据
     */
    const handleUpload = async () => {
        try {

            if (files.length <= 0) {
                return message.warning('请先选择需上传的图片')
            }

            setUploadLoading(true)

            // 表单数据
            const formData = new FormData();

            // 添加数据源
            files.forEach((file: RcFile) => {
                formData.append('files', file);
            });

            const {code, msg} = await uploadFile(formData)

            if (code !== 200) {
                return message.error(msg)
            }

            message.success(msg)

            // 初始化数据
            setFiles([])

            // 取消模态框
            props.onCancel()

            // 刷新页面
            props.ok()
        } catch (e) {
            system.error(e)
        } finally {
            setUploadLoading(false)
        }

    }

    return (
        <>
            <Modal
                title='文件上传'
                open={visibleModal}
                okText="上传"
                onCancel={onCancel}
                footer={[
                    <Button key={"cancel"} type="default" onClick={onCancel}>
                        取消
                    </Button>,
                    <Button key={"ok"} loading={uploadLoading} type="primary" onClick={handleUpload}>
                        开始上传
                    </Button>,
                ]}
            >
                <Dragger
                    // 列表显示模式
                    listType="text"
                    name="files"
                    // 支持多文件上传
                    multiple
                    // 文件列表
                    fileList={files}
                    onChange={(info: any) => {
                        const fileList: any[] = info.fileList

                        const filesTemp: any[] = []

                        fileList.forEach((file: {
                            originFileObj: RcFile
                        }) => {
                            if (file.originFileObj) {
                                filesTemp.push(file.originFileObj)
                            } else {
                                filesTemp.push(file)
                            }

                        })

                        setFiles(filesTemp)
                    }}
                    // 限制上传文件
                    beforeUpload={() => {
                        // 不允许直接上传, 手动操作
                        return false
                    }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">
                        将文件拖拽到此处，或<span className={styles.clickColor}>点击上传</span>
                    </p>
                </Dragger>

            </Modal>
        </>
    )
}

export default ImportDFS
