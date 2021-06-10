import request from '@/utils/request'
// 游戏列表
const gameList = function() {
  return request.get('/gameList')
}
// 地域列表
const getCities = function() {
  return request.get('/cities')
}
// 比赛服务列表
const getServerList = function() {
  return request.get('/serverList')
}
// 游戏类型列表
const GetGameTypeList = function() {
  return request.get('/gameType/List')
}
// 添加游戏类型
const AddGameType = function(param) {
  return request.post('/gameType/Add', param)
}
// 修改游戏类型
const ModifyGameType = function(param) {
  return request.post('/gameType/Modify', param)
}
// 删除游戏类型
const RemoveGameType = function(param) {
  return request.post('/gameType/Del', param)
}

export default {
  getCities,
  gameList,
  getServerList,
  AddGameType,
  GetGameTypeList,
  RemoveGameType,
  ModifyGameType
}
