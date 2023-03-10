import React, { useEffect, useState } from 'react'
import { message, Modal, Upload as UploadAntd } from 'antd'
import { UploadType } from './data'
import TWT from '@/setting'
import { UploadChangeParam } from 'antd/lib/upload'
import { RcFile, UploadFile } from 'antd/lib/upload/interface'
import ImgCrop from 'antd-img-crop'

/**
 * 上传组件
 */
const Upload: React.FC<UploadType> = (props) => {

    const [state, setState] = useState<{
        previewImage: string,
        previewVisible: boolean,
        files: any[]
    }>({
        previewImage: '',
        previewVisible: false,
        files: []
    })

    useEffect(() => {
        const { images } = props
        if (images && images?.length > 0) {
            const list: any = images.map((file: string) => {
                return {
                    uid: '-1',
                    name: `${TWT.static}${file}`,
                    status: 'done',
                    url: `${TWT.static}${file}`,
                }
            })
            setState({
                ...state,
                files: list
            })
        }
    }, [props])

    /**
     * 获取文件流
     * @param file
     */
    const getBase64 = (file: Blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    /**
     * 查看文件详情
     * @param file
     */
    const handlePreview = async (file: any) => {

        console.log(file)

        if (props.listType && props.listType !== 'picture-card') {
            return false
        }

        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        setState({
            ...state,
            previewImage: file.url || file.preview,
            previewVisible: true,
            // previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
    };

    /**
     * 上传后
     * @param param
     */
    const handleChange = (info: UploadChangeParam<UploadFile>) => {
        setState({
            ...state,
            files: info.fileList
        })
    }

    const { previewVisible, previewImage, files } = state

    const { maxCount, action, listType, title, name, accept, imgCrop = false } = props

    const local = localStorage.getItem(TWT.accessToken);

    const { access_token } = local ? JSON.parse(local) : { access_token: '' };

    const upload = (
        <UploadAntd
            headers={{
                Authorization: `Bearer ${access_token}`
            }}
            accept={accept}
            method='POST'
            name={name ? name : 'file'}
            fileList={state.files}
            // 最大上传数量
            maxCount={maxCount}
            listType={listType ? listType : 'picture-card'}
            action={`${action}`}
            // 查看触发
            onPreview={handlePreview}
            // 处理文件上传完成后
            onChange={handleChange}
        >
            {/* 小于可上数显示上传按钮 */}
            {files.length < maxCount && (title ? title : 'upload')}
        </UploadAntd>
    )

    return (
        <>
            {
                imgCrop && (
                    <ImgCrop {...{
                        modalTitle: `剪裁`,
                        rotate: true,
                        grid: true
                    }}>
                        {upload}
                    </ImgCrop>
                )
            }

            {
                !imgCrop && (
                    upload
                )
            }

            <Modal
                open={previewVisible}
                title={'详情'}
                footer={null}
                onCancel={() => {
                    setState({ ...state, previewVisible: false })
                }}
            >
                <img alt="example" style={{ width: '100%' }} src={previewImage.indexOf("http") !== -1 ? previewImage : `${TWT.static}${previewImage}`} />
            </Modal>
        </>
    )

}

export default Upload
