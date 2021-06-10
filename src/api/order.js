import request from '@/utils/request'

const orderList = function orderList(params) {
  return request.post('/orderList', params)
}
const filterOrder = function filterOrder(params) {
  return request.post('/filterOrder', params)
}

export default {
  orderList,
  filterOrder
}
