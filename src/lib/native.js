// 原生调用方法
import {isIos} from "./common";

const _cache = {};
const _cache2 = {};

const fns = [
    "save", "delete", "query", "rotate", "startNavi", "getLocation", "isCollected", "sysInfo",
    "hideHeader", "scanCode", "copy", "share", "userInfo", "userBehaviorRecord", "search",
    "collect", "nfcData", "goback", "refreshBadge", "signature", "saveLocalData", "queryLocalData", "deleteLocalData",
    "bluetooth", "btDisConnected", "bluetoothState", "manualPost", "btGetParams", "manualPostRes", "btSound", "soundPlay", "vibratorSound", "dictList",
    "btScan", "shareFile", "btUpdate", "spectrum", "trace", "delFile", "interceptBack", "bgNavi",
    "video", "showVideo", "sound", "screenshot", "screenoff", "screenon", "bgNaviClose", "regeocode", "download", "watermarkCamera",
    "download", "delFile", "sqlite_execsql", "sqlite_query", "multi_file", "v88s_zdsjcx", "v88s_params", "v88s_tc", "logger", "singleDownload", "clearCache",
    "resSave", "sqlite_close", "unzip", "queryCustomer", "get_blan", "rpc_blan"
];

const fns2 = [
    "search", "collect", "btDisConnected", "btReceiver", "btGetParams", "manualPostRes", "handPostResp",
    "btSound", "btScan", "handCollectResp", "bluetooth", "onBtState", "interceptBack", "bgNavi", "getLocation", "btUpdate",
    "screenoff", "screenon", "bgNaviClose", "btRawData", "onSingleDownload", "sqlite_close", "unzip", "btNoiseLog",
    "get_blan", "rpc_blan", "analRelated"
]; // 原生主动调用js的方法

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
        if(v === method){
            _cache2[method] = params;
            return true;
        }
    });
    const cb = _cache[msgid];
    if(cb){
        let gon = cb(params);
        // 如果多次回调，返回true 不删除回调入口
        gon !== true && delete _cache[msgid];
    }
    else{
        delete _cache[msgid];
    }
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
    };
});

// 原生传入改主题
window.changeTheme = (t) => {
    let hash = location.hash.split("?");
    let query = hash[1] || "";
    if(!query){
        hash[1] = `theme=${t}`;
        location.hash = hash.join("?");
        return;
    }
    let params = {};
    query = query.split("&");
    for(let i = 0; i < query.length; i++){
        let [k, v] = query[i].split("=");
        params[k] = v;
    }
    params.theme = t;
    hash[1] = Object.entries(params).map(([k, v]) => {
        return `${k}=${v}`;
    }).join("&");
    location.replace(hash.join("?"));
};

export default methods;
