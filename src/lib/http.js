import axios from "axios";
import {getAppId, getCid, getHost, GetQueryString} from "./common";
import {CloseLoading} from "../../packages/Loading/src";
import Vue from "vue";

export const isWebApi = process.env.VUE_APP_INTERFACE === 'web'?true:false

const HEADER_SETTING = {
    ignore: {},
    rewrite: {}
};

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

// 开发平台appid，集成到第三方包的时候需要配置
let hddevappid = GetQueryString("hddevappid");
if(hddevappid){
    sessionStorage.setItem("hddevappid", hddevappid);
}

if(isWebApi){
    axios.defaults.headers.common["Uid"] = sessionStorage.getItem("Uid") || "";
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
        if(response.data.Code === 0 || response.data.code === 0 || response.data.code === 200){
            if(response.data.data){
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
    HEADER_SETTING.ignore = {};
    HEADER_SETTING.rewrite = {};

    Object.entries(opts.header_rewrite || {}).forEach(([k, v]) => {
        axios.defaults.headers.common[k] = v;
        HEADER_SETTING.rewrite[k] = v;
    });

    (opts.header_ignore || []).forEach((ig) => {
        axios.defaults.headers.common[ig] = "";
        HEADER_SETTING.ignore[ig] = true;
    });
}

export const getHeaders = (appid = null) => {
    let _token = GetQueryString("token");
    if(_token){
        sessionStorage.setItem("authortoken", _token);
    }
    else{
        _token = sessionStorage.getItem("authortoken") || "";
    }

    let headers = {
        Authorization: _token,
        Token: _token,
        APP: getCid(),
        // appid: appid || getAppId()
        appid: appid === "" ? "" : (appid || getAppId())
    };

    Object.entries(HEADER_SETTING.rewrite).forEach(([k, v]) => {
        headers[k] = v;
    });

    Object.entries(HEADER_SETTING.ignore).forEach(([k, v]) => {
        v && delete headers[k];
    });

    return headers;
};

//针对S7
export function getUrl (url){
    let prefix = "/app/customer"
    if(url.startsWith(prefix)){
        return url.substring(prefix.length)
    }else{
        return url;
    }
}


export default {
    post(url, data, failed = false, appid = null, header = null, timeout = 30000){
        let setting = {
            method: "post",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            data: data,
            timeout
        }
        if(isWebApi){
            setting.url = getUrl(url)
        }else{
            if(header !== false){
                setting['headers'] = header && JSON.stringify(header) !== "{}" ? header : getHeaders(appid)
            }
        }

        return axios(setting).then(res => res.Response).catch(e => {
            console.log(e);

            // 请求接口不存在 或者 APP服务返回第三方接口解析错误（大部分原因是scada系统中不存在接口）
            // 之后做了版本控制之后，需要放掉这段代码，将错误暴露到前台
            if((e.response && e.response.status === 404) || (e.Code === 21001 || e.code === 21001) || e.response == undefined){
                // TODO
            }
            else if(e.Message){
                !failed && Vue.prototype.$toast && Vue.prototype.$toast(e.Message);
            }
            else{
                !failed && Vue.prototype.$toast && Vue.prototype.$toast("请求出错，请稍候再试!");
            }

            return Promise.reject(e);
        });
    },
    sourcePost(url, data, failed = false, appid = null, header = null, timeout = 30000){
        let setting = {
            method: "post",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            data: data,
            timeout
        }
        if(isWebApi){
            setting.url = getUrl(url)
        }else{
            if(header !== false){
                setting['headers'] = header && JSON.stringify(header) !== "{}" ? header : getHeaders(appid)
            }
        }
        
        return axios(setting).then(res => res).catch(e => {
            console.log(e);
            return Promise.reject(e);
        });
    },
    get(url, params, failed = false, appid = null, header = null, timeout = 30000){
        let setting = {
            method: "get",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            params, // get 请求时带的参数
            timeout
        }
        if(isWebApi){
            setting.url = getUrl(url)
        }else{
            if(header !== false){
                setting['headers'] = header && JSON.stringify(header) !== "{}" ? header : getHeaders(appid)
            }
        }


        return axios(setting).then(res => res.Response).catch(e => {
            console.log(e);

            if(e.Message){
                !failed && Vue.prototype.$toast && Vue.prototype.$toast(e.Message);
            }
            else{
                !failed && Vue.prototype.$toast && Vue.prototype.$toast("请求出错，请稍候再试!");
            }

            return Promise.reject(e);
        });
    },
    sourceGet(url, params, failed = false, appid = null, header = null, timeout = 30000){
        let setting = {
            method: "get",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            params, // get 请求时带的参数
            timeout
        }
        if(isWebApi){
            setting.url = getUrl(url)
        }else{
            if(header !== false){
                setting['headers'] = header && JSON.stringify(header) !== "{}" ? header : getHeaders(appid)
            }
        }
        
        return axios(setting).then(res => res).catch(e => {
            console.log(e);
            return Promise.reject(e);
        });
    },
    put(url, data, failed = false, appid = null, header = null){
        let setting = {
            method: "put",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            data: data,
            timeout: 30000
        }
        if(isWebApi){
            setting.url = getUrl(url)
        }else{
            if(header !== false){
                setting['headers'] = header && JSON.stringify(header) !== "{}" ? header : getHeaders(appid)
            }
        }

        return axios(setting).then(res => res.Response).catch(e => {
            console.log(e);

            // 请求接口不存在 或者 APP服务返回第三方接口解析错误（大部分原因是scada系统中不存在接口）
            // 之后做了版本控制之后，需要放掉这段代码，将错误暴露到前台
            if((e.response && e.response.status === 404) || (e.Code === 21001 || e.code === 21001) || e.response == undefined){
                // TODO
            }
            else if(e.Message){
                !failed && Vue.prototype.$toast && Vue.prototype.$toast(e.Message);
            }
            else{
                !failed && Vue.prototype.$toast && Vue.prototype.$toast("请求出错，请稍候再试!");
            }

            return Promise.reject(e);
        });
    },
    delete(url, data, failed = false, appid = null, header = null){
        let setting = {
            method: "delete",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            data: data,
            timeout: 30000
        }
        if(isWebApi){
            setting.url = getUrl(url)
        }else{
            if(header !== false){
                setting['headers'] = header && JSON.stringify(header) !== "{}" ? header : getHeaders(appid)
            }
        }

        return axios(setting).then(res => res.Response).catch(e => {
            console.log(e);

            // 请求接口不存在 或者 APP服务返回第三方接口解析错误（大部分原因是scada系统中不存在接口）
            // 之后做了版本控制之后，需要放掉这段代码，将错误暴露到前台
            if((e.response && e.response.status === 404) || (e.Code === 21001 || e.code === 21001) || e.response == undefined){
                // TODO
            }
            else if(e.Message){
                !failed && Vue.prototype.$toast && Vue.prototype.$toast(e.Message);
            }
            else{
                !failed && Vue.prototype.$toast && Vue.prototype.$toast("请求出错，请稍候再试!");
            }

            return Promise.reject(e);
        });
    }
};
