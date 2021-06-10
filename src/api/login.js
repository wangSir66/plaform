import request from '@/utils/request'

export const login = (param) => {
  return request.post('/login', param)
}

export function getInfo(token) {
  return request({
    url: '/info',
    method: 'get',
    params: {
      token
    }
  })
}
