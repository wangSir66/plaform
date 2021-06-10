import { Message, MessageBox } from 'element-ui'
const Copy = (obj) => {
  const o = Array.isArray(obj) ? [] : {}
  for (const i in obj) {
    if (Object.hasOwnProperty.call(obj, i)) o[i] = obj[i] instanceof Object ? Copy(obj[i]) : obj[i]
  }
  return o
}
const SetData = (obj1, obj2) => {
  for (const i in obj1) {
    if (Object.hasOwnProperty.call(obj1, i)) obj1[i] = obj1[i] instanceof Object ? SetData(obj1[i], obj2[i]) : obj2[i]
  }
  return obj1
}

const ErrorTip = (type, title, message, call) => {
  switch (type) {
    case 0:
      Message.error({
        message: message || 'Error'
      })
      break
    case 1:
      MessageBox.confirm(`${message}`, `${title}`, {
        confirmButtonText: '确定',
        cancelButtonText: '关闭',
        type: 'error'
      }).then(rsp => { if (call) call(rsp) }).catch(e => {})
      break
  }
  console.log('错误提示---', type, message)
}

export {
  SetData,
  Copy,
  ErrorTip
}
