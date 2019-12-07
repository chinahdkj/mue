// 通用方法
import uuid from "../utils/uuid";

/**
 * 获取url参数
 * @param {*} name
 * @param {*} type
 */
export const GetQueryString = (n) => {
    var fn = (name, type) => {
        let target;
        if(type === "hash"){
            target = window.location.hash.split("?")[1];
        }
        else{
            target = window.location.search.substr(1);
        }
        if(!target){
            return null;
        }
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = target.match(reg);
        if(r != null){
            return r[2];
        }
        return null;
    };
    return fn(n) || fn(n, "hash");
};

/**
 * 判断是否是ios
 */
export const isIos = () => {
    const u = navigator.userAgent;
    return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
};

export const isAndroid = () => {
    const u = navigator.userAgent;
    return u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
};

/**
 * 设置苹果/安卓标题
 * @param {*} title
 */
export const setDocumentTitle = (title) => {
    document.title = title;
    if(/ip(hone|od|ad)/i.test(navigator.userAgent)){
        var i = document.createElement("iframe");
        i.src = "";
        i.style.display = "none";
        i.onload = function(){
            setTimeout(function(){
                i.remove();
            }, 9);
        };
        document.body.appendChild(i);
    }
    return null;
};

/** 计算两地距离
 * caculate the great circle distance
 * @param {Object} lat1
 * @param {Object} lng1
 * @param {Object} lat2
 * @param {Object} lng2
 */
var EARTH_RADIUS = 6378137.0; //单位M
var PI = Math.PI;

function getRad(d){
    return d * PI / 180.0;
}

export const getGreatCircleDistance = (lat1, lng1, lat2, lng2) => {
    var radLat1 = getRad(lat1);
    var radLat2 = getRad(lat2);
    var a = radLat1 - radLat2;
    var b = getRad(lng1) - getRad(lng2);
    var s = 2 * Math.asin(Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) *
        Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000.0;
    return s;
};

/**
 * 开关量转换
 * @param {*} value
 * @param {*} unit
 */
export function KGLFORMAT(value, unit){
    if(value === "" || value == null){
        return "";
    }
    var Rtn = value;
    try{
        if(!!!unit){ //如果单位是空
            Rtn = value;
        }
        else if(unit.indexOf("*") == 0 && unit.lastIndexOf("#") == unit.length - 1){ //单位是*开头，#结尾
            var c = unit.split("#");
            for(var i = 0; i < c.length; i++){
                if(c[i] && c[i].indexOf("*" + value.toString() + ":") >= 0){
                    Rtn = c[i].split(":")[1];
                }
            }
        }
        else if(unit.indexOf("@") == 0 && unit.lastIndexOf("$") == unit.length - 1){ //单位是@开头，$结尾
            var vlst = unit.replace("@", "").replace("$", "").split("|");
            if(value == 0){
                Rtn = vlst[0];
            }
            else{
                var nv = value.toString(2);
                var rts = [];
                for(i = 0; i < nv.length; i++){
                    var v = nv.charAt(nv.length - 1 - i);
                    if(v == "1"){
                        rts.push(vlst[i + 1]);
                    }
                }
                Rtn = rts.join(",");
            }
        }
    } catch(error){
        console.log(error);
    }
    return Rtn;
}

/**
 * 截取精度位数
 */
export function newFixed(value, pre){
    if(value === "" || value == null){
        return "";
    }
    var Rtn = value;
    var re = /^[0-9]+.?[0-9]*$/;
    try{
        if(!re.test(pre)){ //如果精度是空
            Rtn = value;
        }
        else{
            Rtn = (parseInt(value * Math.pow(10, pre)) / Math.pow(10, pre)).toFixed(pre);
        }
    } catch(error){
        console.log(error);
    }
    return Rtn;
}

/**
 * 本地生成图片路径
 */
export function newFilePath(filetype){
    let id = uuid(32);
    let first = id.substring(0, 1);
    let second = id.substring(0, 2);
    return `/upload/${first}/${second}/${id}.${filetype}`;
}

export function makeCall(no){
    let $frm = document.createElement("iframe");
    $frm.style.display = "none";
    document.body.appendChild($frm);

    let $tel = document.createElement("a");
    $tel.setAttribute("href", `tel:${no}`);
    $frm.contentDocument.body.appendChild($tel);
    $tel.click();

    document.body.removeChild($frm);
}

export const getHost = () => {
    let location = window.location;
    let host = GetQueryString("host") || GetQueryString("host", "hash");
    if(host){
        host = decodeURIComponent(host);
        sessionStorage.setItem("host", host);
    }
    else{
        host = sessionStorage.getItem("host") || "";
    }

    if(location.origin.toLowerCase() === "file://"){
        return host;
    }
    let code = location.port.substring(1);
    let regex = new RegExp(`^${location.origin}/packages/${code}/`, "i");
    if(regex.test(location.href)){
        return host;
    }
    return "";
};

export default {
    GetQueryString, isIos, isAndroid, setDocumentTitle, getGreatCircleDistance, KGLFORMAT,
    newFixed, newFilePath, makeCall, getHost,
    isNight(){
        return sessionStorage.getItem("theme") === "night";
    }
};