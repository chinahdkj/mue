import Chart from '../packages/Chart/index.js';
import Panel from '../packages/Panel/index.js';
import {RollData, RollDataGroup} from '../packages/RollData/index.js';
import DatePicker from '../packages/DatePicker/index.js';
import DateRangePicker from '../packages/DateRangePicker/index.js';
//direcives
import resize from '../packages/directives/resize.js';
import Vant from 'vant';

const components = [Chart, Panel, RollData, RollDataGroup, DatePicker, DateRangePicker];

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


