import Tabs from './src/index';
import Tab from './src/tab';

Tabs.install = function(Vue){
    Vue.component(Tabs.name, Tabs);
};

Tab.install = function(Vue){
    Vue.component(Tab.name, Tab);
};

export {Tabs, Tab};
