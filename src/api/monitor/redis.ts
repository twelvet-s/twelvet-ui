import request from '@/utils/request';

export function insertClientApi(data) {
  return request({
    url: `system/client/pageQuery`,
    method: 'put',
    data,
  });
}

export function getRedisChartApi() {
  return request({
    url: `/system/monitor/redis`,
    method: 'get',
  });
}
