import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export const InitRouter = (routes) => {
    let router = new Router({routes: routes});

    router.beforeEach((to, from, next) => {

        if(to.fullPath.indexOf('#') > -1){
            next({path: to.fullPath.replace("#", "%23")});
            return;
        }

        let mid = Vue.prototype.$comm.GetQueryString('mid') ||
            Vue.prototype.$comm.GetQueryString('mid', 'hash');
        Vue.prototype.$native.userBehaviorRecord({ // 用户行为分析
            params: {
                "mid": mid,  //菜单ID
                "name": to.meta.title, //功能名称
                "time": new Date().getTime(),   //时间戳，必须唯一
                "url": window.location.href,  //链接地址
            }
        });
        next();
    });

    return router;
};