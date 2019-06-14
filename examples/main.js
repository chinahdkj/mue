import "@babel/polyfill";
// 开发环境设置tooken
if(process.env.NODE_ENV === "development"){
    sessionStorage.setItem("authortoken",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTA4MjQzMjMsInQiOjE1NTkyODgzMjIsInVpZCI6ImJkZGRhYjJmLTBmNTgtNDY2My05ODk5LTFlZjNmNzNkYmNiYyJ9.vDrWvN5QV28AVQMS6QYjp66K1-BqDzvQkyfSP5JbAps");
    sessionStorage.setItem("authorapp", "5a9912544d4843264cb002fc");
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
