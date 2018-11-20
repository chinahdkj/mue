import Chart from '../packages/Chart/index.js';
import Panel from '../packages/Panel/index.js';
import {RollData, RollDataGroup} from '../packages/RollData/index.js';
import DatePicker from '../packages/DatePicker/index.js';
import DateRangePicker from '../packages/DateRangePicker/index.js';
import Search from '../packages/Search/index.js';
import Popover from '../packages/Popover/index.js';
import {Tab, Tabs} from '../packages/Tabs/index.js';
import Loading from '../packages/Loading/index.js';
import {Container, Footer, Header, Main} from '../packages/Container/index.js';
import Datatable from '../packages/Datatable/index.js';
//direcives
import resize from '../packages/directives/resize.js';
import Vant from 'vant';

import axios from 'axios'
import http from './lib/http';
import native from './lib/native';
import comm from './lib/common';

const components = [
    Chart, Panel, RollData, RollDataGroup, DatePicker, DateRangePicker, Search, Popover, Tabs, Tab,
    Container, Header, Main, Footer, Datatable
];

const install = function(Vue){
    // 加载Vant
    Vue.use(Vant);
    components.map(component => {
        Vue.component(component.name, component);
    });
    Vue.use(Loading.directive);
    Vue.directive(resize.name, resize);

    Vue.prototype.$loading = Loading.service;
    Vue.prototype.$ajax = axios;
    Vue.prototype.$http = http;
    Vue.prototype.$native = native;
    Vue.prototype.$comm = comm;
};

if(typeof window !== 'undefined' && window.Vue){
    install(window.Vue);
}

export default {
    version: '0.1.0',
    install,
    ...components
};


