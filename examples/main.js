// import "@babel/polyfill";
// 开发环境设置tooken
if(process.env.NODE_ENV === "development"){
    // // 8089 hu1
    sessionStorage.setItem("authortoken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2MiOiJodTEiLCJhY2NvdW50IjoiaHUxIiwiY2lkIjoiNWM5YzgxZGJmZjVjOTQyZGM4YThhY2Y2IiwiZXhwIjoxNzEyMjgxMjI5LCJncm91cCI6IjVjOWQ3YmVjZmY1Yzk0MmRjOGE4YWRkMyIsImlwIjoiMTkyLjE2OC4xMDAuMTc5IiwibW9iaWxlIjoiMTM3MzY0NDAzNTgiLCJuYW1lIjoiaHUxIiwicm9sZXMiOlsiNWM5Y2E2OGNmZjVjOTQyZGM4YThhZDQ2Il0sInNuIjoiSEQzMTkiLCJ1aWQiOiI2M2VkYTM1NDM1MGFkNjE4MjdhYTU3MjMifQ.2TlYv4emZv3RIEQjk8_Bg1TF1z0-J8LDy6lAhWE5oaE");
    sessionStorage.setItem("authorapp",  "5c9c81dbff5c942dc8a8acf6");
    sessionStorage.setItem("appid",  "634f631e350ad66439c3c894");
}

import Vue from "vue";
import App from "./App";
import Mue from "../src/index";
import "../themes/index.less";
import "./assets/demo.less";
import router from "./router/index";

let lang = window.localStorage.getItem("language");
Vue.use(Mue, {lang: lang});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: "#app",
    router,
    render(h){
        if(this.unload){
            return;
        }
        return h(App);
    },
    data(){
        return {theme: "day", unload: false, lang: lang};
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
        window.addEventListener("beforeunload", () => {
            this.unload = true;
        });
    }
});
