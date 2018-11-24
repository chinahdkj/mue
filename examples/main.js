import Vue from 'vue';
import App from './App';
import router from './router/index';
import Mue from '../src/index';
import '../themes/index.less';
import "../static/demo.less";

Vue.use(Mue);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: h => h(App),
    watch: {
        "$route.query.theme": {
            immediate: true,
            handler(v){
                if(v === "night"){
                    $("body").addClass("nightcolor");
                }
                else{
                    $("body").removeClass("nightcolor");
                }
            }
        }
    },
    mounted(){
    }
});
