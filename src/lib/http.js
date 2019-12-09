import axios from "axios";
import {getHost, GetQueryString} from "./common";
import {CloseLoading} from "../../packages/Loading/src";
import Vue from "vue";

let token = GetQueryString("token") || GetQueryString("token", "hash");
if(token){
    sessionStorage.setItem("authortoken", token);
}
let APP = GetQueryString("app") || GetQueryString("app", "hash");
if(APP){
    sessionStorage.setItem("authorapp", APP);
}
let host = GetQueryString("host") || GetQueryString("host", "hash");
if(host){
    host = decodeURIComponent(host);
    sessionStorage.setItem("host", host);
}

let getAppId = () => {
    return GetQueryString("appid") || GetQueryString("appid", "hash")
        || sessionStorage.getItem("appid") || "scada";
};

axios.defaults.headers.common["Authorization"] = token || sessionStorage.getItem("authortoken");
axios.defaults.headers.common["Token"] = token || sessionStorage.getItem("authortoken");
axios.defaults.headers.common["APP"] = APP || sessionStorage.getItem("authorapp");

axios.interceptors.request.use(config => {
    return config;
}, error => {
    return Promise.error(error);
});

axios.interceptors.response.use(response => {
    CloseLoading();
    if(response.status === 200){
        if(response.data.Code === 0){
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

export function InitHttp(){

}

export default {
    post(url, data, failed = false, appid = null){
        return axios({
            method: "post",
            baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
            url,
            data: data,
            timeout: 30000,
            headers: {appid: appid || getAppId()}
        }).then(res => res.Response).catch(e => {
            console.log(e);

            // 请求接口不存在 或者 APP服务返回第三方接口解析错误（大部分原因是scada系统中不存在接口）
            // 之后做了版本控制之后，需要放掉这段代码，将错误暴露到前台
            if((e.response && e.response.status === 404) || (e.Code === 21001)){
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
            headers: {appid: appid || getAppId()}
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
