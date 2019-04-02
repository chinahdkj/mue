// 原生调用方法
import {isIos} from './common';

const _cache = {};
const _cache2 = {};

const fns = [
    "save", "delete", "query", "rotate", "startNavi", "getLocation", "isCollected", "sysInfo",
    "hideHeader", "scanCode", "copy", "share", "userInfo", "userBehaviorRecord", "search",
    "collect", "nfcData", "goback", "refreshBadge", "signature","saveLocalData","queryLocalData","deleteLocalData",
    "bluetooth", "btDisConnected", "manualPost", "btGetParams", "manualPostRes","btSound","soundPlay","vibratorSound","dictList"
];

const fns2 = ['search', 'collect', 'btDisConnected', 'btReceiver', 'btGetParams', 'manualPostRes','btSound'] // 原生主动调用js的方法

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
    fns2.some(v => {
        if (v === method) {
            _cache2[method] = params;
            return true
        }
    })

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