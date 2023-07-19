import {upload} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/dfs"

/**
 * 上传数据
 * @param formData
 */
export async function uploadFile(formData: FormData) {
    return upload(`${controller}/batchUpload`, formData);
}
