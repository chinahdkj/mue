// 原生调用方法
import {
  isIos
} from './common'
const _cache = {}
const _cache2 = {}

const postMessage = p => {
  const {
    cb,
    method,
    params
  } = p
  const msgid = parseInt(Math.random()*Math.pow(10, 17))
  _cache[msgid] = cb
  try {
    isIos() ? window.webkit.messageHandlers.postMessage.postMessage(JSON.stringify({
      msgid,
      method,
      params
    })) : window.native.postMessage(JSON.stringify({
      msgid,
      method,
      params
    }))
  } catch (e) {
    console.log(e)
    return
  }
}
window.response = obj => {
  // 原生回调传入一个json对象
  const {
    msgid,
    params,
    method
  } = obj
  if (method =="search" || method =="collect") { // 原生主动调用web
    _cache2[method] = params
    return
  }

  const cb = _cache[msgid]
  cb && cb(params)
  delete _cache[msgid]
}

window.response2 = ({
  method,
  cb
}) => {
  if (!method || !cb) return
  Object.defineProperty(_cache2, method, {
    configurable: true,
    enumerable: true,
    set(val) {
      if (val) {
        cb(val)
        delete _cache[method]
      }
    }
  })
}

export const analyse = ({
  params
}) => {
  postMessage({
    method: 'analyse',
    params
  })
}
export const save = ({
  params,
  cb
}) => {
  postMessage({
    method: 'save',
    params,
    cb
  })
}
export const query = ({
  params,
  cb
}) => {
  postMessage({
    method: 'query',
    params,
    cb
  })
}
export const rotate = ({
  params,
  cb
}) => {
  postMessage({
    method: 'rotate',
    params,
    cb
  })
}
export const startNavi = ({
  params
}) => {
  postMessage({
    method: 'startNavi',
    params
  })
}
export const isCollected = ({
  params
}) => {
  postMessage({
    method: 'isCollected',
    params
  })
}
export const getLocation = ({
  params,
  cb
}) => {
  postMessage({
    method: 'getLocation',
    params,
    cb
  })
}
export const hideHeader = ({
  params,
}) => {
  postMessage({
    method: 'hideHeader',
    params
  })
}
export const goBack = ({
  params,
}) => {
  postMessage({
    method: 'goback',
    params
  })
}