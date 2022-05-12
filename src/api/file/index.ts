import request from '@/utils/request';

/**
 * 通用文件上传
 * @param url 地址
 * @param formData 数据对象 FormData
 * @param params 参数
 */
// eslint-disable-next-line import/prefer-default-export
export function upload(url: string, formData: FormData) {
  return request(`${url}`, {
    method: 'POST',
    // @ts-ignore
    requestType: 'form',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*',
    },
    data: formData,
  });
}
