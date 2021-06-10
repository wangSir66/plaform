import request from '@/utils/request'
// 商城列表
const shopList = function() {
  return request.get('/shopList')
}
// 创建商品
const updateShop = function(param) {
  console.log(`方法：updateShop，消息：post_/updateShop，参数：${JSON.stringify(param)}`)
  return request.post('/updateShop', param)
}
// 删除商品
const delShop = function(param) {
  console.log(`方法：delShop，消息：post_/delShop，参数：${JSON.stringify(param)}`)
  return request.post('/delShop', param)
}

/**
 * 商品分类 分类：钻石充值/代金券兑换/金币兑换/道具兑换
*/
const ItemType = [{
  key: 0,
  label: '钻石充值'
}, {
  key: 1,
  label: '代金券兑换'
}, {
  key: 2,
  label: '金币兑换'
}, {
  key: 3,
  label: '道具兑换'
}]

/**
 * 兑换消耗可能为：钻石，人民币，金币，代金券
 */
const ConsumeType = [{
  key: 0,
  label: '钻石'
}, {
  key: 1,
  label: '代金券'
}, {
  key: 2,
  label: '金币'
}, {
  key: 3,
  label: '人民币'
}]

export default {
  shopList,
  updateShop,
  delShop,
  ItemType,
  ConsumeType
}
