// 开发环境设置tooken
if(process.env.NODE_ENV === "development"){
    sessionStorage.setItem("authortoken",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiI1YmEzNWZmYzkzMjQ5NTAwMjk4ZTBhN2QiLCJleHAiOjE1NzU2OTkxMDksImV4dGVuZHMiOnsieWNibG9naW4iOnsiQ2lkIjoiNWFkYThhYzE3MThkYjEwOWQ0YmM1ODI5IiwiVG9rZW4iOiI1YzA0OWRhYjcxOGRiMTM2YThkNTU4NDUifX0sInRva2VuIjoiNWJlMDQzNTRhNjRhYjcwMDEyMGViMDZkIiwidWlkIjoiNWJlMDQzMzBhNjRhYjcwMDEyMGViMDY5In0.DKcB5Y1fF8ODPsFLXZqujZ2RndlD82izoCNeVijtCpc");
    sessionStorage.setItem("authorapp", "5a9912544d4843264cb002fc");
}

import Vue from 'vue';
import App from './App';
import Mue from '../src/index';
import '../themes/index.less';
import "../static/demo.less";
import routes from './router/index';
import {InitRouter} from '../src/router';

Vue.use(Mue);

Vue.config.productionTip = false;

let router = InitRouter(routes);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: h => h(App),
    data(){
        return {theme: "day"};
    },
    watch: {
        "$route.query.theme": {
            immediate: true,
            handler(v){
                if(["night", "day"].indexOf(v) === -1){
                    return;
                }
                this.theme = v;
                sessionStorage.setItem("theme", v);
                $("body")[v === "night" ? "addClass" : "removeClass"]("nightcolor");
            }
        }
    },
    mounted(){
    }
});
