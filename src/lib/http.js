import axios from 'axios';
import { GetQueryString } from './common';
import { CloseLoading } from '../../packages/Loading/src';
import Vue from 'vue';

let token = GetQueryString('token') || GetQueryString('token', 'hash');
if (token) {
    sessionStorage.setItem('authortoken', token);
}
let APP = GetQueryString('app') || GetQueryString('app', 'hash');
if (APP) {
    sessionStorage.setItem('authorapp', APP);
}
let host = GetQueryString('host') || GetQueryString('host', 'hash');
if (host) {
    host = decodeURIComponent(host);
    sessionStorage.setItem('host', host);
}

export function InitHttp() {
    axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('authortoken');
    axios.defaults.headers.common['Token'] = sessionStorage.getItem('authortoken');
    axios.defaults.headers.common['APP'] = sessionStorage.getItem('authorapp');

    axios.interceptors.request.use(config => {
        return config;
    }, error => {
        return Promise.error(error);
    });

    axios.interceptors.response.use(response => {
        CloseLoading();
        if (response.status === 200) {
            if (response.data.Code === 0) {
                return Promise.resolve(response.data)
            }
            else {
                // return Promise.resolve(response.data)
                return Promise.reject(response.data)
            }
        }
        else {
            return Promise.reject(response)
        }
    }, e => {
        CloseLoading();
        return Promise.reject(e);
    });
}

export default {
    post(url, data, failed = false) {
        return axios({
            method: 'post',
            baseURL: process.env.NODE_ENV === 'production'
                ? sessionStorage.getItem('host') : '/list',
            url,
            data: data,
            timeout: 30000
        }).then(res => res.Response).catch(e => {
            console.log(e);


            if (e.response.status === 404){
                // TODO
            } else if (e.Message) {
                !failed && Vue.prototype.$toast(e.Message);
            } else {
                !failed && Vue.prototype.$toast("请求出错，请稍候再试!");
            }

            return Promise.reject(e);
        })
    },
    get(url, params, failed = false) {
        return axios({
            method: 'get',
            baseURL: process.env.NODE_ENV === 'production'
                ? sessionStorage.getItem('host') : '/list',
            url,
            params, // get 请求时带的参数
            timeout: 30000
        }).then(res => res.Response).catch(e => {
            console.log(e);

            if (e.Message) {
                !failed && Vue.prototype.$toast(e.Message);
            } else {
                !failed && Vue.prototype.$toast("请求出错，请稍候再试!");
            }

            return Promise.reject(e);
        })
    }
};
