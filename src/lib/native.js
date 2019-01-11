// 原生调用方法
import {isIos} from './common';

const _cache = {};
const _cache2 = {};

const fns = [
    "save", "delete", "query", "rotate", "startNavi", "getLocation", "isCollected", "sysInfo",
    "hideHeader", "scanCode", "copy", "share", "userInfo", "userBehaviorRecord", "search",
    "collect", "nfcData", "goback", "refreshBadge", "signature","saveLocalData","queryLocalData","deleteLocalData"
];

const postMessage = ({cb, method, params}) => {
    const msgid = parseInt(Math.random() * Math.pow(10, 17));
    _cache[msgid] = cb;
    try{
        isIos()
        ? window.webkit.messageHandlers.postMessage.postMessage(
            JSON.stringify({msgid, method, params}))
        : window.native.postMessage(
            JSON.stringify({msgid, method, params}));
    } catch(e){
        console.log(e);
        return;
    }
};
window.response = ({msgid, params, method}) => {
    // 原生回调传入一个json对象
    if(method === "search" || method === "collect"){ // 原生主动调用web
        _cache2[method] = params;
        return;
    }

    const cb = _cache[msgid];
    cb && cb(params);
    delete _cache[msgid];
};

window.response2 = ({method, cb}) => {
    if(!method || !cb){
        return;
    }
    Object.defineProperty(_cache2, method, {
        configurable: true,
        enumerable: true,
        set(val){
            if(val){
                cb(val);
                delete _cache[method];
            }
        }
    });
};

let methods = {};

fns.forEach((f) => {
    methods[f] = ({params, cb}) => {
        postMessage({method: f, params, cb});
    }
});

export default methods;