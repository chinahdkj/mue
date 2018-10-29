import Panel from './src/index';

Panel.install = function(Vue){
    Vue.component(Panel.name, Panel);
};

export default Panel;
