import Chart from '../packages/Chart/index.js';
import Panel from '../packages/Panel/index.js';
import {RollData, RollDataGroup} from '../packages/RollData/index.js';
import DatePicker from '../packages/DatePicker/index.js';
import DateRangePicker from '../packages/DateRangePicker/index.js';
import Search from '../packages/Search/index.js';
import Popover from '../packages/Popover/index.js';
import {Tabs, Tab} from '../packages/Tabs/index.js';
import Loading from '../packages/Loading/index.js';
//direcives
import resize from '../packages/directives/resize.js';
import Vant from 'vant';

const components = [
    Chart, Panel, RollData, RollDataGroup, DatePicker, DateRangePicker, Search, Popover, Tabs, Tab
];

const install = function(Vue){
    // 加载Vant
    Vue.use(Vant);
    components.map(component => {
        Vue.component(component.name, component);
    });
    Vue.use(Loading.directive);
    Vue.directive(resize.name, resize);

    Vue.prototype.$loading = Loading.service
};

if(typeof window !== 'undefined' && window.Vue){
    install(window.Vue);
}

export default {
    version: '0.1.0',
    install,
    ...components
};


