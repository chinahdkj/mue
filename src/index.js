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
import Page from '../packages/Page/index.js';
import Datatable from '../packages/Datatable/index.js';
import Form from '../packages/Form/index.js';
import LoadMore from '../packages/LoadMore/index.js';
//direcives
import resize from '../packages/directives/resize.js';
import touch from '../packages/directives/touch.js';

import Vant, {Locale} from 'vant';
import zhCN from 'vant/lib/locale/lang/zh-CN';
import axios from 'axios'
import http, {InitHttp} from './lib/http';
import native from './lib/native';
import comm from './lib/common';

import {objectGet} from './utils/object';

Locale.use('zh-CN', zhCN);

const components = [
    Chart, Panel, RollData, RollDataGroup, DatePicker, DateRangePicker, Search, Popover, Tabs, Tab,
    Container, Header, Main, Footer, Datatable, ...Object.values(Form), LoadMore, Page
];

const install = function(Vue){
    // 加载Vant
    Vue.use(Vant);
    components.map(component => {
        Vue.component(component.name, component);
    });
    Vue.use(Loading.directive);
    Vue.directive(resize.name, resize);
    Object.entries(touch).forEach(([k, v]) => {
        Vue.directive(k, v);
    });

    Vue.prototype.$loading = Loading.service;
    Vue.prototype.$ajax = axios;
    InitHttp();
    Vue.prototype.$http = http;
    Vue.prototype.$native = native;
    Vue.prototype.$comm = comm;

    // 过滤器
    Vue.filter('OBJECT_GET', (object, expression) => {
        return objectGet(object, expression)
    });
};

if(typeof window !== 'undefined' && window.Vue){
    install(window.Vue);
}

export default {
    version: '0.1.0',
    install,
    ...components
};


