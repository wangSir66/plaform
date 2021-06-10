import request from '@/utils/request'

// 查询比赛
export function getMatchList(params) {
  return request.post('matchList', params)
}

// 创建比赛
const addToMatch = (param) => {
  console.log(`方法：addToMatch，消息：post_/addToMatch，参数：${JSON.stringify(param)}`)
  return request.post('/addToMatch', param)
}
// 修改比赛
const modifyToMatch = (param) => {
  console.log(`方法：modifyToMatch，消息：post_/Modify，参数：${JSON.stringify(param)}`)
  return request.post('/Modify', param)
}
// 删除比赛
const deltMatch = (param) => {
  console.log(`方法：deltMatch，消息：post_/delMatch，参数：${JSON.stringify(param)}`)
  return request.post('/delMatch', param)
}
// 开启比赛
const startMatch = (param) => {
  console.log(`方法：startMatch，消息：post_/startMatch，参数：${JSON.stringify(param)}`)
  return request.post('/startMatch', param)
}
// 比赛报名费类型
const ChargeType = [{
  key: 0,
  name: '免费'
}, {
  key: 1,
  name: '钻石'
}, {
  key: 2,
  name: '金币'
}]
// 比赛类型
const MatchType = [{
  type: 0,
  name: '定点赛'
}, {
  type: 1,
  name: '循环赛'
}, {
  type: 2,
  name: '满人赛(测试)'
}]

// 奖励类型
const RewardType = [{
  type: 0,
  name: '钻石'
}, {
  type: 1,
  name: '金币'
}, {
  type: 2,
  name: '代金券'
}, {
  type: 3,
  name: '道具'
}]

// 赛制
const FormatType = [{
  type: 0,
  name: '定局积分'
}, {
  type: 1,
  name: 'X轮X副'
}]

// 循环赛类型
const LoopType = [{
  type: 1,
  name: '规律循环'
}, {
  type: 2,
  name: '不规律循环'
}]

// 支持退赛
const CanDropOut = [{
  type: 0,
  name: '支持'
}, {
  type: 1,
  name: '不支持'
}]

export default {
  getMatchList,
  addToMatch,
  modifyToMatch,
  deltMatch,
  startMatch,
  ChargeType,
  MatchType,
  RewardType,
  FormatType,
  LoopType,
  CanDropOut
}
