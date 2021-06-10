import request from '@/utils/request'

const merchantList = function (params) {
  return request.post('/merchantList', params)
}
// 创建商户
const updateMerchant = function (param) {
  console.log(`方法：updateMerchant，消息：post_/updateMerchant，参数：${JSON.stringify(param)}`)
  return request.post('/updateMerchant', param)
}
// 删除商户
const delMerchant = function (param) {
  console.log(`方法：delMerchant，消息：post_/delMerchant，参数：${JSON.stringify(param)}`)
  return request.post('/delMerchant', param)
}
export default {
  merchantList,
  delMerchant,
  updateMerchant
}
