import request from '@/utils/request'

/**
 * 销售漏斗
 * @param {*} data
 * start_time
 * end_time
 * user_id 员工ID
 * structure_id 部门ID
 * type_id 商机组
 */
export function biBusinessFunnel(data) {
  return request({
    url: 'bi/business/funnel',
    method: 'post',
    data: data
  })
}

/**
 * 新增商机数与金额趋势分析
 * @param {*} data
 * year 年
 * status 1销售（目标）2回款（目标）
 * user_id 员工ID
 * structure_id 部门ID
 */
export function biBusinessTrendAPI(data) {
  return request({
    url: 'bi/business/businessTrend',
    method: 'post',
    data: data
  })
}

/**
 * 新增商机数与金额趋势分析 详情列表
 * @param {*} data
 */
export function biBusinessTrendListAPI(data) {
  return request({
    url: 'bi/business/trendList',
    method: 'post',
    data: data
  })
}

/**
 * 赢单机会转化率趋势分析
 * @param {*} data
 */
export function biBusinessWinAPI(data) {
  return request({
    url: 'bi/business/win',
    method: 'post',
    data: data
  })
}
