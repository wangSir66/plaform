import request from '@/utils/request'
// 获取道具列表
const propList = function() {
  return request.get('/propList')
}
// 创建道具
const updateProp = function(param) {
  console.log(`方法：createProp，消息：post_/createProp，参数：${JSON.stringify(param)}`)
  return request.post('/updateProp', param)
}
// 删除道具
const delProp = function(param) {
  console.log(`方法：delProp，消息：post_/delProp，参数：${JSON.stringify(param)}`)
  return request.post('/delProp', param)
}

/**
 * 道具类型--线上、线下
*/
const PropState = [{
  key: 0,
  label: '冻结'
}, {
  key: 1,
  label: '正常'
}]

/**
 * 道具类型
 */
const PropType = [{
  key: 0,
  label: '线上扫码'
}, {
  key: 1,
  label: '线下核销'
}]

export default {
  propList,
  updateProp,
  delProp,
  PropState,
  PropType
}
