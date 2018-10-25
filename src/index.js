import Chart from '../packages/Chart/index.js';
//direcives
import resize from '../packages/directives/resize.js';
import Vant from 'vant';

const components = [Chart];

const install = function(Vue){
    // 加载Vant
    Vue.use(Vant);
    components.map(component => {
        Vue.component(component.name, component);
    });
    Vue.directive(resize.name, resize);
};

if(typeof window !== 'undefined' && window.Vue){
    install(window.Vue);
}

export default {
    version: '0.1.0',
    install,
    ...components
};


