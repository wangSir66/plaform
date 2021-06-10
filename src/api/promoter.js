import request from '@/utils/request'
// 推广员列表（IsSuper?）是否只查超管
const promoterList = function(param) {
  return request.post('/promoter/List', param)
}
// 添加超管
const superAdminAdd = function(param) {
  return request.post('/promoter/Add', param)
}
// 修改超管
const superAdminModify = function(param) {
  return request.post('/promoter/Modify', param)
}
// 删除超管
const superAdminDel = function(param) {
  return request.post('/promoter/Del', param)
}
// 删除超管
const promoterDis = function(param) {
  return request.post('/promoter/Disabled', param)
}
// 查询手机号是否被使用
const queryPhoneUsed = function(param) {
  return request.post('/promoter/queryPhoneUsed', param)
}
// 修改推广员手机号
const bindPhone = function(param) {
  return request.post('/promoter/bindPhone', param)
}
// 重置密码
const resetUserLoginPassword = function(param) {
  return request.post('/promoter/resetUserLoginPassword', param)
}

export default {
  promoterList,
  superAdminAdd,
  superAdminModify,
  superAdminDel,
  promoterDis,
  queryPhoneUsed,
  bindPhone,
  resetUserLoginPassword
}
