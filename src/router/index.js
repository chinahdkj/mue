import native from "../lib/native";
import {GetQueryString} from "../lib/common";
import Vue from 'vue';
import Router from 'vue-router';

export const InitHook = (router) => {
    router.beforeEach((to, from, next) => {

        if(to.fullPath.indexOf('#') > -1){
            next({path: to.fullPath.replace("#", "%23")});
            return;
        }

        let mid = GetQueryString('mid') || GetQueryString('mid', 'hash');
        native.userBehaviorRecord({ // 用户行为分析
            params: {
                "mid": mid,  //菜单ID
                "name": (to.meta || {}).title || "", //功能名称
                "time": new Date().getTime(),   //时间戳，必须唯一
                "url": window.location.href,  //链接地址
            }
        });
        next();
    });
};



export const InitRouter = (routes) => {
    Vue.use(Router);
    let router = new Router({routes: routes});

    InitHook(router);

    return router;
};
