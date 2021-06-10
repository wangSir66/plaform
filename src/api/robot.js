import request from '@/utils/request'
// 商城列表
const matchList = function () {
  return request.get('/nowMatch')
}
// 创建商品
const updateShop = function (param) {
  console.log(`方法：updateShop，消息：post_/updateShop，参数：${JSON.stringify(param)}`)
  return request.post('/updateShop', param)
}
// 删除商品
const delShop = function (param) {
  console.log(`方法：delShop，消息：post_/delShop，参数：${JSON.stringify(param)}`)
  return request.post('/delShop', param)
}

const MatchStatus = ['报名中', '取消', '报名截止', '结束', '删除']

export default {
  matchList,
  updateShop,
  delShop,
  MatchStatus
}
