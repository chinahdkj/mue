import axios from "axios";
import {getAppId, getHost, GetQueryString} from "./common";
import {CloseLoading} from "../../packages/Loading/src";
import Vue from "vue";

const HEADER_IGNORE = {};

let token = GetQueryString("token");
if(token){
    sessionStorage.setItem("authortoken", token);
}
let APP = GetQueryString("app");
if(APP){
    sessionStorage.setItem("authorapp", APP);
}
let host = GetQueryString("host");
if(host){
    host = decodeURIComponent(host);
    sessionStorage.setItem("host", host);
}

let appid = GetQueryString("appid");
if(appid){
    sessionStorage.setItem("appid", appid);
}

axios.defaults.headers.common["Authorization"] = token || sessionStorage.getItem("authortoken");
axios.defaults.headers.common["Token"] = token || sessionStorage.getItem("authortoken");
axios.defaults.headers.common["APP"] = APP || sessionStorage.getItem("authorapp");

axios.interceptors.request.use(config => {
    return config;
}, error => {
    return Promise.error(error);
});

axios.interceptors.response.use(response => {
    if("Code" in response || "code" in response){
        return Promise.resolve(response);
    }
    CloseLoading();
    if(response.status === 200){
        if(response.data.Code === 0 || response.data.code === 0){
            if(response.data.data) {
                response.data.Response = response.data.data;
            }
            return Promise.resolve(response.data);
        }
        else{
            // return Promise.resolve(response.data)
            return Promise.reject(response.data);
        }
    }
    else{
        return Promise.reject(response);
    }
}, e => {
    CloseLoading();
    return Promise.reject(e);
});

export function InitHttp(opt = {}){
    let opts = opt || {};
    (opts.header_ignore || []).forEach((ig) => {
        axios.defaults.headers.common[ig] = "";
        HEADER_IGNORE[ig] = true;
    });
}

let getHeaders = (appid = null) => {
    let _token = GetQueryString("token");
    if(_token){
        sessionStorage.setItem("authortoken", _token);
    }
    else{
        _token = sessionStorage.getItem("authortoken") || "";
    }

    let _app = GetQueryString("app");
    if(_app){
        sessionStorage.setItem("authorapp", _app);
    }
    else{
        _app = sessionStorage.getItem("authorapp");
    }

    let headers = {
        Authorization: _token,
        Token: _token,
        APP: _app,
        // appid: appid || getAppId()
        appid: appid === '' ? appid : appid || getAppId()
    };

    Object.entries(HEADER_IGNORE).forEach(([k, v]) => {
        v && delete headers[k];
    });

    return headers;
};

export default {
    post(url, data, failed = false, appid = null){
        return axios({
            method: "post",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            data: data,
            timeout: 30000,
            headers: getHeaders(appid)
        }).then(res => res.Response).catch(e => {
            console.log(e);

            // 请求接口不存在 或者 APP服务返回第三方接口解析错误（大部分原因是scada系统中不存在接口）
            // 之后做了版本控制之后，需要放掉这段代码，将错误暴露到前台
            if((e.response && e.response.status === 404) || (e.Code === 21001 || e.code === 21001)){
                // TODO
            }
            else if(e.Message){
                !failed && Vue.prototype.$toast(e.Message);
            }
            else{
                !failed && Vue.prototype.$toast("请求出错，请稍候再试!");
            }

            return Promise.reject(e);
        });
    },
    get(url, params, failed = false, appid = null){
        return axios({
            method: "get",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            params, // get 请求时带的参数
            timeout: 30000,
            headers: getHeaders(appid)
        }).then(res => res.Response).catch(e => {
            console.log(e);

            if(e.Message){
                !failed && Vue.prototype.$toast(e.Message);
            }
            else{
                !failed && Vue.prototype.$toast("请求出错，请稍候再试!");
            }

            return Promise.reject(e);
        });
    }
};
