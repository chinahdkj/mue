// 原生调用方法
import ccworkBridge from 'ccwork-jsbridge';
import {isIos, isDingDing, isCCWork} from "./common";
import * as NativePc from "./native-pc";
import * as NativeDingDing from "./native-dingding";
import NativeCcwork from "./native-ccwork";

const _printEnable = false;
const _cache = {};
const _cache2 = {};

const fns = [
    "save", "delete", "query", "rotate", "startNavi", "getLocation", "isCollected", "sysInfo",
    "hideHeader", "scanCode", "copy", "share", "userInfo", "userBehaviorRecord", "search",
    "collect", "nfcData", "goback", "refreshBadge", "signature", "saveLocalData", "queryLocalData", "deleteLocalData",
    "bluetooth", "btDisConnected", "bluetoothState", "manualPost", "btGetParams", "manualPostRes", "btSound", "soundPlay", "vibratorSound", "dictList",
    "btScan", "shareFile", "btUpdate", "spectrum", "trace", "delFile", "interceptBack", "bgNavi",
    "video", "showVideo", "sound", "screenshot", "bgNaviClose", "regeocode", "watermarkCamera",
    "download", "sqlite_execsql", "sqlite_query", "multi_file", "v88s_zdsjcx", "v88s_params", "v88s_tc", "logger", "singleDownload", "clearCache",
    "resSave", "sqlite_close", "unzip", "queryCustomer", "get_blan", "rpc_blan", "rfm_getDevices", "rfm_openDoor","fmkz_params","fmkz_sscx","fmkz_tc","analRelated",
    "ocr_watermeter", "eranntex_params", "connectUHFTag", "disconnectUHFTag", "readUHFTag", "openBluetooth"
];

// 原生主动调用js的方法
const fns2 = [
    "search", "collect", "btDisConnected", "btReceiver", "btGetParams", "manualPostRes", "handPostResp",
    "btSound", "btScan", "handCollectResp", "bluetooth", "onBtState", "interceptBack", "bgNavi", "getLocation", "btUpdate",
    "screenoff", "screenon", "bgNaviClose", "btRawData", "onSingleDownload", "sqlite_close", "unzip", "btNoiseLog",
    "get_blan", "rpc_blan", "onfmkz_sscx", "connectUHFTag", "disconnectUHFTag", "readUHFTag", "nfcData"
];

const postMessage = ({cb, method, params}) => {
    // console.log("传入参数", params)
    const msgid = parseInt(Math.random() * Math.pow(10, 17));
    _cache[msgid] = cb;
    try {
        if (isDingDing()) {
            typeof NativeDingDing[method] === "function" && NativeDingDing[method]({msgid, method, params});
        }
        else if (isCCWork()) {
            if(typeof NativeCcwork[method] === "function") {
                ccworkBridge.init(() => {
                    NativeCcwork[method]({msgid, method, params})
                });
            }
        }
        else if (!window.webkit && !window.native) {
            typeof NativePc[method] === "function" && NativePc[method]({msgid, method, params});
        }
        else {
            let p = JSON.stringify({msgid, method, params});
            isIos() ? window.webkit.messageHandlers.postMessage.postMessage(p)
                : window.native.postMessage(p);
        }
    } catch(e){
        console.log(e);
        return;
    }
};
window.response = ({msgid, method, params}) => {
    console.log("返回结果11111", params)
    console.log("方法名", method)
    // 原生回调传入一个json对象（id, 方法名，返回数据）
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
        // 分发至子系统的
        // iframeSendMessage({ msgid, method, params });
        delete _cache[msgid];
    }
};

//执行具体监听方法
window.response2 = ({method, cb}) => {
    if(!method || !cb){
        return;
    }

    // 分发至子系统的
    // iframeSendMessage({ method, params: cb });

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

/// ***** iframe 原生交互 接收/分发 *****
// 分发
function iframeSendMessage(data) {
    if (_printEnable) console.log("发送消息 至 iframe: ", data);
    if (window.frames == null || window.frames.length == 0) { return; }
    for (let index = 0; index < window.frames.length; index++) {
        const ele = window.frames[index];
        ele.postMessage(data, "*");
    }
}

// 接收
function iframeReceiveMessage(event) {
    if (_printEnable) console.log("iframe 接收消息 ", event.data);
    let data = event.data;
    if (data == null) return;
    let msgid = data["msgid"], method = data["method"], params = data["params"];
    if (method == null || params == null) return;
    if (msgid !== null && msgid !== "") {
        window.response({ msgid, method, params });
    } else {
        window.response2({ method, cb: params });
    }
}
window.addEventListener("message", iframeReceiveMessage, false);

//派发
let methods = {};
fns.forEach((f) => {
    methods[f] = ({params, cb}) => { //h5规定格式
        postMessage({method: f, params, cb});
    };
});

export default methods;
