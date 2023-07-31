import React, { useEffect, useState } from 'react';
import { message, Modal, Upload as UploadAntd } from 'antd';
import { UploadType } from './data';
import TWT from '@/setting';
import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import ImgCrop from 'antd-img-crop';
import { getCurrentUser } from '@/pages/Login/service';

/**
 * 上传组件
 */
const Upload: React.FC<UploadType> = (props) => {
    const [state, setState] = useState<{
        previewImage: string;
        previewVisible: boolean;
        files: any[];
    }>({
        previewImage: '',
        previewVisible: false,
        files: [],
    });

    const { previewVisible, previewImage, files } = state;

    const { maxCount, action, listType, title, name, accept, imgCrop = false } = props;

    const local = localStorage.getItem(TWT.accessToken);

    let { access_token } = local ? JSON.parse(local) : { access_token: '' };

    useEffect(() => {
        const { images, value } = props;
        if (value) {
            setState({
                ...state,
                files: [{
                    uid: '-1',
                    name: `${TWT.static}${value}`,
                    status: 'done',
                    url: `${TWT.static}${value}`,
                    thumbUrl: `${TWT.static}${value}`,
                }],
            });
        } else if (images && images?.length > 0) {
            const list: any = images.map((file: string) => {
                return {
                    uid: '-1',
                    name: `${TWT.static}${file}`,
                    status: 'done',
                    url: `${TWT.static}${file}`,
                    thumbUrl: `${TWT.static}${file}`,
                };
            });
            setState({
                ...state,
                files: list,
            });
        }
    }, [props]);

    /**
     * 查看文件详情
     * @param file
     */
    const handlePreview = async (file: any) => {
        setState({
            ...state,
            previewImage: file.thumbUrl,
            previewVisible: true,
            // previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
    };

    /**
     * 处理发生改变
     * @param param
     */
    const handleChange = async ({ fileList }: UploadChangeParam<UploadFile>) => {
        // 获取最后一张文件
        const file: Array<UploadFile> = fileList.slice(-1);

        if (file.length > 0 && file[0].response) {
            const uploadFile: UploadFile = file[0];
            const { code, msg, imgUrl, data } = uploadFile.response;

            const imgPath = imgUrl ? imgUrl : data;

            // 续签失败将要求重新登录
            if (code === 401) {
                // 续签
                await getCurrentUser();
            }

            if (code === 200) {
                fileList.map((f) => {
                    if (f.uid !== uploadFile.uid) {
                        return f;
                    }
                    // 设置文件url
                    f.url = `${TWT.static}${imgPath}`;
                    f.thumbUrl = `${TWT.static}${imgPath}`;
                    return f;
                });

                // 存在Form事件将改变值
                if (props.onChange) {
                    if (props.maxCount === 1) {
                        // 单文件将直接设置为当前响应地址
                        props.onChange(imgPath);
                    } else {
                        const values = fileList.map((v) => {
                            return v.url;
                        });

                        props.onChange(values);
                    }
                }

                // 上传成功后需要执行的方法
                if (props.success) {
                    props.success();
                }

                message.success(msg);
            } else {
                fileList.map((f) => {
                    if (f.uid !== uploadFile.uid) {
                        return f;
                    }
                    // 将状态改为错误
                    f.status = 'error';
                    return f;
                });
                if (code === 401) {
                    message.error('Token过期，已续签，请重新上传');
                } else {
                    message.error(msg);
                }
            }
        }

        // 数据为空时需清空数据
        if (fileList.length === 0) {
            if (props.onChange) {
                if (props.maxCount === 1) {
                    if (fileList.length === 0) {
                        // 清空数据
                        props.onChange();
                    }
                } else {
                    props.onChange([]);
                }
            }
        }

        // 需要不断设置，不然无法感知变化
        setState({
            ...state,
            files: fileList,
        });
    };

    const upload = (
        <UploadAntd
            headers={{
                Authorization: `Bearer ${access_token}`,
            }}
            accept={accept}
            method="POST"
            name={name ? name : 'file'}
            fileList={state.files}
            // 最大上传数量
            maxCount={maxCount}
            listType={listType ? listType : 'picture-card'}
            action={`${action}`}
            // 查看触发
            onPreview={handlePreview}
            // 处理文件上传完成后，onChange只执行问题：https://github.com/ant-design/ant-design/issues/2423
            onChange={handleChange}
        >
            {/* 小于可上数显示上传按钮 */}
            {files.length < maxCount && (title ? title : 'upload')}
        </UploadAntd>
    );

    return (
        <>
            {imgCrop && (
                <ImgCrop
                    {...{
                        modalTitle: `剪裁`,
                        rotationSlider: true,
                        showGrid: true,
                    }}
                >
                    {upload}
                </ImgCrop>
            )}

            {!imgCrop && upload}

            <Modal
                open={previewVisible}
                title={'详情'}
                footer={null}
                onCancel={() => {
                    setState({ ...state, previewVisible: false });
                }}
            >
                <img
                    alt="example"
                    style={{ width: '100%' }}
                    src={
                        previewImage.indexOf('http') !== -1
                            ? previewImage
                            : `${TWT.static}${previewImage}`
                    }
                />
            </Modal>
        </>
    );
};

export default Upload;
