// http请求
import axios from 'axios';
import {GetQueryString} from './common';

let token = GetQueryString('token') || GetQueryString('token', 'hash');
if(token){
    sessionStorage.setItem('authortoken', token);
}
let host = decodeURIComponent(GetQueryString('host') || GetQueryString('host', 'hash'));
if(host && host.indexOf('http://') > -1){
    sessionStorage.setItem('host', host);
}
let APP = GetQueryString('app') || GetQueryString('app', 'hash');
if(APP){
    sessionStorage.setItem('authorapp', APP);
}

// 测试token
axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('authortoken');
axios.defaults.headers.common['APP'] = sessionStorage.getItem('authorapp');

axios.interceptors.request.use(config => {
    return config;
}, error => {
    return error;
});

axios.interceptors.response.use(response => {
    return response;
}, error => {
    return error;
});

function checkStatus(response){
    // loading
    // 如果http状态码正常，则直接返回数据
    if(response && (response.status === 200 || response.status === 304 || response.status === 400)){
        return response;
    }
    // 异常状态下，把错误信息返回去
    return {
        status: -404,
        msg: '服务器连接失败，请检查网络状态/稍后再试！'
    };
}

function checkCode(res){
    // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
    if(res.status === -404){
        Toast(res.msg);
    }
    // 如果不需要除了data之外的数据，可以直接 return res.data
    if(res.data.Code === 0){
        return res.data.Response;
    }
    else{
        Toast(res.data.Message ? res.data.Message : '数据请求出错!');
        return null;
    }
}

export default {
    post(url, data){
        return axios({
            method: 'post',
            baseURL: process.env.NODE_ENV !== 'production' ? '/list' :
                     (host && host.indexOf('http://') > -1 ? host : sessionStorage.getItem('host')),
            url,
            data: data,
            timeout: 600000
        }).then(response => {
            return checkStatus(response);
        }).then(res => {
            return checkCode(res);
        }).catch(e => {
            console.log(e);
        });
    },
    get(url, params){
        return axios({
            method: 'get',
            baseURL: process.env.NODE_ENV !== 'production' ? '/list' :
                     (host && host.indexOf('http://') > -1 ? host : sessionStorage.getItem('host')),
            url,
            params, // get 请求时带的参数
            timeout: 10000
        }).then(response => {
            return checkStatus(response);
        }).then(res => {
            return checkCode(res);
        }).catch(e => {
            console.log(e);
        });
    }
};
