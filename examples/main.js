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
