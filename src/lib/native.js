// 原生调用方法
import {isIos} from './common';

const _cache = {};
const _cache2 = {};

const fns = [
    "save", "delete", "query", "rotate", "startNavi", "getLocation", "isCollected", "sysInfo",
    "hideHeader", "scanCode", "copy", "share", "userInfo", "userBehaviorRecord", "search",
    "collect", "nfcData", "goback", "refreshBadge", "signature","saveLocalData","queryLocalData","deleteLocalData",
    "bluetooth", "btDisConnected", "manualPost", "btGetParams", "manualPostRes","btSound","soundPlay","vibratorSound","dictList",
    "btScan", "shareFile", "btUpdate", "spectrum", "trace", "delFile", "interceptBack", "bgNavi",
    "video", "showVideo", "sound", "screenshot", "screenoff", "screenon", "bgNaviClose", "regeocode", "download", "watermarkCamera"
];

const fns2 = [
    'search', 'collect', 'btDisConnected', 'btReceiver', 'btGetParams', 'manualPostRes', 'handPostResp', 
    'btSound','btScan', 'handCollectResp', 'bluetooth', 'interceptBack', "bgNavi", "getLocation", "btUpdate", 
    "screenoff", "screenon", "bgNaviClose"
] // 原生主动调用js的方法

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
    // 支持多次调用原生回调，所以要注释掉（对应固件升级页面需要多次回调）
    // delete _cache[msgid];
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