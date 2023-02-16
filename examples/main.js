// import "@babel/polyfill";
// 开发环境设置tooken
if(process.env.NODE_ENV === "development"){
    sessionStorage.setItem("authortoken",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2MiOiJoY3QiLCJjaWQiOiI2MWE1YjVkY2QzMWY3NjE2YzQxMmRkMDgiLCJleHAiOjE3MDcyOTIyNjgsInVpZCI6IjYzZTFmNmU5ZDMxZjc2MmZkMDQ2MmNlMSJ9.ThhAVOnt2v0H-dpmwrT8eE1SkvMU585QUIODVrDo0Mg");
    sessionStorage.setItem("authorapp", "61a5b5dcd31f7616c412dd08");
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
