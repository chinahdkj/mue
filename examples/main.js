import "@babel/polyfill";
// 开发环境设置tooken
if(process.env.NODE_ENV === "development"){
    sessionStorage.setItem("authortoken",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Nzk0MTAwODcsImV4dGVuZHMiOnsieWNibG9naW4iOm51bGx9LCJ0b2tlbiI6IjViYzZkYzUxZTQzM2M3MDAxNTM4ZWIwNiIsInVpZCI6IjViYzZkYzUxZTQzM2M3MDAxNTM4ZWIwNSJ9.fypJ3x2nEjrC9NoeR_En9LfldHCyZ4y_XfhdUjexa68");
    sessionStorage.setItem("authorapp", "5ba35ffc93249500298e0a7d");
}

import Vue from 'vue';
import App from './App';
import Mue from '../src/index';
import '../themes/index.less';
import "./assets/demo.less";
import router from './router/index';

Vue.use(Mue);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render(h){
        if(this.unload){
            return;
        }
        return h(App);
    },
    data(){
        return {theme: "day", unload: false};
    },
    watch: {
        "$route.query.theme": {
            immediate: true,
            handler(v){
                if(["night", "day"].indexOf(v) !== -1){
                    sessionStorage.setItem("theme", v);
                }
                v = sessionStorage.getItem("theme");
                this.theme = v;
                $("body")[v === "night" ? "addClass" : "removeClass"]("nightcolor");
            }
        }
    },
    mounted(){
        window.addEventListener("beforeunload", ()=>{
            this.unload = true;
        });
    }
});
