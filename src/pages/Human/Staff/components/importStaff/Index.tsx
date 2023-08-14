import React, { useEffect, useState } from 'react'
import { message, Upload, Modal, Checkbox, Button } from 'antd'
import { system } from '@/utils/twelvet'
import { InboxOutlined } from '@ant-design/icons'
import styles from './index.less'
import type { RcFile } from 'antd/lib/upload'
import { importData, exportTemplate } from './../../service'

const DeptSearch: React.FC<{
    visible: boolean
    onCancel: () => void
    ok: () => void
}> = props => {

    const onCancel = props.onCancel

    const [excelFiles, setExcelFiles] = useState<RcFile[]>([])

    const [visibleModal, setVisibleModal] = useState<boolean>(false)

    const [cover, setCover] = useState<boolean>(false)

    const [uploadLoading, setUploadLoading] = useState<boolean>(false)

    const { Dragger } = Upload

    useEffect(() => {
        setVisibleModal(props.visible)
    }, [props.visible])

    /**
     * 上传数据
     */
    const handleUpload = async () => {
        try {

            setUploadLoading(true)

            // 表单数据
            const formData = new FormData();

            // 添加Excel数据源
            // excelFiles.forEach((file: RcFile) => {
            //     formData.append('files', file);
            // });
            formData.append('file', excelFiles[0])

            // 设置是否覆盖参数
            formData.append('cover', `${cover}`)

            const { code, msg } = await importData(formData)
            if (code !== 200) {
                return message.error(msg)
            }
            message.success(msg)

            // 初始化数据
            setExcelFiles([])

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
                title='导入数据'
                open={visibleModal}
                okText="上传"
                onCancel={onCancel}
                footer={[
                    <Button key={'cancel'} type="default" onClick={onCancel}>
                        取消
                    </Button>,
                    <Button key={'download'} type="primary" onClick={() => exportTemplate()}>
                        下载模板
                    </Button>,
                    <Button key={'upload'} loading={uploadLoading} type="primary" onClick={handleUpload}>
                        开始上传
                    </Button>,
                ]}
            >
                <Dragger
                    // 列表显示模式
                    listType="text"
                    // 设置默认可选择支持上传的文件类型
                    accept="
                    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                    application/vnd.ms-excel"
                    name="staff"
                    // 支持多文件上传
                    // multiple
                    // 文件列表
                    fileList={excelFiles}
                    onChange={(info) => {
                        const fileList: any[] = info.fileList

                        let files: any[] = []

                        fileList.forEach((file: {
                            type: string
                            name: string
                            originFileObj: RcFile
                        }) => {
                            if (
                                // xls
                                file.type === 'application/vnd.ms-excel'
                                ||
                                // xlsx
                                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            ) {
                                // 加入数组
                                if (file.originFileObj) {
                                    // files.push(file.originFileObj)
                                    files = [file.originFileObj]
                                } else {
                                    // files.push(file)
                                    files = [file]
                                }
                            } else {
                                message.error(`${file.name} is not a Excel file`)
                            }

                        })

                        setExcelFiles(files)
                    }}
                    // 继续限制上传文件
                    beforeUpload={() => {
                        // 不允许直接上传, 手动操作
                        return false
                    }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                        将文件拖拽到此处，或<span className={styles.clickColr}>点击上传</span>
                    </p>
                    <p className="ant-upload-hint">
                        <span className={styles.tip}>
                            提示：仅允许导入"xls"、"xlsx"格式文件！
                        </span>
                    </p>
                </Dragger>

                <Checkbox
                    onChange={(e) => {
                        setCover(e.target.checked)
                    }}
                >
                    是否更新已经存在的用户数据
                </Checkbox>

            </Modal>
        </>
    )
}

export default DeptSearch
